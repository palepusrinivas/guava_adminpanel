import axios from "axios";
import { config } from "./config";

// Create axios instance for admin requests
// Use configured API base URL for both server and client
const adminAxios = axios.create({
  baseURL: config.API_BASE_URL,
});

// Request interceptor to add Bearer token
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
