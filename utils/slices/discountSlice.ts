import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount } from "../reducers/adminReducers";

export interface Discount {
  id: number;
  title: string;
  imageUrl?: string;
  zone?: string;
  customerLevel?: string;
  customer?: string;
  category?: string;
  amount: number;
  duration?: string;
  totalTimesUsed?: number;
  totalAmount?: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface DiscountState {
  discounts: Discount[];
  selectedDiscount: Discount | null;
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "inactive";
  searchQuery: string;
}

const initialState: DiscountState = {
  discounts: [],
  selectedDiscount: null,
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscountError: (state) => { state.error = null; },
    setDiscountFilter: (state, action: PayloadAction<DiscountState["filter"]>) => { state.filter = action.payload; },
    setDiscountSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; },
    setSelectedDiscount: (state, action: PayloadAction<Discount | null>) => { state.selectedDiscount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDiscounts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getDiscounts.fulfilled, (state, action) => { state.isLoading = false; state.discounts = action.payload || []; })
      .addCase(getDiscounts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(getDiscountById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getDiscountById.fulfilled, (state, action) => { state.isLoading = false; state.selectedDiscount = action.payload || null; })
      .addCase(getDiscountById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createDiscount.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createDiscount.fulfilled, (state, action) => { state.isLoading = false; if (action.payload) state.discounts.unshift(action.payload); })
      .addCase(createDiscount.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(updateDiscount.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateDiscount.fulfilled, (state, action) => { state.isLoading = false; const i = state.discounts.findIndex(d => d.id === action.payload.id); if (i!==-1) state.discounts[i] = action.payload; })
      .addCase(updateDiscount.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(deleteDiscount.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(deleteDiscount.fulfilled, (state, action) => { state.isLoading = false; state.discounts = state.discounts.filter(d => d.id.toString() !== action.payload); })
      .addCase(deleteDiscount.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  }
});

export const { clearDiscountError, setDiscountFilter, setDiscountSearchQuery, setSelectedDiscount } = discountSlice.actions;
export default discountSlice.reducer;
