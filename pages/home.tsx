//References: 1: Full E-Commerce App Tutorial: https://www.youtube.com/watch?v=I0BOUiFe9WY&ab_channel=LamaDev
//2: Implementing bulk order feature (Limiting results): https://dev.to/rifkyalfarez/nextjs-api-management-implement-search-pagination-filter-sort-and-limit-features-411i
//3: Implementing bulk order feature: ChatGPT. Model - o4. Prompt: "Help me to add a bulk order feature for a retailer to my react.js project."
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, addToCart } from "../utils/api"; 
import "../styles/globals.css";

//Defines the product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function Home() {
  //Declares variables
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<string | null>(null);
  const [bulkQuantities, setBulkQuantities] = useState<{ [key: number]: number }>({});
  const [message, setMessage] = useState("");

  //Fetches products from the backend. If successful, sets products to the response data. If not, sets error message
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();

    //Gets user type from localStorage
    const storedUserType = localStorage.getItem("user_type");
    setUserType(storedUserType);
  }, []);

  //*Note* The bulk order feature was developed in conjunction with ChatGPT. Model - o4. Prompt: Help me to add a bulk order feature for a retailer to my react.js project.
  //Handles bulk quantity input change. Stores the quantity in bulkQuantities 
  const handleBulkQuantityChange = (productId: number, quantity: number) => {
    setBulkQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  //Handles bulk order. Checks if user is logged in. Defaults the quantity to 10. Calls addToCart API. If successful, displays success message
  const handleBulkOrder = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in to place a bulk order.");
      return;
    }
  
    const quantity = bulkQuantities[productId] || 10; 
  
    try {
      await addToCart(productId, quantity, 0, "", "", token); 
      setMessage(`✅ Bulk order of ${quantity} items added to cart successfully!`);
    } catch (err: any) {
      console.error("🚨 Bulk Order API Error:", err.response?.data || err.message);
      setMessage(`❌ Failed to add bulk order: ${err.response?.data?.error || err.message}`);
    }
  };
  
  
  //Displays UI for homepage
  return (
    //Header + View Cart button
    <div className="min-h-screen p-6">
      <h1 className="text-3xl text-white font-bold text-center mb-8">Welcome to HyStore!</h1>
      <h2 className="text-2xl text-white font-semibold text-center mb-4">
        Please browse our featured products below. When you see one you like, add it to your cart and checkout!
      </h2>
      <div className="flex justify-end">
        <Link href="/cart">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mb-4">
            View Cart 🛒
          </button>
        </Link>
      </div>

      {/* Displays success/error message */}  
      {message && <p className="text-center text-green-600">{message}</p>} 

      {loading ? (
        <p className="text-center text-gray-600">Loading products...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>

        //Displays product images, names + prices. 
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-lg">
              <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-md" />
              <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
              <p className="text-gray-600">€{product.price ? Number(product.price).toFixed(2) : "0.00"}</p>
              <Link href={`/hycard/${product.id}`}>
                <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                  View Details
                </button>
              </Link>

              {/* Retailer Bulk Order Option. Displays only if the user is a retailer. */}
              {userType === "retailer" && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Retailer Bulk Order</p>
                  <input
                    type="number"
                    min="10"
                    placeholder="Bulk Quantity"
                    value={bulkQuantities[product.id] || ""}
                    onChange={(e) => handleBulkQuantityChange(product.id, parseInt(e.target.value) || 10)}
                    className="border p-2 w-full rounded-md"
                  />
                  <button
                    onClick={() => handleBulkOrder(product.id)}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Add Bulk Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
