import axios from "axios";

//Sets API base url so that it can be changes easily
const API_BASE_URL = "http://192.168.1.16:2000";

//Sends post request to /signup with user details
export const signup = async (username, password, user_type) => {
  return axios.post(`${API_BASE_URL}/signup`, { username, password, user_type });
};

//Sends a post request to /login with user details. Also stores JWT in localStorage
export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user_type", response.data.user_type); // Store user type
  return response;
};

//Logs user out by removing their JWT
export const logout = () => {
  localStorage.removeItem("token"); 
};

//Fetches all products using get request
export const getProducts = async () => {
  return axios.get(`${API_BASE_URL}/products`);
};

//Fetches individual products using get request
export const getProductById = async (id) => {
  return axios.get(`${API_BASE_URL}/products/${id}`);
};

//Returns a users cart items using get request
export const getCart = async (token) => {
  return axios.get(`${API_BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};


//Sends Post request to /cart to add an product to cart. Requires all necessary fields + user authentication (JWT Token)
export const addToCart = async (product_id, quantity, preload_amount = 0, custom_message = "", image_url = "", token) => {
  if (!token) throw new Error("User not authenticated");

  return axios.post(
    `${API_BASE_URL}/cart`,
    { product_id, quantity, preload_amount, custom_message, image_url }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};



//Sends post request to /checkout with JWT authentication
export const checkout = async (token) => {
  return axios.post(
    `${API_BASE_URL}/checkout`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};


