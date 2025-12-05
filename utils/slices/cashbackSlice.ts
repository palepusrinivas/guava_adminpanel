import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import { config } from "../config";

// Types
export interface CashbackSettings {
  id: number;
  isEnabled: boolean;
  cashbackPercentage: number;
  utilisationLimit: number;
  validityHours: number;
  maxCreditsPerDay: number;
  festivalExtraPercentage: number;
  festivalStartDate: string | null;
  festivalEndDate: string | null;
  isFestivalActive: boolean;
  effectivePercentage: number;
  enabledCategories: string[];
  updatedAt: string;
}

export interface CashbackEntry {
  id: number;
  userId: string;
  rideId: number;
  rideCategory: string;
  rideFare: number;
  percentageApplied: number;
  amount: number;
  amountUsed: number;
  amountRemaining: number;
  status: "ACTIVE" | "USED" | "PARTIALLY_USED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  expiredAt: string | null;
  isFestivalBonus: boolean;
  expiresInSeconds: number;
  expiresInFormatted: string;
  isExpiringSoon: boolean;
}

export interface CashbackDashboard {
  settings: CashbackSettings;
  statsByStatus: {
    [key: string]: { count: number; total: number };
  };
  creditedToday: number;
  usedToday: number;
  creditedThisMonth: number;
  usedThisMonth: number;
}

interface CashbackState {
  settings: CashbackSettings | null;
  dashboard: CashbackDashboard | null;
  entries: CashbackEntry[];
  totalEntries: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CashbackState = {
  settings: null,
  dashboard: null,
  entries: [],
  totalEntries: 0,
  isLoading: false,
  error: null,
};

// Async Thunks
export const getCashbackSettings = createAsyncThunk(
  "cashback/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.CASHBACK_SETTINGS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch settings");
    }
  }
);

export const updateCashbackSettings = createAsyncThunk(
  "cashback/updateSettings",
  async (settings: Partial<CashbackSettings>, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(config.ENDPOINTS.ADMIN.CASHBACK_SETTINGS, settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update settings");
    }
  }
);

export const toggleCashback = createAsyncThunk(
  "cashback/toggle",
  async (enabled: boolean, { rejectWithValue }) => {
    try {
      const response = await adminAxios.patch(
        `${config.ENDPOINTS.ADMIN.CASHBACK_TOGGLE}?enabled=${enabled}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle cashback");
    }
  }
);

export const updateFestivalMode = createAsyncThunk(
  "cashback/updateFestival",
  async (
    data: { extraPercentage: number; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminAxios.put(
        `${config.ENDPOINTS.ADMIN.CASHBACK_FESTIVAL}?extraPercentage=${data.extraPercentage}&startDate=${data.startDate}&endDate=${data.endDate}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update festival mode");
    }
  }
);

export const clearFestivalMode = createAsyncThunk(
  "cashback/clearFestival",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.delete(config.ENDPOINTS.ADMIN.CASHBACK_FESTIVAL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear festival mode");
    }
  }
);

export const getCashbackDashboard = createAsyncThunk(
  "cashback/getDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.CASHBACK_DASHBOARD);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

export const getCashbackEntries = createAsyncThunk(
  "cashback/getEntries",
  async (
    params: { page?: number; size?: number; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.size !== undefined) queryParams.append("size", params.size.toString());
      if (params.status) queryParams.append("status", params.status);
      
      const response = await adminAxios.get(
        `${config.ENDPOINTS.ADMIN.CASHBACK_ENTRIES}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch entries");
    }
  }
);

export const expireCashbackEntry = createAsyncThunk(
  "cashback/expireEntry",
  async (entryId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(
        config.ENDPOINTS.ADMIN.CASHBACK_EXPIRE_ENTRY.replace(":id", entryId.toString())
      );
      return { entryId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to expire entry");
    }
  }
);

export const processExpiredEntries = createAsyncThunk(
  "cashback/processExpired",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(config.ENDPOINTS.ADMIN.CASHBACK_PROCESS_EXPIRED);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process expired entries");
    }
  }
);

// Slice
const cashbackSlice = createSlice({
  name: "cashback",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Settings
    builder.addCase(getCashbackSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCashbackSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload;
    });
    builder.addCase(getCashbackSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Settings
    builder.addCase(updateCashbackSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateCashbackSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload;
    });
    builder.addCase(updateCashbackSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Toggle
    builder.addCase(toggleCashback.fulfilled, (state, action) => {
      state.settings = action.payload;
    });

    // Festival Mode
    builder.addCase(updateFestivalMode.fulfilled, (state, action) => {
      state.settings = action.payload;
    });
    builder.addCase(clearFestivalMode.fulfilled, (state, action) => {
      state.settings = action.payload;
    });

    // Dashboard
    builder.addCase(getCashbackDashboard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCashbackDashboard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.dashboard = action.payload;
      state.settings = action.payload.settings;
    });
    builder.addCase(getCashbackDashboard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Entries
    builder.addCase(getCashbackEntries.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCashbackEntries.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entries = action.payload.content || [];
      state.totalEntries = action.payload.totalElements || 0;
    });
    builder.addCase(getCashbackEntries.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Expire Entry
    builder.addCase(expireCashbackEntry.fulfilled, (state, action) => {
      const index = state.entries.findIndex((e) => e.id === action.payload.entryId);
      if (index !== -1) {
        state.entries[index].status = "EXPIRED";
      }
    });
  },
});

export const { clearError } = cashbackSlice.actions;
export default cashbackSlice.reducer;

