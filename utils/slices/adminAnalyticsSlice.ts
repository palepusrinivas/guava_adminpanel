import { createSlice } from "@reduxjs/toolkit";
import { getAnalyticsHeatmap, getAnalyticsStats, getAnalyticsSummary, getRecentActivities } from "../reducers/adminReducers";

interface AdminAnalyticsState {
  stats: {
    totalRides: number;
    totalRevenue: number;
    activeUsers: number;
    activeDrivers: number;
    averageRating: number;
    completionRate: number;
    data: any[];
    isLoading: boolean;
    error: string | null;
  };
  summary: {
    periodStats: {
      today: { rides: number; revenue: number };
      yesterday: { rides: number; revenue: number };
      thisWeek: { rides: number; revenue: number };
      thisMonth: { rides: number; revenue: number };
    };
    topZones: Array<{ name: string; rides: number; revenue: number }>;
    isLoading: boolean;
    error: string | null;
  };
  recentActivities: {
    items: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
    isLoading: boolean;
    error: string | null;
  };
  heatmap: {
    data: any[];
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: AdminAnalyticsState = {
  stats: {
    totalRides: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeDrivers: 0,
    averageRating: 0,
    completionRate: 0,
    data: [],
    isLoading: false,
    error: null,
  },
  summary: {
    periodStats: {
      today: { rides: 0, revenue: 0 },
      yesterday: { rides: 0, revenue: 0 },
      thisWeek: { rides: 0, revenue: 0 },
      thisMonth: { rides: 0, revenue: 0 },
    },
    topZones: [],
    isLoading: false,
    error: null,
  },
  recentActivities: {
    items: [],
    isLoading: false,
    error: null,
  },
  heatmap: {
    data: [],
    isLoading: false,
    error: null,
  },
};

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    clearAnalyticsErrors: (state) => {
      state.stats.error = null;
      state.summary.error = null;
      state.recentActivities.error = null;
      state.heatmap.error = null;
    },
  },
  extraReducers: (builder) => {
    // Analytics Stats
    builder
      .addCase(getAnalyticsStats.pending, (state) => {
        state.stats.isLoading = true;
        state.stats.error = null;
      })
      .addCase(getAnalyticsStats.fulfilled, (state, action) => {
        state.stats.isLoading = false;
        state.stats = {
          ...state.stats,
          ...action.payload,
          error: null,
        };
      })
      .addCase(getAnalyticsStats.rejected, (state, action) => {
        state.stats.isLoading = false;
        state.stats.error = action.payload as string;
      });

    // Analytics Summary
    builder
      .addCase(getAnalyticsSummary.pending, (state) => {
        state.summary.isLoading = true;
        state.summary.error = null;
      })
      .addCase(getAnalyticsSummary.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary = {
          ...state.summary,
          ...action.payload,
          error: null,
        };
      })
      .addCase(getAnalyticsSummary.rejected, (state, action) => {
        state.summary.isLoading = false;
        state.summary.error = action.payload as string;
      });

    // Recent Activities
    builder
      .addCase(getRecentActivities.pending, (state) => {
        state.recentActivities.isLoading = true;
        state.recentActivities.error = null;
      })
      .addCase(getRecentActivities.fulfilled, (state, action) => {
        state.recentActivities.isLoading = false;
        state.recentActivities.items = action.payload;
        state.recentActivities.error = null;
      })
      .addCase(getRecentActivities.rejected, (state, action) => {
        state.recentActivities.isLoading = false;
        state.recentActivities.error = action.payload as string;
      });

    // Heatmap
    builder
      .addCase(getAnalyticsHeatmap.pending, (state) => {
        state.heatmap.isLoading = true;
        state.heatmap.error = null;
      })
      .addCase(getAnalyticsHeatmap.fulfilled, (state, action) => {
        state.heatmap.isLoading = false;
        state.heatmap.data = action.payload;
        state.heatmap.error = null;
      })
      .addCase(getAnalyticsHeatmap.rejected, (state, action) => {
        state.heatmap.isLoading = false;
        state.heatmap.error = action.payload as string;
      });
  },
});

export const { clearAnalyticsErrors } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;