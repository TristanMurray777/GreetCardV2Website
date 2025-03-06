//References: 1. React Routing: https://reactrouter.com/home
//2: React Login/Signup page: https://www.youtube.com/watch?v=j4Ms4CSDR60&ab_channel=CodingPartner
//3: JWT Management: https://devdotcode.com/complete-jwt-authentication-and-authorization-system-for-mysql-node-js-api/

import { useState } from "react";
import { useRouter } from "next/router";
import { signup } from "../utils/api";

export default function Signup() {
  //Declares variables. Stores account type, username, password.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("customer");
  const [error, setError] = useState("");
  const router = useRouter();

  //Handles signup. Calls signup API. If successful, redirects user to login page. If not, displays error
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await signup(username, password, userType);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  //Displays UI for signup form. Captures username, password and account type. Uses the signup button to trigger handleSignup
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
        {error && <p className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Account Type</label>
            <select value={userType} onChange={(e) => setUserType(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="customer">Customer</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}
