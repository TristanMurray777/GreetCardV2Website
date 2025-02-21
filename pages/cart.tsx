//References: 1: https://blog.logrocket.com/building-a-next-js-shopping-cart-app/
//2: https://www.youtube.com/watch?v=aAldUjdRyPA&t=629s&ab_channel=TechCheck
//3: https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/#6
//4: https://www.youtube.com/watch?v=I0BOUiFe9WY&ab_channel=LamaDev

import { useEffect, useState } from "react";
import { getCart } from "../utils/api";
import "../styles/globals.css";
import { useRouter } from "next/router";

//Defines structure of each cart item
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  preload_amount?: number; 
  custom_message?: string; 
  uploaded_image?: string; 
}

export default function Cart() {
  //Manages state of cart. First initializes as empty array
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  //Retrieves JWT from localstorage, vaidates it and fetches cart data
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

  //Calculates total cost of all items in cart. If card is not preloaded, preload_amount defaults to 0. *Note* This function was developed in conjunction with ChatGPT. Model - o4. Prompt: Help me to calculate the total cost of all items in a react.js shopping cart. 
  const calculateTotal = () => {
    return cart.reduce((sum, item) => 
      sum + (Number(item.price) * item.quantity) + Number(item.preload_amount || 0), 0
    ).toFixed(2);
  };

  //Troubleshooting
  if (loading) return <p className="text-center text-gray-600">Loading cart...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;


  //Displays cart items
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-white mb-8">Your Cart 🛒</h1>
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
                  <p className="text-gray-600">€{item.price ? Number(item.price).toFixed(2) : "0.00"} x {item.quantity}</p>

                   {/* Displays custom message if added by user */}
                  {item.preload_amount && item.preload_amount > 0 && (
                    <p className="text-green-600">Pre-loaded: €{Number(item.preload_amount).toFixed(2)}</p>
                  )}

                  {/* Displays custom message if added by user */}
                  {item.custom_message && (
                    <p className="text-gray-600 italic">"📜 {item.custom_message}"</p>
                  )}

                  {/* Displays image if added by user */}
                  {item.uploaded_image && (
                    <img src={item.uploaded_image} alt="Uploaded Image" className="mt-2 w-24 h-24 object-cover rounded-md" />
                  )}
                </div>
              </div>

               {/* Calculates total price*/}
              <p className="text-lg font-semibold">
                €{((Number(item.price) * item.quantity) + Number(item.preload_amount || 0)).toFixed(2)}
              </p>
            </div>
          ))}

          {/* Returns total price */}
          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold">Total: €{calculateTotal()}</h2>

            {/* General Navigation */}
            <button
              onClick={() => router.push("/home")}
              className="mt-4 mr-5 bg-gray-600 text-white px-14 py-2 rounded-md hover:bg-gray-700 transition">
              Go Back
            </button>
            
            <button 
              onClick={() => router.push("/checkout")}  
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Checkout
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
