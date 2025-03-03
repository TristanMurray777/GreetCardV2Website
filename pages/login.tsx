//References: 1. https://www.youtube.com/watch?v=WNZbARN7lMM&ab_channel=AaronSaunders
//2. https://www.youtube.com/watch?v=aAldUjdRyPA&t=629s&ab_channel=TechCheck
//3. https://www.youtube.com/watch?v=j4Ms4CSDR60&ab_channel=CodingPartner

import { useState } from "react";
import { useRouter } from "next/router";
import { login } from "../utils/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  //Handles login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await login(username, password);
  
      // Stores user type in localStorage for navigation
      localStorage.setItem("user_type", response.data.user_type);
  
      // Stores JWT for authentication if user is a customer/retailer
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
  
      // Dispatch a custom event to notify other components (like Navbar) about login status
      window.dispatchEvent(new Event("storage"));
  
      // Redirect user based on role
      if (response.data.user_type === "admin") {
        router.push("/adminDashboard");
      } else if (response.data.user_type === "advertiser") {
        router.push("/advertiserDashboard");
      } else {
        router.push("/home"); 
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Login</h2>
        {error && <p className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-lg"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Signup</a>
        </p>
      </div>
    </div>
  );
}
