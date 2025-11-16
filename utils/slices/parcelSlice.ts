import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getParcelCategories,
  getParcelCategoryById,
  createParcelCategory,
  updateParcelCategory,
  deleteParcelCategory,
  getParcelWeights,
  getParcelWeightById,
  createParcelWeight,
  updateParcelWeight,
  deleteParcelWeight,
} from "../reducers/adminReducers";

export interface ParcelCategory {
  id: string | number;
  categoryName: string;
  shortDescription?: string;
  categoryIcon?: string;
  totalDelivered?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParcelWeight {
  id: string | number;
  minimumWeight: number;
  maximumWeight: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ParcelState {
  categories: ParcelCategory[];
  selectedCategory: ParcelCategory | null;
  weights: ParcelWeight[];
  selectedWeight: ParcelWeight | null;
  isLoading: boolean;
  error: string | null;
  categoryFilter: "all" | "active" | "inactive";
  categorySearchQuery: string;
  weightFilter: "all" | "active" | "inactive";
  weightSearchQuery: string;
}

const initialState: ParcelState = {
  categories: [],
  selectedCategory: null,
  weights: [],
  selectedWeight: null,
  isLoading: false,
  error: null,
  categoryFilter: "all",
  categorySearchQuery: "",
  weightFilter: "all",
  weightSearchQuery: "",
};

const parcelSlice = createSlice({
  name: "parcel",
  initialState,
  reducers: {
    clearParcelError: (state) => {
      state.error = null;
    },
    setCategoryFilter: (state, action: PayloadAction<ParcelState["categoryFilter"]>) => {
      state.categoryFilter = action.payload;
    },
    setCategorySearchQuery: (state, action: PayloadAction<string>) => {
      state.categorySearchQuery = action.payload;
    },
    setWeightFilter: (state, action: PayloadAction<ParcelState["weightFilter"]>) => {
      state.weightFilter = action.payload;
    },
    setWeightSearchQuery: (state, action: PayloadAction<string>) => {
      state.weightSearchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<ParcelCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedWeight: (state, action: PayloadAction<ParcelWeight | null>) => {
      state.selectedWeight = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Parcel Categories
      .addCase(getParcelCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(getParcelCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getParcelCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload || null;
      })
      .addCase(getParcelCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createParcelCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createParcelCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.categories.unshift(action.payload);
      })
      .addCase(createParcelCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateParcelCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParcelCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.categories.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.categories[idx] = action.payload;
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateParcelCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteParcelCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteParcelCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter((c) => c.id.toString() !== action.payload);
      })
      .addCase(deleteParcelCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Parcel Weights
      .addCase(getParcelWeights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelWeights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weights = action.payload || [];
      })
      .addCase(getParcelWeights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getParcelWeightById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParcelWeightById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedWeight = action.payload || null;
      })
      .addCase(getParcelWeightById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createParcelWeight.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createParcelWeight.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.weights.unshift(action.payload);
      })
      .addCase(createParcelWeight.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateParcelWeight.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParcelWeight.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.weights.findIndex((w) => w.id === action.payload.id);
        if (idx !== -1) state.weights[idx] = action.payload;
        if (state.selectedWeight?.id === action.payload.id) {
          state.selectedWeight = action.payload;
        }
      })
      .addCase(updateParcelWeight.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteParcelWeight.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteParcelWeight.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weights = state.weights.filter((w) => w.id.toString() !== action.payload);
      })
      .addCase(deleteParcelWeight.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearParcelError,
  setCategoryFilter,
  setCategorySearchQuery,
  setWeightFilter,
  setWeightSearchQuery,
  setSelectedCategory,
  setSelectedWeight,
} = parcelSlice.actions;
export default parcelSlice.reducer;

