import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} from "../reducers/adminReducers";

// Zone Interface
export interface Zone {
  id: number;
  readableId: string;
  name: string;
  polygonWkt: string;
  active: boolean;
}

// Zone State Interface
interface ZoneState {
  zones: Zone[];
  selectedZone: Zone | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ZoneState = {
  zones: [],
  selectedZone: null,
  isLoading: false,
  error: null,
};

// Zone Slice
const zoneSlice = createSlice({
  name: "zone",
  initialState,
  reducers: {
    clearZoneError: (state) => {
      state.error = null;
    },
    setSelectedZone: (state, action: PayloadAction<Zone | null>) => {
      state.selectedZone = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Zones
    builder
      .addCase(getZones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getZones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zones = action.payload;
        state.error = null;
      })
      .addCase(getZones.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Zone By ID
    builder
      .addCase(getZoneById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getZoneById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedZone = action.payload;
        state.error = null;
      })
      .addCase(getZoneById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Zone
    builder
      .addCase(createZone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createZone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zones.push(action.payload);
        state.error = null;
      })
      .addCase(createZone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Zone
    builder
      .addCase(updateZone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateZone.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.zones.findIndex((z) => z.id === action.payload.id);
        if (index !== -1) {
          state.zones[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateZone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Zone
    builder
      .addCase(deleteZone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteZone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zones = state.zones.filter((z) => z.id.toString() !== action.payload);
        state.error = null;
      })
      .addCase(deleteZone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearZoneError, setSelectedZone } = zoneSlice.actions;
export default zoneSlice.reducer;

