import axios from "axios";
import { jwtDecode } from "jwt-decode";


const API_BASE_URL = "http://192.168.1.16:2000";

// User Authentication
export const signup = async (username, password) => {
  return axios.post(`${API_BASE_URL}/signup`, { username, password });
};

export const login = async (username, password) => {
  return axios.post(`${API_BASE_URL}/login`, { username, password });
};

export const logout = () => {
  localStorage.removeItem("token"); // ✅ Remove JWT token
};


// Fetch Products
export const getProducts = async () => {
  return axios.get(`${API_BASE_URL}/products`);
};

export const getProductById = async (id) => {
  return axios.get(`${API_BASE_URL}/products/${id}`);
};

// Cart Actions
export const getCart = async (token) => {
  return axios.get(`${API_BASE_URL}/cart`,
 { headers: { Authorization: `Bearer ${token}` },
  });
};

export const addToCart = async (product_id, quantity, preload_amount, token) => {
    if (!token) throw new Error("User not authenticated");
  
    try {
      const decoded = jwtDecode(token); // Decode JWT
      const cust_id = decoded.cust_id; // Extract `cust_id`
  
      return axios.post(
        `${API_BASE_URL}/cart`,
        { cust_id, product_id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error decoding token:", err);
      throw new Error("Invalid token");
    }
  };
  

// Checkout
export const checkout = async (token) => {
  return axios.post(`${API_BASE_URL}/checkout`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Order History
export const getOrders = async (token) => {
  return axios.get(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

