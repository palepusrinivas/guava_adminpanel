import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { adminLoginUrl } from "../apiRoutes";

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
      const response = await axios.post(adminLoginUrl, credentials);
      try {
        console.log("[adminSlice] login response:", response.data);
      } catch (e) {}
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(extractErrorMessage(error.response?.data) || "Login failed");
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

        state.admin = username && role ? { username, role } : null;
        state.token = token;
        state.error = null;

        try {
          if (typeof window !== "undefined") {
            if (token) localStorage.setItem("adminToken", token);
            if (role) localStorage.setItem("adminRole", role);
            if (username) localStorage.setItem("adminUsername", username);
          }
        } catch (e) {
          // ignore storage failures
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
