import { createSlice } from "@reduxjs/toolkit";
import { getAllTrips, getTripById } from "../reducers/adminReducers";

export type TripStatus = "all" | "pending" | "accepted" | "ongoing" | "completed" | "cancelled" | "returning" | "returned";

export interface Trip {
  id: number;
  tripId: string;
  date: string;
  customerName: string;
  customerId?: string;
  driverName: string | null;
  driverId?: string;
  tripType: "ride_request" | "parcel";
  status: TripStatus;
  tripCost: number;
  couponDiscount: number;
  delayFee: number;
  idleFee: number;
  cancellationFee: number;
  vatTax: number;
  totalTripCost: number;
  adminCommission: number;
  tripPayment: string;
  pickupLocation?: string;
  dropLocation?: string;
  distance?: number;
  duration?: number;
}

export interface TripStatistics {
  pending: number;
  accepted: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  returning: number;
  returned: number;
  total: number;
}

interface TripManagementState {
  trips: Trip[];
  statistics: TripStatistics;
  isLoading: boolean;
  error: string | null;
  selectedTrip: Trip | null;
  filters: {
    status: TripStatus;
    searchTerm: string;
    dateFilter: string;
  };
}

const initialState: TripManagementState = {
  trips: [],
  statistics: {
    pending: 0,
    accepted: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    returning: 0,
    returned: 0,
    total: 0,
  },
  isLoading: false,
  error: null,
  selectedTrip: null,
  filters: {
    status: "all",
    searchTerm: "",
    dateFilter: "all",
  },
};

const tripManagementSlice = createSlice({
  name: "tripManagement",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
    setDateFilter: (state, action) => {
      state.filters.dateFilter = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        searchTerm: "",
        dateFilter: "all",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all trips
      .addCase(getAllTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload.trips || [];
        state.statistics = action.payload.statistics || initialState.statistics;
        state.error = null;
      })
      .addCase(getAllTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get trip by ID
      .addCase(getTripById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTripById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTrip = action.payload;
        state.error = null;
      })
      .addCase(getTripById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setStatusFilter, setSearchTerm, setDateFilter, clearFilters } = tripManagementSlice.actions;
export default tripManagementSlice.reducer;


