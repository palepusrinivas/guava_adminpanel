import { createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import axios, { AxiosError } from "axios";
import { config } from "../config";

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
    // Check for error field first (our backend returns Map with "error" key)
    if (errorData && typeof errorData === 'object') {
      if ('error' in errorData && typeof (errorData as any).error === 'string') {
        return (errorData as any).error;
      }
      if ('message' in errorData && typeof (errorData as any).message === 'string') {
        return (errorData as any).message;
      }
      // Check for validation errors
      if ('validations' in errorData && typeof (errorData as any).validations === 'object') {
        const validations = (errorData as any).validations;
        const validationMessages = Object.entries(validations)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        return validationMessages || "Validation failed";
      }
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
  adminAnalyticsKpisUrl,
  adminAnalyticsZonesUrl,
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
  adminTripsUrl,
  adminTripByIdUrl,
  adminDriverKycDownloadUrl,
  adminWalletCreditUserUrl,
  adminWalletCreditDriverUrl,
  adminZonesUrl,
  adminZoneByIdUrl,
  adminFleetLocationsUrl,
  adminAnalyticsHeatmapUrl,
  adminLeaderboardUrl,
  adminBannersUrl,
  adminBannerByIdUrl,
  adminLegalDocumentsUrl,
  adminLegalDocumentByIdUrl,
  adminLegalDocumentActiveUrl,
  adminLegalDocumentActivateUrl,
  adminLegalDocumentDeactivateUrl,
  adminMailServerUrl,
  adminMailServerByIdUrl,
  adminMailServerActiveUrl,
  adminMailServerTestConnectionUrl,
  adminMailServerTestEmailUrl,
  adminMailServerTestConnectionDirectUrl,
  adminDriverAccessConfigsUrl,
  adminDriverAccessConfigByVehicleUrl,
  adminDriverAccessProcessDailyFeesUrl,
  adminCouponsUrl,
  adminCouponByIdUrl,
  adminDriverCouponsUrl,
  adminDriverCouponByIdUrl,
  adminDiscountsUrl,
  adminDiscountByIdUrl,
  adminDriverLevelsUrl,
  adminDriverLevelByIdUrl,
  adminWithdrawMethodsUrl,
  adminWithdrawMethodByIdUrl,
  adminWithdrawRequestsUrl,
  adminWithdrawRequestByIdUrl,
  adminEmployeeRolesUrl,
  adminEmployeeRoleByIdUrl,
  adminEmployeesUrl,
  adminEmployeeByIdUrl,
  adminCustomersUrl,
  adminCustomerByIdUrl,
  adminCustomerWalletAddFundUrl,
  adminCustomerWalletTransactionsUrl,
  adminParcelCategoriesUrl,
  adminParcelCategoryByIdUrl,
  adminParcelWeightsUrl,
  adminParcelWeightByIdUrl,
  adminVehicleBrandsUrl,
  adminVehicleBrandByIdUrl,
  adminVehicleModelsUrl,
  adminVehicleModelByIdUrl,
  adminVehicleCategoriesUrl,
  adminVehicleCategoryByIdUrl,
  adminVehiclesUrl,
  adminVehicleByIdUrl,
  adminVehicleRequestsUrl,
  adminVehicleRequestByIdUrl,
  adminVehicleUpdateRequestsUrl,
  adminVehicleUpdateRequestByIdUrl,
  adminTripFareSetupUrl,
  adminTripFareSetupByZoneUrl,
  adminParcelFareSetupUrl,
  adminParcelFareSetupByZoneUrl,
  adminOperationZonesUrl,
  adminOperationZoneByIdUrl,
  adminTransactionsUrl,
  adminTransactionByIdUrl,
  adminEarningReportsUrl,
  adminExpenseReportsUrl,
  adminZoneWiseStatisticsUrl,
  adminTripWiseEarningUrl,
  adminChattingDriversUrl,
  adminChattingMessagesUrl,
  adminChattingSendMessageUrl,
  adminBusinessInfoUrl,
  adminBusinessDriverSettingsUrl,
  adminBusinessCustomerSettingsUrl,
  adminBusinessFarePenaltyUrl,
  adminBusinessTripsSettingsUrl,
  adminBusinessSettingsUrl,
  adminBusinessParcelSettingsUrl,
  adminBusinessRefundSettingsUrl,
  adminBusinessSafetySettingsUrl,
  adminBusinessReferralSettingsUrl,
  adminBusinessChattingSetupUrl,
  adminBusinessPagesUrl,
  adminLandingPageSetupUrl,
  adminSocialMediaLinksUrl,
  adminNotificationRegularTripUrl,
  adminNotificationParcelUrl,
  adminNotificationDriverRegistrationUrl,
  adminNotificationOtherUrl,
  adminFirebaseConfigurationUrl,
  adminThirdPartyConfigurationUrl,
  adminNotificationsUrl,
  adminNotificationsUnreadUrl,
  adminNotificationsUnreadCountUrl,
  adminNotificationMarkReadUrl,
  adminNotificationsMarkAllReadUrl,
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
  async (params: { page?: number; size?: number; search?: string } = {}, { rejectWithValue }) => {
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
  async (params: { page?: number; size?: number; search?: string; hasSubscription?: boolean } = {}, { rejectWithValue }) => {
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
      // Debug: Check token
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("adminToken");
        console.log("[getZones] Token exists:", !!token);
      }
      
      const response = await adminAxios.get(adminZonesUrl);
      // Backend returns paginated response with 'content' array
      // Extract the zones array from the response
      const zones = response.data?.content || response.data || [];
      console.log("[getZones] Fetched zones:", zones.length, "zones");
      return Array.isArray(zones) ? zones : [];
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
      // Debug: Check token before request
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("adminToken");
        console.log("[createZone] Token check before request:", !!token);
        if (!token) {
          console.error("[createZone] ❌ No token! User needs to login first.");
          return rejectWithValue("Please login first. No authentication token found.");
        }
      }
      
      console.log("[createZone] Sending request to:", adminZonesUrl);
      console.log("[createZone] Zone data:", zoneData);
      
      const response = await adminAxios.post(adminZonesUrl, zoneData);
      console.log("[createZone] ✅ Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[createZone] ❌ Error:", error);
      if (axios.isAxiosError(error)) {
        console.error("[createZone] Response status:", error.response?.status);
        console.error("[createZone] Response data:", error.response?.data);
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
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.DASHBOARD_STATS);
      return response.data;
    } catch (error) {
      // If dashboard stats endpoint is not available (501/404/500), calculate stats from existing data
      const errorMsg = extractErrorMessage(error);
      if (errorMsg.includes("501") || errorMsg.includes("404") || errorMsg.includes("500")) {
        console.log("[getDashboardStats] Stats endpoint not available, calculating from existing data");
        try {
          // Fetch users, drivers, and trips to calculate stats
          const [usersRes, driversRes, tripsRes] = await Promise.allSettled([
            adminAxios.get(adminUsersUrl),
            adminAxios.get(adminDriversUrl),
            adminAxios.get(adminTripsUrl)
          ]);
          
          const users = usersRes.status === 'fulfilled' ? (usersRes.value.data?.content || usersRes.value.data || []) : [];
          const drivers = driversRes.status === 'fulfilled' ? (driversRes.value.data?.content || driversRes.value.data || []) : [];
          
          // Handle trips - ensure it's always an array
          // The backend returns { trips: [...], statistics: {...} } structure
          let trips: any[] = [];
          if (tripsRes.status === 'fulfilled') {
            const tripsData = tripsRes.value.data;
            if (Array.isArray(tripsData)) {
              trips = tripsData;
            } else if (tripsData && typeof tripsData === 'object') {
              // Check for various possible structures
              if (Array.isArray(tripsData.content)) {
                trips = tripsData.content;
              } else if (Array.isArray(tripsData.trips)) {
                trips = tripsData.trips;
              } else if (Array.isArray(tripsData.data)) {
                trips = tripsData.data;
              } else {
                // If it's an object but no array found, default to empty array
                trips = [];
              }
            }
          }
          
          const totalUsers = Array.isArray(users) ? users.length : 0;
          const activeDrivers = Array.isArray(drivers) ? drivers.filter((d: any) => d.isActive !== false).length : 0;
          const totalRides = Array.isArray(trips) ? trips.length : 0;
          const totalRevenue = Array.isArray(trips) ? trips.reduce((sum: number, trip: any) => sum + (trip.fare || 0), 0) : 0;
          
          return {
            totalUsers,
            activeDrivers,
            totalRides,
            totalRevenue,
            percentageChanges: {
              users: 0,
              drivers: 0,
              rides: 0,
              revenue: 0
            }
          };
        } catch (calcError) {
          console.error("[getDashboardStats] Error calculating stats:", calcError);
          return rejectWithValue("Failed to calculate dashboard stats");
        }
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const getLeaderboardData = createAsyncThunk(
  "admin/getLeaderboardData",
  async (params: { timeframe: 'today' | 'week' | 'month' | 'all' }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.LEADERBOARD, { params });
      return response.data;
    } catch (error) {
      // If leaderboard endpoint is not available, return empty array
      const errorMsg = extractErrorMessage(error);
      if (errorMsg.includes("501") || errorMsg.includes("404") || errorMsg.includes("500")) {
        console.log("[getLeaderboardData] Leaderboard endpoint not available, returning empty data");
        return [];
      }
      return rejectWithValue(errorMsg);
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

// Driver Access Rules
export const listDriverAccessConfigs = createAsyncThunk(
  "admin/listDriverAccessConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverAccessConfigsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getDriverAccessConfig = createAsyncThunk(
  "admin/getDriverAccessConfig",
  async (vehicleType: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverAccessConfigByVehicleUrl(vehicleType));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createDriverAccessConfig = createAsyncThunk(
  "admin/createDriverAccessConfig",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDriverAccessConfigsUrl, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateDriverAccessConfig = createAsyncThunk(
  "admin/updateDriverAccessConfig",
  async ({ vehicleType, payload }: { vehicleType: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminDriverAccessConfigByVehicleUrl(vehicleType), payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const processDriverDailyFees = createAsyncThunk(
  "admin/processDriverDailyFees",
  async ({ date }: { date?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDriverAccessProcessDailyFeesUrl, null, {
        params: date ? { date } : undefined,
      });
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
      const response = await adminAxios.get(adminAnalyticsKpisUrl, { params: { windowDays: 30 } });
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
      const response = await adminAxios.get(adminAnalyticsZonesUrl, { params: { windowDays: 7 } });
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
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.RECENT_ACTIVITIES, { params });
      return response.data;
    } catch (error) {
      // If recent activities endpoint is not available, return empty array
      const errorMsg = extractErrorMessage(error);
      if (errorMsg.includes("501") || errorMsg.includes("404") || errorMsg.includes("500")) {
        console.log("[getRecentActivities] Recent activities endpoint not available, returning empty data");
        return [];
      }
      return rejectWithValue(errorMsg);
    }
  }
);

// Recent transactions (analytics)
export const getRecentTransactions = createAsyncThunk(
  "admin/getRecentTransactions",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.RECENT_TRANSACTIONS, { params });
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
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.RECENT_TRIPS, { params });
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

// Trip Management
export const getAllTrips = createAsyncThunk(
  "admin/getAllTrips",
  async (
    params: { status?: string; search?: string; dateFilter?: string; page?: number; size?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await adminAxios.get(adminTripsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getTripById = createAsyncThunk(
  "admin/getTripById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTripByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Banner Management
export const getBanners = createAsyncThunk(
  "admin/getBanners",
  async (_, { rejectWithValue }) => {
    try {
      // Use /list endpoint to get all banners as simple array (not paginated)
      const response = await adminAxios.get(`${adminBannersUrl}/list`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBannerById = createAsyncThunk(
  "admin/getBannerById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBannerByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createBanner = createAsyncThunk(
  "admin/createBanner",
  async (bannerData: FormData, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminBannersUrl, bannerData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBanner = createAsyncThunk(
  "admin/updateBanner",
  async ({ bannerId, bannerData }: { bannerId: string; bannerData: FormData }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBannerByIdUrl(bannerId), bannerData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteBanner = createAsyncThunk(
  "admin/deleteBanner",
  async (bannerId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminBannerByIdUrl(bannerId));
      return bannerId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Legal Documents Management (Privacy Policy & Terms & Conditions)
export const getLegalDocuments = createAsyncThunk(
  "admin/getLegalDocuments",
  async (params: { documentType?: string; targetAudience?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminLegalDocumentsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getLegalDocumentById = createAsyncThunk(
  "admin/getLegalDocumentById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminLegalDocumentByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getActiveLegalDocument = createAsyncThunk(
  "admin/getActiveLegalDocument",
  async (params: { documentType: string; targetAudience: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminLegalDocumentActiveUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createLegalDocument = createAsyncThunk(
  "admin/createLegalDocument",
  async (documentData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminLegalDocumentsUrl, documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateLegalDocument = createAsyncThunk(
  "admin/updateLegalDocument",
  async ({ id, documentData }: { id: string; documentData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminLegalDocumentByIdUrl(id), documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteLegalDocument = createAsyncThunk(
  "admin/deleteLegalDocument",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminLegalDocumentByIdUrl(id));
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const activateLegalDocument = createAsyncThunk(
  "admin/activateLegalDocument",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminLegalDocumentActivateUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deactivateLegalDocument = createAsyncThunk(
  "admin/deactivateLegalDocument",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminLegalDocumentDeactivateUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Coupon Management
export const getCoupons = createAsyncThunk(
  "admin/getCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminCouponsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getCouponById = createAsyncThunk(
  "admin/getCouponById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminCouponByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createCoupon = createAsyncThunk(
  "admin/createCoupon",
  async (couponData: any, { rejectWithValue }) => {
    try {
      // Transform frontend fields to backend fields
      const backendData: any = {
        code: couponData.code,
        type: couponData.couponType === "percentage" ? "PERCENT" : 
              couponData.couponType === "flat" ? "FLAT" : 
              couponData.type || "PERCENT", // Fallback to type if couponType not provided
        value: couponData.amount || couponData.value, // Map amount to value
        minFare: couponData.minFare || null,
        startsAt: couponData.startsAt || null,
        endsAt: couponData.endsAt || null,
        maxRedemptions: couponData.maxRedemptions || null,
        maxRedemptionsPerUser: couponData.maxRedemptionsPerUser || null,
        active: couponData.active !== undefined ? couponData.active : true,
      };
      
      // Remove undefined fields
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined) {
          delete backendData[key];
        }
      });
      
      const response = await adminAxios.post(adminCouponsUrl, backendData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "admin/updateCoupon",
  async ({ couponId, couponData }: { couponId: string; couponData: any }, { rejectWithValue }) => {
    try {
      // Transform frontend fields to backend fields if needed
      const backendData: any = { ...couponData };
      
      // Normalize code to uppercase if provided
      if (backendData.code) {
        backendData.code = backendData.code.toUpperCase().trim();
      }
      
      // Ensure type is uppercase
      if (backendData.type) {
        backendData.type = backendData.type.toUpperCase();
      }
      
      // Map legacy fields if present
      if (backendData.couponType && !backendData.type) {
        backendData.type = backendData.couponType === "percentage" ? "PERCENT" : 
                          backendData.couponType === "flat" ? "FLAT" : 
                          backendData.couponType.toUpperCase();
      }
      
      if (backendData.amount !== undefined && backendData.value === undefined) {
        backendData.value = backendData.amount;
      }
      
      const response = await adminAxios.put(adminCouponByIdUrl(couponId), backendData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "admin/deleteCoupon",
  async (couponId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminCouponByIdUrl(couponId));
      return couponId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Driver Coupon Management (for driver subscriptions)
export const getDriverCoupons = createAsyncThunk(
  "admin/getDriverCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverCouponsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getDriverCouponById = createAsyncThunk(
  "admin/getDriverCouponById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverCouponByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createDriverCoupon = createAsyncThunk(
  "admin/createDriverCoupon",
  async (couponData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDriverCouponsUrl, couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateDriverCoupon = createAsyncThunk(
  "admin/updateDriverCoupon",
  async ({ couponId, couponData }: { couponId: string; couponData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminDriverCouponByIdUrl(couponId), couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteDriverCoupon = createAsyncThunk(
  "admin/deleteDriverCoupon",
  async (couponId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminDriverCouponByIdUrl(couponId));
      return couponId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Discount Management
export const getDiscounts = createAsyncThunk(
  "admin/getDiscounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDiscountsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getDiscountById = createAsyncThunk(
  "admin/getDiscountById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDiscountByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createDiscount = createAsyncThunk(
  "admin/createDiscount",
  async (discountData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDiscountsUrl, discountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateDiscount = createAsyncThunk(
  "admin/updateDiscount",
  async ({ discountId, discountData }: { discountId: string; discountData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminDiscountByIdUrl(discountId), discountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteDiscount = createAsyncThunk(
  "admin/deleteDiscount",
  async (discountId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminDiscountByIdUrl(discountId));
      return discountId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Driver Level Management
export const getDriverLevels = createAsyncThunk(
  "admin/getDriverLevels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverLevelsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getDriverLevelById = createAsyncThunk(
  "admin/getDriverLevelById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminDriverLevelByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createDriverLevel = createAsyncThunk(
  "admin/createDriverLevel",
  async (levelData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminDriverLevelsUrl, levelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateDriverLevel = createAsyncThunk(
  "admin/updateDriverLevel",
  async ({ levelId, levelData }: { levelId: string; levelData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminDriverLevelByIdUrl(levelId), levelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteDriverLevel = createAsyncThunk(
  "admin/deleteDriverLevel",
  async (levelId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminDriverLevelByIdUrl(levelId));
      return levelId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Withdraw Method Management
export const getWithdrawMethods = createAsyncThunk(
  "admin/getWithdrawMethods",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminWithdrawMethodsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getWithdrawMethodById = createAsyncThunk(
  "admin/getWithdrawMethodById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminWithdrawMethodByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createWithdrawMethod = createAsyncThunk(
  "admin/createWithdrawMethod",
  async (methodData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminWithdrawMethodsUrl, methodData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateWithdrawMethod = createAsyncThunk(
  "admin/updateWithdrawMethod",
  async ({ methodId, methodData }: { methodId: string; methodData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminWithdrawMethodByIdUrl(methodId), methodData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteWithdrawMethod = createAsyncThunk(
  "admin/deleteWithdrawMethod",
  async (methodId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminWithdrawMethodByIdUrl(methodId));
      return methodId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Withdraw Request Management
export const getWithdrawRequests = createAsyncThunk(
  "admin/getWithdrawRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminWithdrawRequestsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getWithdrawRequestById = createAsyncThunk(
  "admin/getWithdrawRequestById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminWithdrawRequestByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateWithdrawRequest = createAsyncThunk(
  "admin/updateWithdrawRequest",
  async ({ requestId, requestData }: { requestId: string; requestData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminWithdrawRequestByIdUrl(requestId), requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const approveWithdrawRequest = createAsyncThunk(
  "admin/approveWithdrawRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminWithdrawRequestByIdUrl(requestId), { status: "APPROVED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const denyWithdrawRequest = createAsyncThunk(
  "admin/denyWithdrawRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminWithdrawRequestByIdUrl(requestId), { status: "DENIED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Employee Role Management
export const getEmployeeRoles = createAsyncThunk(
  "admin/getEmployeeRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminEmployeeRolesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getEmployeeRoleById = createAsyncThunk(
  "admin/getEmployeeRoleById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminEmployeeRoleByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createEmployeeRole = createAsyncThunk(
  "admin/createEmployeeRole",
  async (roleData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminEmployeeRolesUrl, roleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateEmployeeRole = createAsyncThunk(
  "admin/updateEmployeeRole",
  async ({ roleId, roleData }: { roleId: string; roleData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminEmployeeRoleByIdUrl(roleId), roleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteEmployeeRole = createAsyncThunk(
  "admin/deleteEmployeeRole",
  async (roleId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminEmployeeRoleByIdUrl(roleId));
      return roleId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Employee Management
export const getEmployees = createAsyncThunk(
  "admin/getEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminEmployeesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getEmployeeById = createAsyncThunk(
  "admin/getEmployeeById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminEmployeeByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createEmployee = createAsyncThunk(
  "admin/createEmployee",
  async (employeeData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminEmployeesUrl, employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "admin/updateEmployee",
  async ({ employeeId, employeeData }: { employeeId: string; employeeData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminEmployeeByIdUrl(employeeId), employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "admin/deleteEmployee",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminEmployeeByIdUrl(employeeId));
      return employeeId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Customer Management
export const getCustomers = createAsyncThunk(
  "admin/getCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminCustomersUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getCustomerById = createAsyncThunk(
  "admin/getCustomerById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminCustomerByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createCustomer = createAsyncThunk(
  "admin/createCustomer",
  async (customerData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminCustomersUrl, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "admin/updateCustomer",
  async ({ customerId, customerData }: { customerId: string; customerData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminCustomerByIdUrl(customerId), customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "admin/deleteCustomer",
  async (customerId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminCustomerByIdUrl(customerId));
      return customerId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Customer Wallet Management
export const addFundToCustomerWallet = createAsyncThunk(
  "admin/addFundToCustomerWallet",
  async (fundData: { customerId: string; amount: number; reference?: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminCustomerWalletAddFundUrl, fundData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getCustomerWalletTransactions = createAsyncThunk(
  "admin/getCustomerWalletTransactions",
  async (params: { customerId?: string; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminCustomerWalletTransactionsUrl, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Parcel Category Management
export const getParcelCategories = createAsyncThunk(
  "admin/getParcelCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelCategoriesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getParcelCategoryById = createAsyncThunk(
  "admin/getParcelCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelCategoryByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createParcelCategory = createAsyncThunk(
  "admin/createParcelCategory",
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminParcelCategoriesUrl, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateParcelCategory = createAsyncThunk(
  "admin/updateParcelCategory",
  async ({ categoryId, categoryData }: { categoryId: string; categoryData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminParcelCategoryByIdUrl(categoryId), categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteParcelCategory = createAsyncThunk(
  "admin/deleteParcelCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminParcelCategoryByIdUrl(categoryId));
      return categoryId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Parcel Weight Management
export const getParcelWeights = createAsyncThunk(
  "admin/getParcelWeights",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelWeightsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getParcelWeightById = createAsyncThunk(
  "admin/getParcelWeightById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelWeightByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createParcelWeight = createAsyncThunk(
  "admin/createParcelWeight",
  async (weightData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminParcelWeightsUrl, weightData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateParcelWeight = createAsyncThunk(
  "admin/updateParcelWeight",
  async ({ weightId, weightData }: { weightId: string; weightData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminParcelWeightByIdUrl(weightId), weightData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteParcelWeight = createAsyncThunk(
  "admin/deleteParcelWeight",
  async (weightId: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminParcelWeightByIdUrl(weightId));
      return weightId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Brand Management
export const getVehicleBrands = createAsyncThunk(
  "admin/getVehicleBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleBrandsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createVehicleBrand = createAsyncThunk(
  "admin/createVehicleBrand",
  async (brandData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminVehicleBrandsUrl, brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateVehicleBrand = createAsyncThunk(
  "admin/updateVehicleBrand",
  async ({ brandId, brandData }: { brandId: string; brandData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleBrandByIdUrl(brandId), brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Model Management
export const getVehicleModels = createAsyncThunk(
  "admin/getVehicleModels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleModelsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createVehicleModel = createAsyncThunk(
  "admin/createVehicleModel",
  async (modelData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminVehicleModelsUrl, modelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Category Management
export const getVehicleCategories = createAsyncThunk(
  "admin/getVehicleCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleCategoriesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createVehicleCategory = createAsyncThunk(
  "admin/createVehicleCategory",
  async (categoryData: any, { rejectWithValue }) => {
    try {
      // Validate required fields before sending
      if (!categoryData.name || categoryData.name.trim() === "") {
        return rejectWithValue("Category name is required");
      }
      if (!categoryData.description || categoryData.description.trim() === "") {
        return rejectWithValue("Category description is required");
      }
      if (!categoryData.type || categoryData.type.trim() === "") {
        return rejectWithValue("Category type is required");
      }
      if (!categoryData.image) {
        return rejectWithValue("Category image is required");
      }
      
      // Always send as FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", categoryData.name.trim());
      formData.append("description", categoryData.description.trim());
      formData.append("type", categoryData.type.trim());
      
      // Handle image: if it's a File, append it; if it's a URL string, append as image param
      if (categoryData.image instanceof File) {
        formData.append("image", categoryData.image);
      } else if (typeof categoryData.image === "string" && categoryData.image && !categoryData.image.startsWith("blob:")) {
        // If it's a URL (not a blob URL), send as image parameter
        formData.append("image", categoryData.image);
      } else {
        return rejectWithValue("Category image is required (must be a file or valid URL)");
      }
      
      const response = await adminAxios.post(adminVehicleCategoriesUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Management
export const getVehicles = createAsyncThunk(
  "admin/getVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehiclesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getVehicleById = createAsyncThunk(
  "admin/getVehicleById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createVehicle = createAsyncThunk(
  "admin/createVehicle",
  async (vehicleData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminVehiclesUrl, vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "admin/updateVehicle",
  async ({ vehicleId, vehicleData }: { vehicleId: string; vehicleData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleByIdUrl(vehicleId), vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Request Management
export const getVehicleRequests = createAsyncThunk(
  "admin/getVehicleRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleRequestsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const approveVehicleRequest = createAsyncThunk(
  "admin/approveVehicleRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleRequestByIdUrl(requestId), { status: "APPROVED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const denyVehicleRequest = createAsyncThunk(
  "admin/denyVehicleRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleRequestByIdUrl(requestId), { status: "DENIED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Vehicle Update Request Management
export const getVehicleUpdateRequests = createAsyncThunk(
  "admin/getVehicleUpdateRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminVehicleUpdateRequestsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const approveVehicleUpdateRequest = createAsyncThunk(
  "admin/approveVehicleUpdateRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleUpdateRequestByIdUrl(requestId), { status: "APPROVED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const rejectVehicleUpdateRequest = createAsyncThunk(
  "admin/rejectVehicleUpdateRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminVehicleUpdateRequestByIdUrl(requestId), { status: "REJECTED" });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Operation Zones Management
export const getOperationZones = createAsyncThunk(
  "admin/getOperationZones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminOperationZonesUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getOperationZoneById = createAsyncThunk(
  "admin/getOperationZoneById",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminOperationZoneByIdUrl(zoneId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Trip Fare Setup Management
export const getTripFareSetup = createAsyncThunk(
  "admin/getTripFareSetup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTripFareSetupUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getTripFareSetupByZone = createAsyncThunk(
  "admin/getTripFareSetupByZone",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTripFareSetupByZoneUrl(zoneId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Parcel Fare Setup Management
export const getParcelFareSetup = createAsyncThunk(
  "admin/getParcelFareSetup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelFareSetupUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getParcelFareSetupByZone = createAsyncThunk(
  "admin/getParcelFareSetupByZone",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminParcelFareSetupByZoneUrl(zoneId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Transaction Management
export const getTransactions = createAsyncThunk(
  "admin/getTransactions",
  async ({ searchQuery }: { searchQuery?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTransactionsUrl, { params: searchQuery ? { searchQuery } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getTransactionById = createAsyncThunk(
  "admin/getTransactionById",
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTransactionByIdUrl(transactionId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Report Management
export const getEarningReports = createAsyncThunk(
  "admin/getEarningReports",
  async ({ timeRange }: { timeRange?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminEarningReportsUrl, { params: timeRange ? { timeRange } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getExpenseReports = createAsyncThunk(
  "admin/getExpenseReports",
  async ({ timeRange }: { timeRange?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminExpenseReportsUrl, { params: timeRange ? { timeRange } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getZoneWiseStatistics = createAsyncThunk(
  "admin/getZoneWiseStatistics",
  async ({ timeRange }: { timeRange?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminZoneWiseStatisticsUrl, { params: timeRange ? { timeRange } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getTripWiseEarning = createAsyncThunk(
  "admin/getTripWiseEarning",
  async ({ timeRange }: { timeRange?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminTripWiseEarningUrl, { params: timeRange ? { timeRange } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Chatting Management
export const getChattingDrivers = createAsyncThunk(
  "admin/getChattingDrivers",
  async ({ searchQuery }: { searchQuery?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminChattingDriversUrl, { params: searchQuery ? { searchQuery } : undefined });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getChattingMessages = createAsyncThunk(
  "admin/getChattingMessages",
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminChattingMessagesUrl, { params: { driverId } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "admin/sendChatMessage",
  async (messageData: { driverId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminChattingSendMessageUrl, messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Business Setup Management
export const getBusinessInfo = createAsyncThunk(
  "admin/getBusinessInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessInfoUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessInfo = createAsyncThunk(
  "admin/updateBusinessInfo",
  async (businessData: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessInfoUrl, businessData);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessDriverSettings = createAsyncThunk(
  "admin/getBusinessDriverSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessDriverSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessDriverSettings = createAsyncThunk(
  "admin/updateBusinessDriverSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessDriverSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessCustomerSettings = createAsyncThunk(
  "admin/getBusinessCustomerSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessCustomerSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessCustomerSettings = createAsyncThunk(
  "admin/updateBusinessCustomerSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessCustomerSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessFarePenalty = createAsyncThunk(
  "admin/getBusinessFarePenalty",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessFarePenaltyUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessFarePenalty = createAsyncThunk(
  "admin/updateBusinessFarePenalty",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessFarePenaltyUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessTripsSettings = createAsyncThunk(
  "admin/getBusinessTripsSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessTripsSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessTripsSettings = createAsyncThunk(
  "admin/updateBusinessTripsSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessTripsSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessSettings = createAsyncThunk(
  "admin/getBusinessSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessSettings = createAsyncThunk(
  "admin/updateBusinessSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessParcelSettings = createAsyncThunk(
  "admin/getBusinessParcelSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessParcelSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessParcelSettings = createAsyncThunk(
  "admin/updateBusinessParcelSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessParcelSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessRefundSettings = createAsyncThunk(
  "admin/getBusinessRefundSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessRefundSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessRefundSettings = createAsyncThunk(
  "admin/updateBusinessRefundSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessRefundSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessSafetySettings = createAsyncThunk(
  "admin/getBusinessSafetySettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessSafetySettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessSafetySettings = createAsyncThunk(
  "admin/updateBusinessSafetySettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessSafetySettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessReferralSettings = createAsyncThunk(
  "admin/getBusinessReferralSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessReferralSettingsUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessReferralSettings = createAsyncThunk(
  "admin/updateBusinessReferralSettings",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessReferralSettingsUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getBusinessChattingSetup = createAsyncThunk(
  "admin/getBusinessChattingSetup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessChattingSetupUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessChattingSetup = createAsyncThunk(
  "admin/updateBusinessChattingSetup",
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessChattingSetupUrl, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Pages & Media Management
export const getBusinessPage = createAsyncThunk(
  "admin/getBusinessPage",
  async (pageType: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminBusinessPagesUrl, { params: { type: pageType } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBusinessPage = createAsyncThunk(
  "admin/updateBusinessPage",
  async (data: { pageType: string; pageData: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminBusinessPagesUrl, { type: data.pageType, ...data.pageData });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const uploadPageBanner = createAsyncThunk(
  "admin/uploadPageBanner",
  async (data: { pageType: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("type", data.pageType);
      const response = await adminAxios.post(`${adminBusinessPagesUrl}/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getLandingPageSetup = createAsyncThunk(
  "admin/getLandingPageSetup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminLandingPageSetupUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateLandingPageSetup = createAsyncThunk(
  "admin/updateLandingPageSetup",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminLandingPageSetupUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getSocialMediaLinks = createAsyncThunk(
  "admin/getSocialMediaLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminSocialMediaLinksUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateSocialMediaLinks = createAsyncThunk(
  "admin/updateSocialMediaLinks",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminSocialMediaLinksUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Notification Configuration Management
export const getNotificationRegularTrip = createAsyncThunk(
  "admin/getNotificationRegularTrip",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminNotificationRegularTripUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateNotificationRegularTrip = createAsyncThunk(
  "admin/updateNotificationRegularTrip",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationRegularTripUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getNotificationParcel = createAsyncThunk(
  "admin/getNotificationParcel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminNotificationParcelUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateNotificationParcel = createAsyncThunk(
  "admin/updateNotificationParcel",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationParcelUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getNotificationDriverRegistration = createAsyncThunk(
  "admin/getNotificationDriverRegistration",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminNotificationDriverRegistrationUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateNotificationDriverRegistration = createAsyncThunk(
  "admin/updateNotificationDriverRegistration",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationDriverRegistrationUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getNotificationOther = createAsyncThunk(
  "admin/getNotificationOther",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminNotificationOtherUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateNotificationOther = createAsyncThunk(
  "admin/updateNotificationOther",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationOtherUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getFirebaseConfiguration = createAsyncThunk(
  "admin/getFirebaseConfiguration",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminFirebaseConfigurationUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateFirebaseConfiguration = createAsyncThunk(
  "admin/updateFirebaseConfiguration",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminFirebaseConfigurationUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getThirdPartyConfiguration = createAsyncThunk(
  "admin/getThirdPartyConfiguration",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminThirdPartyConfigurationUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateThirdPartyConfiguration = createAsyncThunk(
  "admin/updateThirdPartyConfiguration",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminThirdPartyConfigurationUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Mail Server Configuration
export const getMailServerConfigs = createAsyncThunk(
  "admin/getMailServerConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminMailServerUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getMailServerConfig = createAsyncThunk(
  "admin/getMailServerConfig",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminMailServerByIdUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getActiveMailServerConfig = createAsyncThunk(
  "admin/getActiveMailServerConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminMailServerActiveUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createMailServerConfig = createAsyncThunk(
  "admin/createMailServerConfig",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminMailServerUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateMailServerConfig = createAsyncThunk(
  "admin/updateMailServerConfig",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminMailServerByIdUrl(id), data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteMailServerConfig = createAsyncThunk(
  "admin/deleteMailServerConfig",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminMailServerByIdUrl(id));
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const testMailServerConnection = createAsyncThunk(
  "admin/testMailServerConnection",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminMailServerTestConnectionUrl(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const testMailServerEmail = createAsyncThunk(
  "admin/testMailServerEmail",
  async ({ id, email }: { id: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminMailServerTestEmailUrl(id), { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const testMailServerConnectionDirect = createAsyncThunk(
  "admin/testMailServerConnectionDirect",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminMailServerTestConnectionDirectUrl, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Admin Notifications Management
export const getAdminNotifications = createAsyncThunk(
  "admin/getAdminNotifications",
  async (params: { page?: number; size?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 0, size = 20, type } = params;
      const url = type 
        ? `${adminNotificationsUrl}?page=${page}&size=${size}&type=${type}`
        : `${adminNotificationsUrl}?page=${page}&size=${size}`;
      const response = await adminAxios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getUnreadAdminNotifications = createAsyncThunk(
  "admin/getUnreadAdminNotifications",
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 0, size = 20 } = params;
      const response = await adminAxios.get(`${adminNotificationsUnreadUrl}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const getUnreadAdminNotificationsCount = createAsyncThunk(
  "admin/getUnreadAdminNotificationsCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminNotificationsUnreadCountUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "admin/markNotificationAsRead",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationMarkReadUrl(notificationId.toString()));
      return { id: notificationId, ...response.data };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "admin/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminNotificationsMarkAllReadUrl);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

