//References: *NOTE* - A lot of this page was developed in conjunction with ChatGPT. Model - o4. Mainly involves SQL queries, is referenced below
//1. https://devdotcode.com/complete-jwt-authentication-and-authorization-system-for-mysql-node-js-api/
//2. https://www.youtube.com/watch?v=V5xoeyOtgIA&t=984s&ab_channel=Webslesson
//3. https://blog.logrocket.com/build-rest-api-node-express-mysql/
//4. https://www.youtube.com/watch?v=jtHS3OC64V4&ab_channel=ARCTutorials
//5. https://www.youtube.com/watch?v=88hYFUpNJ8A&ab_channel=ARCTutorials


//Imports dependencies + sets up environment
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


//Sets up express app on port 2000
const app = express();
const PORT = process.env.PORT || 2000;
const SECRET_KEY = process.env.JWT_SECRET || "e540bca8971e2f90ff4b8c7289d67c7d32a8a98f362f2e09bba2dcf90b278bde82890a8b907af3b8eae89d69c2f7dcf7";

//Middleware
app.use(cors());
app.use(express.json());

//Connects to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Logs errors for troubleshooting
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

//Middleware that verifies the JWT token. Extracts JWT toke, verifies it, and attaches user data to the request
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token || !token.startsWith("Bearer ")) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, customer) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.customer = customer;
    next();
  });
};

//Ensures user enters a username and password, hashes their password using bcrypt, stores username, password + user type in DB
app.post("/signup", async (req, res) => {
  const { username, password, user_type } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }


  const validUserTypes = ["customer", "retailer"];
  const accountType = validUserTypes.includes(user_type) ? user_type : "customer";

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = "INSERT INTO customer (username, password, user_type) VALUES (?, ?, ?)";
  
  db.query(query, [username, hashedPassword, accountType], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ message: `Registered as a ${accountType}!` });
  });
});


//Customer Login. Retrieves user data from DB, compares hashed password with entered password, and generates a JWT token. 
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 🔹 Hardcoded login for Admin and Advertiser (Bypasses DB)
  if (username === "Admin" && password === "1234") {
    return res.json({ message: "Login successful", user_type: "admin" });
  }

  if (username === "Advertiser" && password === "1234") {
    return res.json({ message: "Login successful", user_type: "advertiser" });
  }

  // 🔹 Database authentication for Customers & Retailers
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

    // Logs errors for troubleshooting
    console.log("Stored Password (Hashed):", customer.password);
    console.log("Entered Password (Plain):", password);

    try {
      const match = await bcrypt.compare(password, customer.password); 
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generates JWT token for customers and retailers
      const token = jwt.sign(
        { cust_id: customer.cust_id, username: customer.username, user_type: customer.user_type },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Returns JWT + user type
      res.json({ message: "Login successful", token, user_type: customer.user_type });
    } catch (error) {
      res.status(500).json({ error: "Error verifying password" });
    }
  });
});




//Gets customer details using cust_id
app.get("/customer", authenticateToken, (req, res) => {
  const query = "SELECT cust_id, username FROM customer WHERE cust_id = ?";
  db.query(query, [req.customer.cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Customer not found" });
    res.json(results[0]);
  });
});

//*NOTE* - This feature was developed in conjunction with Chatgpt. Model - o4. Prompt: "Create a route that allows a user to view their cart items. The route should return the product name, price, quantity, and image URL for each item in the cart. There are two different tables which store the desired data; cart and products  The route should require user authentication using a JWT token."
//Gets cart by joining cart + products tables together
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


//*NOTE* - This feature was developed in conjunction with Chatgpt. Model - o4. Prompt: "Create a route that allows a user to add an item to their cart. The route should require user authentication using a JWT token. The route should accept the following fields: product_id, quantity, preload_amount, custom_message, and image_url. If the item already exists in the cart, the route should update the quantity of the item. If the item does not exist in the cart, the route should add the item to the cart."
//Adds item to the users cart. If it already exists, it updates the quantity
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

  //Indicates success to user
  db.query(query, [cust_id, product_id, quantity, preload_amount || 0, custom_message || null, image_url || null], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item added to cart with personalization!" });
  });
});


//*NOTE* - This feature was developed in conjunction with Chatgpt. Model - o4. Prompt: "Create a route that allows a user to checkout. The route should calculate the total price of the items in the cart, create an order, move the items from the cart to the order_items table, clear the cart, and update the order status to 'Completed'. The route should require user authentication using a JWT token."
//Calculates total price of items in cart, creates an order, moves items from cart to order_items, clears cart, and updates order status
app.post("/checkout", authenticateToken, (req, res) => {
  const cust_id = req.customer.cust_id;

  //Calculates total price of items in cart
  const totalQuery = `
    SELECT SUM((p.price * c.quantity) + c.preload_amount) AS total_price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.cust_id = ?;
  `;

  //Makes sure cart is not empty
  db.query(totalQuery, [cust_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalPrice = results[0].total_price || 0;
    if (totalPrice === 0) {
      return res.status(400).json({ error: "Cart is empty. Cannot checkout." });
    }

    //*NOTE* - This feature was developed in conjunction with Chatgpt. Model - o4. Prompt: Continuation of checkout prompt
    //Creates order
    const insertOrderQuery = `INSERT INTO orders (cust_id, total_price, status) VALUES (?, ?, 'Pending')`;
    db.query(insertOrderQuery, [cust_id, totalPrice], (err, orderResult) => {
      if (err) return res.status(500).json({ error: err.message });

      
      const order_id = orderResult.insertId;

      //Moves items from cart to order_items
      const moveItemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, preload_amount, custom_message, image_url)
        SELECT ?, c.product_id, c.quantity, c.preload_amount, c.custom_message, c.image_url 
        FROM cart c WHERE c.cust_id = ?;
      `;

    
      db.query(moveItemsQuery, [order_id, cust_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });


        //Clears cart
        const clearCartQuery = `DELETE FROM cart WHERE cust_id = ?;`;
        db.query(clearCartQuery, [cust_id], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          //Updates order status from pending to completed 
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


//Reporting Feature setup
//Fetches total number of users grouped by type
app.get("/reports/user-count", (req, res) => {
  const query = "SELECT user_type, COUNT(*) as count FROM customer GROUP BY user_type";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//Fetches total sales and most purchased HyCards
app.get("/reports/sales-summary", (req, res) => {
  const query = `
    SELECT p.name, COUNT(*) AS total_purchases 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id
    ORDER BY total_purchases DESC
    LIMIT 5;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    //Fetches total sales amount
    const totalSalesQuery = `SELECT SUM(total_price) AS total_sales FROM orders WHERE status = 'Completed'`;
    db.query(totalSalesQuery, (err, salesResults) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        total_sales: salesResults[0]?.total_sales || 0,
        top_products: results
      });
    });
  });
});

//Stores latest published report in memory
let publishedReport = null;

//Admin Publishes Report
app.post("/reports/publish", (req, res) => {
  const { reportData } = req.body;
  publishedReport = reportData;
  res.json({ message: "Report published successfully!" });
});

//Advertiser Fetches Published Report
app.get("/reports/published", (req, res) => {
  if (!publishedReport) return res.status(404).json({ error: "No reports published yet." });
  res.json({ report: publishedReport });
});



//Fetches all products for home page
app.get("/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//Fetches product by ID for individual product page
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

//Default Route
app.get("/", (req, res) => {
  res.send("Express server is running");
});

//Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
