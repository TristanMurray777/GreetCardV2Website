//References: 1. https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/#6
//2. https://www.youtube.com/watch?v=aAldUjdRyPA&t=629s&ab_channel=TechCheck
//3. https://www.youtube.com/watch?v=1MtHkHpUbS4&t=1033s&ab_channel=TechCheck
import axios from "axios";

//Sets API base url so that it can be changes easily
const API_BASE_URL = "http://192.168.1.11:2000";

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

//Fetches total user count report
export const getUserCountReport = async () => {
  return axios.get(`${API_BASE_URL}/reports/user-count`);
};

//Fetches sales summary report
export const getSalesSummaryReport = async () => {
  return axios.get(`${API_BASE_URL}/reports/sales-summary`);
};

//Publishes the generated report
export const publishReport = async (reportData) => {
  return axios.post(`${API_BASE_URL}/reports/publish`, { reportData });
};

//Fetches the published report for advertisers
export const getPublishedReport = async () => {
  return axios.get(`${API_BASE_URL}/reports/published`);
};

//AI Image Generation (DALL·E)
export const dalle = {
  generateImage: async (prompt) => {
    const response = await axios.post(`${API_BASE_URL}/generate-image`, { prompt });
    return response.data;
  },
};