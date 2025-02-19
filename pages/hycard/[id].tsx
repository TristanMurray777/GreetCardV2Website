import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getProductById, addToCart } from "../../utils/api";
import "../../styles/globals.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}


export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1); // New state for quantity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const response = await getProductById(id as string);
        setProduct(response.data); // ✅ Make sure this matches Product type
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);
  

  const handleAddToCart = async () => {
    setMessage(""); // Reset message
    if (!product) return; // Prevents TypeScript error
    try {
      const token = localStorage.getItem("token"); // Retrieve JWT token
      await addToCart(product.id, quantity, token); // Send selected quantity
      setMessage("✅ Item added to cart! 🛒");
    } catch (err) {
      setMessage("❌ Failed to add item to cart.");
    }
  };
  

  if (loading) return <p className="text-center text-gray-600">Loading product...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover rounded-md" />
        <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-semibold text-blue-600 mt-4">${product.price}</p>

        {/* Quantity Selector */}
        <div className="mt-4">
          <label className="block text-gray-600 mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Add to Cart 🛒
        </button>

        {message && <p className="mt-2 text-center text-green-600">{message}</p>}
      </div>
    </div>
  );
}
