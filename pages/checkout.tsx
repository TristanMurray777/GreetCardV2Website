//References: 1: Custom checkout page: https://www.youtube.com/watch?v=6rE3SO28Csg&ab_channel=Roman
//2: Full E-Commerce App Tutorial: https://www.youtube.com/watch?v=I0BOUiFe9WY&ab_channel=LamaDev
import { useState } from "react";
import { checkout } from "../utils/api";
import { useRouter } from "next/router";

export default function Checkout() {
  //Declares variables
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [address, setAddress] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();


  //Handles the checkout process. Ensures name, cardno and address are filled in. Checks JWT token. Calls checkout token from backend. If all is successful, stores the payment + displays success message
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !cardNumber || !address) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated");

      console.log("Checkout token:", token); //Debugging log

      //Gets user type
      const storedUserType = localStorage.getItem("user_type");

      //Fetches cart total price
      const response = await checkout(token);
      console.log("Checkout API Response:", response); //Debugging log

      //Ensure response is successful
      if (response.status === 200 && response.data?.total !== undefined) {
        let finalTotal = parseFloat(response.data.total); //Converts string to number

        //Applies 20% discount if user is a retailer
        if (storedUserType === "retailer") {
          finalTotal *= 0.8;
        }

        setTotal(finalTotal); //Ensures number type is set
        setFormSubmitted(true);
        setError(""); //Clears any previous errors
      } else {
        console.error("Unexpected API response format:", response);
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setError("An error occurred during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
};


  //Displays UI for checkout form
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        

        {/* Displays checkout complete message if the form is submitted successfuly */}
        {formSubmitted ? (
          <>
            <h1 className="text-2xl font-bold">Checkout Complete ✅</h1>
            <p className="text-lg text-gray-700 mt-4">
              Your total payment: <span className="font-semibold text-blue-600">€{Number(total || 0).toFixed(2)}</span>
            </p>
            <button
              onClick={() => router.push("/home")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Return to Store
            </button>
          </>
        ) : (
          <>

            {/* Displays checkout form if user has not submitted it*/}
            <h1 className="text-2xl font-bold">Enter Checkout Details</h1>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <form onSubmit={handleCheckout} className="space-y-4 mt-4 text-left">
              

              {/* Name, card number and address fields */}
              <div>
                <label className="block text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  maxLength={19} 
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"

                  //Prevents user from entering anything other than numbers and spaces
                  onKeyDown={(e) => {
                    if (!/[\d ]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
                
                {/* Displays address field */}
              <div>
                <label className="block text-gray-600 mb-1">Shipping Address</label>
                <textarea
                  placeholder="Enter your shipping address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
                
                {/* Displays order button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition text-lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
