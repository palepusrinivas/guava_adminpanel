import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../reducers/adminReducers";

export interface Customer {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  customerImage?: string;
  identityType?: string;
  identityNumber?: string;
  identityImage?: string;
  password?: string;
  profileStatus?: number; // Percentage
  level?: string;
  totalTrip?: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  filter: "all" | string; // "all" or level name like "Level 1"
  searchQuery: string;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    setCustomerFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setCustomerSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload || [];
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload || null;
      })
      .addCase(getCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.customers.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.customers.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.customers[idx] = action.payload;
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.filter((c) => c.id.toString() !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCustomerError,
  setCustomerFilter,
  setCustomerSearchQuery,
  setSelectedCustomer,
} = customerSlice.actions;
export default customerSlice.reducer;

