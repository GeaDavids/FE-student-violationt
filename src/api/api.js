import axios from "axios";

// Use environment variable if defined, otherwise use the production URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API Base URL:", BASE_URL);

// Create an axios instance with the base URL for the API
const API = axios.create({
  baseURL: BASE_URL + "/api", // Add /api prefix here
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to automatically add authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });

      // Handle session expiry or unauthorized errors (401)
      if (error.response.status === 401) {
        console.warn(
          "Session expired or unauthorized. Redirecting to login..."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/"; // Redirect to login page
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", error.request);

      // If using localhost and got connection refused, try the production URL as fallback
      if (API.defaults.baseURL === "http://localhost:3000") {
        console.warn("Local API connection failed, trying production API...");
        API.defaults.baseURL = PROD_API_URL;
        // Recreate the request that just failed
        return API(error.config);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
