import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon } from "../reducers/adminReducers";

export interface Coupon {
  id: number;
  title: string;
  code: string;
  couponType: string; // percentage, flat, etc.
  zone?: string;
  customerLevel?: string;
  customer?: string;
  category?: string;
  amount: number;
  duration?: string;
  totalTimesUsed?: number;
  totalAmount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CouponState {
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "inactive";
  searchQuery: string;
}

const initialState: CouponState = {
  coupons: [],
  selectedCoupon: null,
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },
    setCouponFilter: (state, action: PayloadAction<CouponState["filter"]>) => {
      state.filter = action.payload;
    },
    setCouponSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCoupon: (state, action: PayloadAction<Coupon | null>) => {
      state.selectedCoupon = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload || [];
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCouponById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCoupon = action.payload || null;
      })
      .addCase(getCouponById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.coupons[idx] = action.payload;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = state.coupons.filter((c) => c.id.toString() !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCouponError, setCouponFilter, setCouponSearchQuery, setSelectedCoupon } = couponSlice.actions;
export default couponSlice.reducer;

