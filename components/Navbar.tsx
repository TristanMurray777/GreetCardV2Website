import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logout } from "../utils/api"; // ✅ Import logout function

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ✅ Check if user is logged in (JWT exists in localStorage)
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    alert("You have been logged out.");
    setIsOpen(false); // ✅ Close sidebar on logout
    router.push("/login"); // ✅ Redirect to login page after logout
  };

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[100] bg-gray-800 text-white p-3 rounded-md focus:outline-none"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg p-6`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-300 text-xl"
        >
          ✖
        </button>

      




       {/* Menu Links */}
<nav className="mt-20 space-y-6">


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
  <Link href="#">
    <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
      Create Personalised HyCard (Coming Soon)
    </p>
  </Link>
  <Link href="/checkout">
    <p onClick={() => setIsOpen(false)} className="block py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer">
      Checkout 
    </p>
  </Link>
</nav>

      </div>
    </>
  );
}
