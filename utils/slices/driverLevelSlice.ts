import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDriverLevels, getDriverLevelById, createDriverLevel, updateDriverLevel, deleteDriverLevel } from "../reducers/adminReducers";

export interface DriverLevel {
  id: number;
  name: string;
  targets?: {
    rideComplete?: number;
    earningAmount?: number;
    cancellationRate?: number;
    givenReview?: number;
  };
  totalTrip?: number;
  maxCancellationRate?: number;
  totalDriver?: number;
  active: boolean;
}

interface DriverLevelState {
  levels: DriverLevel[];
  selectedLevel: DriverLevel | null;
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "inactive";
  searchQuery: string;
}

const initialState: DriverLevelState = {
  levels: [],
  selectedLevel: null,
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
};

const driverLevelSlice = createSlice({
  name: "driverLevel",
  initialState,
  reducers: {
    clearDriverLevelError: (state) => { state.error = null; },
    setDriverLevelFilter: (state, action: PayloadAction<DriverLevelState["filter"]>) => { state.filter = action.payload; },
    setDriverLevelSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; },
    setSelectedDriverLevel: (state, action: PayloadAction<DriverLevel | null>) => { state.selectedLevel = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDriverLevels.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getDriverLevels.fulfilled, (state, action) => { state.isLoading = false; state.levels = action.payload || []; })
      .addCase(getDriverLevels.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(getDriverLevelById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getDriverLevelById.fulfilled, (state, action) => { state.isLoading = false; state.selectedLevel = action.payload || null; })
      .addCase(getDriverLevelById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createDriverLevel.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createDriverLevel.fulfilled, (state, action) => { state.isLoading = false; if (action.payload) state.levels.unshift(action.payload); })
      .addCase(createDriverLevel.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(updateDriverLevel.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateDriverLevel.fulfilled, (state, action) => { state.isLoading = false; const i = state.levels.findIndex(l => l.id === action.payload.id); if (i!==-1) state.levels[i] = action.payload; })
      .addCase(updateDriverLevel.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(deleteDriverLevel.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(deleteDriverLevel.fulfilled, (state, action) => { state.isLoading = false; state.levels = state.levels.filter(l => l.id.toString() !== action.payload); })
      .addCase(deleteDriverLevel.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  }
});

export const { clearDriverLevelError, setDriverLevelFilter, setDriverLevelSearchQuery, setSelectedDriverLevel } = driverLevelSlice.actions;
export default driverLevelSlice.reducer;






