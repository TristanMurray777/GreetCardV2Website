import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logout } from "../utils/api"; 


//Navbar that allows users to navigate. 
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    //Checks if user is logged in 
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    alert("You have been logged out.");

    //Closes sidebar when a user logs out and redirect them to the login pg.
    setIsOpen(false); 

    router.push("/login"); 
  };

  //Navbars design. 
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[100] bg-gray-800 text-white p-3 rounded-md focus:outline-none"
      >
        ☰
      </button>

     
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg p-6`}
      >
     
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-300 text-xl"
        >
          ✖
        </button>

      




       
<nav className="mt-20 space-y-6">

  {/* Checks if user is logged in or not. If they are, shows Logout. If they're not, shows sign up. */}
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

  {/* General navigation*/}
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
</nav>

      </div>
    </>
  );
}
