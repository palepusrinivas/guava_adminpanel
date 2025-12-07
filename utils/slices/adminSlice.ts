import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { adminLoginUrl } from "../apiRoutes";
import adminAxios from "../axiosConfig";
import { config, getApiUrl } from "../config";

// Error Response Interface
interface ErrorResponse {
  status?: number;
  error?: string;
  message: string;
  path?: string;
  timestamp?: string;
}

// Admin Auth State Interface
interface AdminAuthState {
  admin: {
    username: string;
    role: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Safely read from localStorage only on the client
const getInitialAdmin = (): { username: string; role: string } | null => {
  try {
    if (typeof window === "undefined") return null;
    const username = localStorage.getItem("adminUsername");
    const role = localStorage.getItem("adminRole");
    if (username && role) return { username, role };
    return null;
  } catch (e) {
    return null;
  }
};

const initialState: AdminAuthState = {
  admin: getInitialAdmin(),
  token: typeof window !== "undefined" ? localStorage.getItem("adminToken") : null,
  isLoading: false,
  error: null,
};

// Admin Login Async Thunk
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    // Map common HTTP statuses to friendly messages
    if (status === 500) return "Server error (500) - Backend encountered an error";
    if (status === 404) return "Endpoint not found (404)";
    if (status === 401) return "Invalid credentials";
    if (status === 403) return "Permission denied (403)";
    if (status === 501) return "This feature is not available (501)";
    
    // Try to extract message from response
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      return (errorData as ErrorResponse).message;
    }
    if (typeof errorData === 'string') {
      return errorData;
    }
    return error.message || "An unexpected error occurred";
  }
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error) return (error as ErrorResponse).message;
    if ('error' in error && typeof (error as ErrorResponse).error === 'string') {
      return (error as ErrorResponse).error as string;
    }
  }
  return "An unexpected error occurred";
};

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log("[adminSlice] Attempting login to:", config.ENDPOINTS.ADMIN.LOGIN);
      console.log("[adminSlice] Credentials:", { username: credentials.username, password: "***" });
      const url = getApiUrl(config.ENDPOINTS.ADMIN.LOGIN);
      const response = await adminAxios.post(url, credentials);
      try {
        console.log("[adminSlice] login response:", response.data);
      } catch (e) {}
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[adminSlice] Login error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: { url: error.config?.url, method: error.config?.method }
        });
        return rejectWithValue(extractErrorMessage(error) || "Login failed");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Admin Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.admin = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminRole");
          localStorage.removeItem("adminUsername");
        }
      } catch (e) {
        // ignore
      }
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;

        // Normalize various possible backend response shapes
        const payload = action.payload || {};
        const maybeUser = payload.user || payload.admin || payload.data || {};

        console.log("[adminSlice] Login fulfilled - raw payload:", payload);

        const username =
          payload.username ||
          maybeUser.username ||
          maybeUser.name ||
          (typeof maybeUser === "string" ? maybeUser : undefined) ||
          null;

        const role = payload.role || maybeUser.role || null;

        const token =
          payload.accessToken ||
          payload.token ||
          payload.data?.accessToken ||
          payload.data?.token ||
          null;

        console.log("[adminSlice] Extracted values - username:", username, "role:", role, "token exists:", !!token);

        state.admin = username && role ? { username, role } : null;
        state.token = token;
        state.error = null;

        // Store in localStorage - CRITICAL for subsequent API calls
        if (typeof window !== "undefined") {
          try {
            if (token) {
              localStorage.setItem("adminToken", token);
              console.log("[adminSlice] ✅ Token stored in localStorage");
            } else {
              console.error("[adminSlice] ❌ No token received from backend!");
            }
            if (role) localStorage.setItem("adminRole", role);
            if (username) localStorage.setItem("adminUsername", username);
          } catch (e) {
            console.error("[adminSlice] ❌ Failed to store in localStorage:", e);
          }
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        // action.payload should already be a string due to our thunk error handling
        state.error = typeof action.payload === 'string' ? action.payload : 'An unexpected error occurred';
      });
  },
});

export const { adminLogout, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
