//References: 1: https://blog.logrocket.com/guide-next-js-layouts-nested-layouts/
//2: https://www.youtube.com/watch?v=8s4DK5PkRNQ&ab_channel=BrettWestwood-SoftwareEngineer
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logout } from "../utils/api"; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedUserType = localStorage.getItem("user_type");

      setIsAuthenticated(!!token || storedUserType === "admin" || storedUserType === "advertiser");
      setUserType(storedUserType);
    };

    // Run immediately when component mounts
    checkAuthStatus();

    // Listen for storage changes (when user logs in or logs out)
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_type"); // Ensure user type is cleared
    setIsAuthenticated(false);
    setUserType(null);

    // Dispatch event to notify components about logout
    window.dispatchEvent(new Event("storage"));

    alert("You have been logged out.");
    setIsOpen(false);
    router.push("/login"); 
  };

  return (
    <>
      {/* Navbar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[1000] bg-gray-800 text-white p-3 rounded-md focus:outline-none"
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg p-6 z-[1001]`}
        style={{ position: "fixed" }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-300 text-xl"
        >
          ✖
        </button>

        <nav className="mt-20 space-y-6">
          {/* If user is not authenticated, show Sign Up / Login */}
          {!isAuthenticated ? (
            <>
              <Link href="/signup">
                <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
                  Sign Up
                </p>
              </Link>
              <Link href="/login">
                <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
                  Login
                </p>
              </Link>
            </>
          ) : (
            <p
              onClick={handleLogout}
              className="block py-2 px-4 rounded-md hover:bg-red-700 cursor-pointer"
            >
              Logout
            </p>
          )}

          {/* General Navigation */}
          <Link href="/home">
            <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
              Home
            </p>
          </Link>
          <Link href="/cart">
            <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
              View Cart
            </p>
          </Link>
          <Link href="/checkout">
            <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
              Checkout
            </p>
          </Link>

          {/* Conditional Navigation for Admin and Advertiser */}
          {userType === "admin" && (
            <Link href="/adminDashboard">
              <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer">
                📊 Admin Dashboard
              </p>
            </Link>
          )}
          {userType === "advertiser" && (
            <Link href="/advertiserDashboard">
              <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-green-700 cursor-pointer">
                📈 Advertiser Dashboard
              </p>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
