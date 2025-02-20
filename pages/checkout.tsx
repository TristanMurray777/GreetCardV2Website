import { useEffect, useState } from "react";
import { checkout } from "../utils/api";
import "../styles/globals.css";

export default function Checkout() {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function processCheckout() {
      try {
        const token = localStorage.getItem("token");
        const response = await checkout(token);
        setTotal(response.data.total);
      } catch (err) {
        setError("Checkout failed.");
      } finally {
        setLoading(false);
      }
    }
    processCheckout();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Processing checkout...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold">Checkout Complete ✅</h1>
        <p className="text-lg text-gray-700 mt-4">
          Your total payment: <span className="font-semibold text-blue-600">€{total?.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
