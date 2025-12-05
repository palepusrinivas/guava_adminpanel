import axios from "axios";
import { config } from "./config";

// Create axios instance for admin requests
// Use configured API base URL for both server and client
const adminAxios = axios.create({
  baseURL: config.API_BASE_URL,
});

// Request interceptor to add Bearer token
adminAxios.interceptors.request.use(
  (requestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      
      // Debug logging
      console.log("[adminAxios] Request to:", requestConfig.url);
      console.log("[adminAxios] Token exists:", !!token);
      
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        console.log("[adminAxios] Authorization header set");
      } else {
        console.warn("[adminAxios] No token found in localStorage!");
      }
    } else {
      console.log("[adminAxios] Running on server, no localStorage access");
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
adminAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminUsername");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
