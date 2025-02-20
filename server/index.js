require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 2000;
const SECRET_KEY = process.env.JWT_SECRET || "e540bca8971e2f90ff4b8c7289d67c7d32a8a98f362f2e09bba2dcf90b278bde82890a8b907af3b8eae89d69c2f7dcf7";

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, customer) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.customer = customer;
    next();
  });
};

// Customer Signup
app.post("/signup", async (req, res) => {
  const { username, password, user_type } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Ensure user_type is either 'customer' or 'retailer'
  const validUserTypes = ["customer", "retailer"];
  const accountType = validUserTypes.includes(user_type) ? user_type : "customer";

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = "INSERT INTO customer (username, password, user_type) VALUES (?, ?, ?)";
  
  db.query(query, [username, hashedPassword, accountType], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ message: `Registered as a ${accountType}!` });
  });
});


// Customer Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const query = "SELECT cust_id, username, password, user_type FROM customer WHERE username = ?";
  
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const customer = results[0];
    const match = await bcrypt.compare(password, customer.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { cust_id: customer.cust_id, username: customer.username, user_type: customer.user_type },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user_type: customer.user_type });
  });
});


// Protected Route: Get Customer Details
app.get("/customer", authenticateToken, (req, res) => {
  const query = "SELECT cust_id, username FROM customer WHERE cust_id = ?";
  db.query(query, [req.customer.cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Customer not found" });
    res.json(results[0]);
  });
});

// Protected Route: Get Cart Items
app.get("/cart", authenticateToken, (req, res) => {
  const query = `
    SELECT c.id, p.name, p.price, c.quantity, p.image_url, c.preload_amount
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.cust_id = ?;
  `;
  db.query(query, [req.customer.cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Protected Route: Add Item to Cart
app.post("/cart", authenticateToken, (req, res) => {
  const { product_id, quantity, preload_amount, custom_message, image_url } = req.body;
  const cust_id = req.customer.cust_id;
  
  if (!product_id || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO cart (cust_id, product_id, quantity, preload_amount, custom_message, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    quantity = quantity + VALUES(quantity), 
    preload_amount = VALUES(preload_amount),
    custom_message = VALUES(custom_message),
    image_url = VALUES(image_url);
  `;

  db.query(query, [cust_id, product_id, quantity, preload_amount || 0, custom_message || null, image_url || null], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item added to cart with personalization!" });
  });
});


// Get Customer Order History
app.get("/orders", authenticateToken, (req, res) => {
  const query = `
    SELECT o.id AS order_id, o.status, o.created_at, 
           p.name AS product_name, oi.quantity, p.price 
    FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    JOIN products p ON oi.product_id = p.id 
    WHERE o.cust_id = ? 
    ORDER BY o.created_at DESC
  `;
  
  db.query(query, [req.customer.cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/checkout", authenticateToken, (req, res) => {
  const cust_id = req.customer.cust_id;

  const totalQuery = `
    SELECT SUM((p.price * c.quantity) + c.preload_amount) AS total_price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.cust_id = ?;
  `;

  db.query(totalQuery, [cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalPrice = results[0].total_price || 0;
    if (totalPrice === 0) {
      return res.status(400).json({ error: "Cart is empty. Cannot checkout." });
    }

    const insertOrderQuery = `INSERT INTO orders (cust_id, total_price, status) VALUES (?, ?, 'Pending')`;
    db.query(insertOrderQuery, [cust_id, totalPrice], (err, orderResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const order_id = orderResult.insertId;

      const moveItemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, preload_amount, custom_message, image_url)
        SELECT ?, c.product_id, c.quantity, c.preload_amount, c.custom_message, c.image_url 
        FROM cart c WHERE c.cust_id = ?;
      `;

      db.query(moveItemsQuery, [order_id, cust_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const clearCartQuery = `DELETE FROM cart WHERE cust_id = ?;`;
        db.query(clearCartQuery, [cust_id], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          const updateOrderStatusQuery = `UPDATE orders SET status = 'Completed' WHERE id = ?;`;
          db.query(updateOrderStatusQuery, [order_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Checkout successful!", total: totalPrice, order_id, status: "Completed" });
          });
        });
      });
    });
  });
});


app.get("/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  const query = "SELECT * FROM products WHERE id = ?";
  db.query(query, [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json(results[0]);
  });
});

// Default Route
app.get("/", (req, res) => {
  res.send("Express server is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
