import { createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import axios from "axios";
import type {
  IntercityVehicleConfig,
  IntercityRoute,
  IntercityDashboardStats,
  IntercityTripStatus,
  IntercityBookingStatus,
  IntercityPricingConfig,
} from "../slices/intercitySlice";

// Error message extractor
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    if (status === 501) return "This feature is not available on the server (501)";
    if (status === 404) return "Requested resource not found (404)";
    if (status === 403) return "Permission denied (403)";
    if (status === 500) return "Server error (500)";
    if (errorData && typeof errorData === "object" && "message" in errorData) {
      return (errorData as { message: string }).message;
    }
    if (typeof errorData === "string") {
      return errorData;
    }
    return error.message || "An unexpected error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Base URL for intercity admin API
const INTERCITY_BASE = "/api/admin/intercity";

// ==================== Dashboard ====================

export const getIntercityDashboard = createAsyncThunk<IntercityDashboardStats>(
  "intercity/getDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/dashboard`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Vehicle Configuration ====================

export const getIntercityVehicles = createAsyncThunk<IntercityVehicleConfig[]>(
  "intercity/getVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/vehicles`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const saveIntercityVehicle = createAsyncThunk<
  IntercityVehicleConfig,
  IntercityVehicleConfig
>(
  "intercity/saveVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/vehicles`, vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteIntercityVehicle = createAsyncThunk<number, number>(
  "intercity/deleteVehicle",
  async (vehicleId, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`${INTERCITY_BASE}/vehicles/${vehicleId}`);
      return vehicleId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const seedIntercityVehicles = createAsyncThunk<{ status: string; message: string }>(
  "intercity/seedVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/seed/vehicles`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Route Management ====================

export const getIntercityRoutes = createAsyncThunk<IntercityRoute[]>(
  "intercity/getRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/routes`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createIntercityRoute = createAsyncThunk<
  IntercityRoute,
  Omit<IntercityRoute, "id">
>(
  "intercity/createRoute",
  async (routeData, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/routes`, routeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateIntercityRoute = createAsyncThunk<
  IntercityRoute,
  { routeId: number; routeData: Omit<IntercityRoute, "id"> }
>(
  "intercity/updateRoute",
  async ({ routeId, routeData }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${INTERCITY_BASE}/routes/${routeId}`, routeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteIntercityRoute = createAsyncThunk<number, number>(
  "intercity/deleteRoute",
  async (routeId, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`${INTERCITY_BASE}/routes/${routeId}`);
      return routeId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Trip Management ====================

interface TripsParams {
  status?: IntercityTripStatus;
  page?: number;
  size?: number;
}

export const getIntercityTrips = createAsyncThunk(
  "intercity/getTrips",
  async (params: TripsParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/trips`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getIntercityTripsByStatus = createAsyncThunk(
  "intercity/getTripsByStatus",
  async (status: IntercityTripStatus, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/trips/status/${status}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const dispatchIntercityTrip = createAsyncThunk<
  { status: string; tripId: string },
  number
>(
  "intercity/dispatchTrip",
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/trips/${tripId}/dispatch`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const cancelIntercityTrip = createAsyncThunk<
  { status: string; tripId: string },
  { tripId: number; reason?: string }
>(
  "intercity/cancelTrip",
  async ({ tripId, reason = "Admin cancelled" }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/trips/${tripId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Booking Management ====================

interface BookingsParams {
  status?: IntercityBookingStatus;
  page?: number;
  size?: number;
}

export const getIntercityBookings = createAsyncThunk(
  "intercity/getBookings",
  async (params: BookingsParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/bookings`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getIntercityBookingById = createAsyncThunk(
  "intercity/getBookingById",
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const cancelIntercityBooking = createAsyncThunk(
  "intercity/cancelBooking",
  async ({ bookingId, reason = "Admin cancelled" }: { bookingId: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/bookings/${bookingId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const confirmIntercityBooking = createAsyncThunk(
  "intercity/confirmBooking",
  async ({ bookingId, paymentMethod }: { bookingId: number; paymentMethod?: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/bookings/${bookingId}/confirm`, {
        paymentMethod: paymentMethod || "ONLINE",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const assignDriverToBooking = createAsyncThunk(
  "intercity/assignDriver",
  async ({ bookingId, driverId }: { bookingId: number; driverId: number }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${INTERCITY_BASE}/bookings/${bookingId}/assign-driver`, {
        driverId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getAvailableDrivers = createAsyncThunk(
  "intercity/getAvailableDrivers",
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/drivers/available`, {
        params: search ? { search } : {},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Trip Price Management ====================

export const updateTripPrices = createAsyncThunk(
  "intercity/updateTripPrices",
  async (
    { tripId, totalPrice, currentPerHeadPrice }: { tripId: number; totalPrice?: number; currentPerHeadPrice?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminAxios.put(`${INTERCITY_BASE}/trips/${tripId}/prices`, {
        totalPrice,
        currentPerHeadPrice,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Commission Management ====================

export const getCommissionSetting = createAsyncThunk(
  "intercity/getCommissionSetting",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/settings/commission`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateCommissionSetting = createAsyncThunk(
  "intercity/updateCommissionSetting",
  async (commissionPercentage: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${INTERCITY_BASE}/settings/commission`, {
        commissionPercentage,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBookingCommission = createAsyncThunk(
  "intercity/updateBookingCommission",
  async ({ bookingId, commissionPercentage }: { bookingId: number; commissionPercentage: number }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${INTERCITY_BASE}/bookings/${bookingId}/commission`, {
        commissionPercentage,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// ==================== Pricing Configuration ====================

export const getIntercityPricingConfig = createAsyncThunk<IntercityPricingConfig>(
  "intercity/getPricingConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${INTERCITY_BASE}/pricing`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateIntercityPricingConfig = createAsyncThunk<
  IntercityPricingConfig,
  Partial<IntercityPricingConfig>
>(
  "intercity/updatePricingConfig",
  async (configData, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${INTERCITY_BASE}/pricing`, configData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

