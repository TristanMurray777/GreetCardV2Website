import { useEffect, useState } from "react";
import { getCart } from "../utils/api";
import "../styles/globals.css";
import { useRouter } from "next/router";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  preload_amount?: number; // ✅ Include the pre-load amount
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchCart() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await getCart(token);
        setCart(response.data);
      } catch (err) {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity) + (item.preload_amount || 0), 0).toFixed(2);
  };

  if (loading) return <p className="text-center text-gray-600">Loading cart...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart 🛒</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-4">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">${item.price ? Number(item.price).toFixed(2) : "0.00"} x {item.quantity}</p>
                  {item.preload_amount && item.preload_amount > 0 && (
                    <p className="text-green-600">Pre-loaded: ${Number(item.preload_amount).toFixed(2)}</p>
                  )}
                </div>
              </div>
              <p className="text-lg font-semibold">${(Number(item.price) * item.quantity + (item.preload_amount || 0)).toFixed(2)}</p>
            </div>
          ))}

          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold">Total: ${calculateTotal()}</h2>
            <button
              onClick={() => router.push("/home")}
              className="mt-4 mr-5 bg-gray-600 text-white px-14 py-2 rounded-md hover:bg-gray-700 transition">
              Go Back
            </button>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
