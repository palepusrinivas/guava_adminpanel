import { createSlice } from "@reduxjs/toolkit";
import { getDashboardStats, getRecentActivities, getLeaderboardData } from "../reducers/adminReducers";

import type { Driver, Transaction, Trip } from "@/types/dashboard";

interface DashboardStats {
  totalUsers: number;
  totalRides: number;
  totalRevenue: number;
  activeDrivers: number;
  percentageChanges: {
    users: number;
    rides: number;
    revenue: number;
    drivers: number;
  };
}

interface DashboardState {
  stats: {
    data: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
  };
  recentActivities: {
    items: Array<{
      id: string;
      action: string;
      user: string;
      time: string;
    }>;
    isLoading: boolean;
    error: string | null;
  };
  leaderboard: {
    drivers: Driver[];
    isLoading: boolean;
    error: string | null;
  };
  transactions: {
    items: Transaction[];
    isLoading: boolean;
    error: string | null;
  };
  trips: {
    items: Trip[];
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: DashboardState = {
  stats: {
    data: null,
    isLoading: false,
    error: null
  },
  recentActivities: {
    items: [],
    isLoading: false,
    error: null
  },
  leaderboard: {
    drivers: [],
    isLoading: false,
    error: null
  },
  transactions: {
    items: [],
    isLoading: false,
    error: null
  },
  trips: {
    items: [],
    isLoading: false,
    error: null
  }
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearDashboardErrors: (state) => {
      state.stats.error = null;
      state.recentActivities.error = null;
      state.leaderboard.error = null;
      state.transactions.error = null;
      state.trips.error = null;
    }
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.stats.isLoading = true;
        state.stats.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.stats.isLoading = false;
        state.stats.data = action.payload;
        state.stats.error = null;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.stats.isLoading = false;
        state.stats.error = action.payload as string;
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
      })

      // Leaderboard
      .addCase(getLeaderboardData.pending, (state) => {
        state.leaderboard.isLoading = true;
        state.leaderboard.error = null;
      })
      .addCase(getLeaderboardData.fulfilled, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.drivers = action.payload;
        state.leaderboard.error = null;
      })
      .addCase(getLeaderboardData.rejected, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.error = action.payload as string;
      });
  }
});

export const { clearDashboardErrors } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;