import { createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import axios, { AxiosError } from "axios";

interface ErrorResponse {
  status?: number;
  error?: string;
  message: string;
  path?: string;
  timestamp?: string;
}

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    // Map common HTTP statuses to friendly messages
    if (status === 501) return "This feature is not available on the server (501)";
    if (status === 404) return "Requested resource not found (404)";
    if (status === 403) return "Permission denied (403)";
    if (status === 500) return "Server error (500)";
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      return (errorData as ErrorResponse).message;
    }
    if (typeof errorData === 'string') {
      return errorData;
    }
    return error.message || "An unexpected error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

import {
  adminPricingUrl,
  adminDashboardStatsUrl,
  adminAnalyticsStatsUrl,
  adminAnalyticsSummaryUrl,
  adminRecentActivitiesUrl,
  adminRecentTransactionsUrl,
  adminRecentTripsUrl,
  adminTripFaresUrl,
  adminUsersUrl,
  adminUserByIdUrl,
  adminDriversUrl,
  adminDriverByIdUrl,
  adminDriverKycUrl,
  adminDriverKycFileUrl,
  adminDriverKycDownloadUrl,
  adminWalletCreditUserUrl,
  adminWalletCreditDriverUrl,
  adminZonesUrl,
  adminZoneByIdUrl,
  adminFleetLocationsUrl,
  adminAnalyticsHeatmapUrl,
  adminLeaderboardUrl,
} from "../apiRoutes";

// Pricing Management
export const getPricing = createAsyncThunk(
  "admin/getPricing",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminPricingUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch pricing");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updatePricing = createAsyncThunk(
  "admin/updatePricing",
  async (pricingData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminPricingUrl, pricingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to update pricing");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// User Management
export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      console.log("[adminReducers] Calling getUsers with params:", params);
      console.log("[adminReducers] URL:", adminUsersUrl);
      console.log("[adminReducers] Token:", localStorage.getItem("adminToken"));
      
      const response = await adminAxios.get(adminUsersUrl, { params });
      console.log("[adminReducers] getUsers full response:", response);
      console.log("[adminReducers] getUsers response data:", response.data);
      
      // Check if response.data is empty or invalid
      if (!response.data) {
        console.warn("[adminReducers] Empty response data");
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("[adminReducers] Error in getUsers:", error);
      if (axios.isAxiosError(error)) {
        console.error("[adminReducers] Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getUserById = createAsyncThunk(
  "admin/getUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminUserByIdUrl(userId));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch user");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const createUser = createAsyncThunk(
  "admin/createUser",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminUsersUrl, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ userId, userData }: { userId: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminUserByIdUrl(userId), userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminUserByIdUrl(userId));
      return userId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Driver Management
export const getDrivers = createAsyncThunk(
  "admin/getDrivers",
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriversUrl, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch drivers");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const getDriverById = createAsyncThunk(
  "admin/getDriverById",
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverByIdUrl(driverId));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch driver");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const createDriver = createAsyncThunk(
  "admin/createDriver",
  async (driverData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDriversUrl, driverData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to create driver");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateDriver = createAsyncThunk(
  "admin/updateDriver",
  async ({ driverId, driverData }: { driverId: string; driverData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminDriverByIdUrl(driverId), driverData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to update driver");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteDriver = createAsyncThunk(
  "admin/deleteDriver",
  async (driverId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminDriverByIdUrl(driverId));
      return driverId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to delete driver");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Driver KYC Management
export const getDriverKyc = createAsyncThunk(
  "admin/getDriverKyc",
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverKycUrl(driverId));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch driver KYC");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const uploadDriverKycFile = createAsyncThunk(
  "admin/uploadDriverKycFile",
  async ({ driverId, fileName, file }: { driverId: string; fileName: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await adminAxios.put(adminDriverKycFileUrl(driverId, fileName), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to upload KYC file");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteDriverKycFile = createAsyncThunk(
  "admin/deleteDriverKycFile",
  async ({ driverId, fileName }: { driverId: string; fileName: string }, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminDriverKycFileUrl(driverId, fileName));
      return { driverId, fileName };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to delete KYC file");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const downloadDriverKycFile = createAsyncThunk(
  "admin/downloadDriverKycFile",
  async ({ driverId, fileName }: { driverId: string; fileName: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverKycDownloadUrl(driverId, fileName));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to get download URL");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Wallet Management
export const creditUserWallet = createAsyncThunk(
  "admin/creditUserWallet",
  async ({ userId, amount, notes }: { userId: string; amount: number; notes: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminWalletCreditUserUrl(userId), { amount, notes });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to credit user wallet");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const creditDriverWallet = createAsyncThunk(
  "admin/creditDriverWallet",
  async ({ driverId, amount, notes }: { driverId: string; amount: number; notes: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminWalletCreditDriverUrl(driverId), { amount, notes });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to credit driver wallet");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Zone Management
export const getZones = createAsyncThunk(
  "admin/getZones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminZonesUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch zones");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const getZoneById = createAsyncThunk(
  "admin/getZoneById",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminZoneByIdUrl(zoneId));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch zone");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const createZone = createAsyncThunk(
  "admin/createZone",
  async (zoneData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminZonesUrl, zoneData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to create zone");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateZone = createAsyncThunk(
  "admin/updateZone",
  async ({ zoneId, zoneData }: { zoneId: string; zoneData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminZoneByIdUrl(zoneId), zoneData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to update zone");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteZone = createAsyncThunk(
  "admin/deleteZone",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminZoneByIdUrl(zoneId));
      return zoneId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to delete zone");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Fleet Management
export const getFleetLocations = createAsyncThunk(
  "admin/getFleetLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminFleetLocationsUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch fleet locations");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Dashboard
export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDashboardStatsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getLeaderboardData = createAsyncThunk(
  "admin/getLeaderboardData",
  async (params: { timeframe: 'today' | 'week' | 'month' | 'all' }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminLeaderboardUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Analytics
export const getAnalyticsHeatmap = createAsyncThunk(
  "admin/getAnalyticsHeatmap",
  async (params: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminAnalyticsHeatmapUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getAnalyticsStats = createAsyncThunk(
  "admin/getAnalyticsStats",
  async (params: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminAnalyticsStatsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getAnalyticsSummary = createAsyncThunk(
  "admin/getAnalyticsSummary",
  async (params: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminAnalyticsSummaryUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getRecentActivities = createAsyncThunk(
  "admin/getRecentActivities",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminRecentActivitiesUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Recent transactions (analytics)
export const getRecentTransactions = createAsyncThunk(
  "admin/getRecentTransactions",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminRecentTransactionsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Recent trips (analytics)
export const getRecentTrips = createAsyncThunk(
  "admin/getRecentTrips",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminRecentTripsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

import type { TripFare, TripFarePayload, SpringPage } from '@/types/pricing';

// Trip fares - list, create, delete
export const getTripFares = createAsyncThunk<
  SpringPage<TripFare>,
  { page?: number; size?: number } | undefined,
  { rejectValue: string }
>(
  "admin/getTripFares",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get<SpringPage<TripFare>>(adminTripFaresUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createTripFare = createAsyncThunk<
  TripFare,
  TripFarePayload,
  { rejectValue: string }
>(
  "admin/createTripFare",
  async (fareData, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post<TripFare>(adminTripFaresUrl, fareData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteTripFare = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "admin/deleteTripFare",
  async (id, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminTripFaresUrl, { params: { id } });
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

