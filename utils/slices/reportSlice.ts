import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getEarningReports,
  getExpenseReports,
  getZoneWiseStatistics,
  getTripWiseEarning,
} from "../reducers/adminReducers";

export interface EarningStatistics {
  totalEarnings: number;
  rideRequestEarnings: number;
  parcelEarnings: number;
}

export interface ZoneWiseStatistic {
  zoneName: string;
  earnings?: number;
  expenses?: number;
}

export interface TripWiseEarning {
  tripId: string;
  earnings: number;
  zone: string;
  date: string;
}

interface ReportState {
  activeTab: "earning" | "expense";
  timeRange: string;
  earningStatistics: EarningStatistics | null;
  expenseStatistics: any;
  zoneWiseStatistics: ZoneWiseStatistic[];
  tripWiseEarnings: TripWiseEarning[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  activeTab: "earning",
  timeRange: "all",
  earningStatistics: null,
  expenseStatistics: null,
  zoneWiseStatistics: [],
  tripWiseEarnings: [],
  isLoading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<"earning" | "expense">) => {
      state.activeTab = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<string>) => {
      state.timeRange = action.payload;
    },
    clearReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEarningReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEarningReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earningStatistics = action.payload || null;
      })
      .addCase(getEarningReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getExpenseReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExpenseReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseStatistics = action.payload || null;
      })
      .addCase(getExpenseReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getZoneWiseStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getZoneWiseStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zoneWiseStatistics = action.payload || [];
      })
      .addCase(getZoneWiseStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getTripWiseEarning.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTripWiseEarning.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripWiseEarnings = action.payload || [];
      })
      .addCase(getTripWiseEarning.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, setTimeRange, clearReportError } = reportSlice.actions;
export default reportSlice.reducer;

