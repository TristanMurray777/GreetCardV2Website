import axios from "axios";

const API_BASE_URL = "http://192.168.1.16:2000";

// User Authentication
export const signup = async (username, password) => {
  return axios.post(`${API_BASE_URL}/signup`, { username, password });
};

export const login = async (username, password) => {
  return axios.post(`${API_BASE_URL}/login`, { username, password });
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

export const addToCart = async (product_id, quantity, token) => {
    return axios.post(`${API_BASE_URL}/cart`,
      { cust_id: 1, product_id, quantity }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
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

