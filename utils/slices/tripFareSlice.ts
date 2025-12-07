import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getOperationZones,
  getOperationZoneById,
  getTripFareSetup,
  getTripFareSetupByZone,
  getParcelFareSetup,
  getParcelFareSetupByZone,
} from "../reducers/adminReducers";

export interface VehicleCategory {
  name: string;
  checked: boolean;
}

export interface OperationZone {
  id: string | number;
  name: string;
  totalDrivers: number;
  vehicleCategories?: VehicleCategory[];
  parcelCategories?: VehicleCategory[];
  fareSetup?: any;
  parcelFareSetup?: any;
}

export interface TripFare {
  id: string | number;
  zoneId: string | number;
  vehicleCategory: string;
  baseFare?: number;
  perKmRate?: number;
  perMinuteRate?: number;
  minimumFare?: number;
  surgeMultiplier?: number;
  cancellationFee?: number;
}

interface TripFareState {
  operationZones: OperationZone[];
  selectedZone: OperationZone | null;
  tripFares: TripFare[];
  parcelFares: TripFare[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: TripFareState = {
  operationZones: [],
  selectedZone: null,
  tripFares: [],
  parcelFares: [],
  isLoading: false,
  error: null,
  searchQuery: "",
};

const tripFareSlice = createSlice({
  name: "tripFare",
  initialState,
  reducers: {
    clearTripFareError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedZone: (state, action: PayloadAction<OperationZone | null>) => {
      state.selectedZone = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Operation Zones
      .addCase(getOperationZones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOperationZones.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and paginated response
        const payload = action.payload || {};
        if (Array.isArray(payload)) {
          state.operationZones = payload;
        } else if (payload.content && Array.isArray(payload.content)) {
          state.operationZones = payload.content;
        } else {
          state.operationZones = [];
        }
      })
      .addCase(getOperationZones.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getOperationZoneById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOperationZoneById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedZone = action.payload || null;
      })
      .addCase(getOperationZoneById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Trip Fare Setup
      .addCase(getTripFareSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTripFareSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripFares = action.payload || [];
      })
      .addCase(getTripFareSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getTripFareSetupByZone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTripFareSetupByZone.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update fare setup for the zone
        const zoneId = action.payload?.zoneId;
        if (zoneId) {
          const zone = state.operationZones.find((z) => z.id === zoneId);
          if (zone) {
            zone.fareSetup = action.payload;
          }
        }
      })
      .addCase(getTripFareSetupByZone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Parcel Fare Setup
      .addCase(getParcelFareSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelFareSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parcelFares = action.payload || [];
      })
      .addCase(getParcelFareSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getParcelFareSetupByZone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelFareSetupByZone.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update parcel fare setup for the zone
        const zoneId = action.payload?.zoneId;
        if (zoneId) {
          const zone = state.operationZones.find((z) => z.id === zoneId);
          if (zone) {
            zone.parcelFareSetup = action.payload;
          }
        }
      })
      .addCase(getParcelFareSetupByZone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTripFareError, setSearchQuery, setSelectedZone } = tripFareSlice.actions;
export default tripFareSlice.reducer;

