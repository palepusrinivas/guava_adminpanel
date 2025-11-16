import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../reducers/adminReducers";

// Banner Interface
export interface Banner {
  id: number;
  title: string;
  shortDescription: string;
  redirectLink: string;
  timePeriod: string;
  imageUrl: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Banner State Interface
interface BannerState {
  banners: Banner[];
  selectedBanner: Banner | null;
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'active' | 'inactive';
}

const initialState: BannerState = {
  banners: [],
  selectedBanner: null,
  isLoading: false,
  error: null,
  filter: 'all',
};

// Banner Slice
const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },
    setSelectedBanner: (state, action: PayloadAction<Banner | null>) => {
      state.selectedBanner = action.payload;
    },
    setFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Banners
    builder
      .addCase(getBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
        state.error = null;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Banner By ID
    builder
      .addCase(getBannerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBannerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBanner = action.payload;
        state.error = null;
      })
      .addCase(getBannerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Banner
    builder
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Banner
    builder
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Banner
    builder
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = state.banners.filter((b) => b.id.toString() !== action.payload);
        state.error = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBannerError, setSelectedBanner, setFilter } = bannerSlice.actions;
export default bannerSlice.reducer;


