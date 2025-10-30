import { createSlice } from "@reduxjs/toolkit";
import { getFleetLocations } from "../reducers/adminReducers";

export interface FleetDriver {
  id: string | number;
  driverId?: string;
  name: string;
  phone?: string;
  mobile?: string;
  vehicleNo?: string;
  vehicleNumber?: string;
  model?: string;
  vehicleModel?: string;
  status: string;
  isNew?: boolean;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
}

interface FleetState {
  locations: FleetDriver[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FleetState = {
  locations: [],
  isLoading: false,
  error: null,
};

const fleetSlice = createSlice({
  name: "fleet",
  initialState,
  reducers: {
    clearFleetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFleetLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFleetLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload || [];
        state.error = null;
      })
      .addCase(getFleetLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch fleet locations';
      });
  },
});

export const { clearFleetError } = fleetSlice.actions;
export default fleetSlice.reducer;

