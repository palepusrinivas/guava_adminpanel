import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getWithdrawMethods,
  getWithdrawMethodById,
  createWithdrawMethod,
  updateWithdrawMethod,
  deleteWithdrawMethod,
  getWithdrawRequests,
  getWithdrawRequestById,
  updateWithdrawRequest,
  approveWithdrawRequest,
  denyWithdrawRequest,
} from "../reducers/adminReducers";

export interface WithdrawMethodField {
  fieldName: string;
  inputType: string;
  placeholder: string;
  isRequired: boolean;
}

export interface WithdrawMethod {
  id: string | number;
  methodName: string;
  methodFields: WithdrawMethodField[];
  defaultMethod: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WithdrawRequest {
  id: string | number;
  amount: number;
  name: string;
  withdrawMethod: string;
  requestTime: string;
  status: "PENDING" | "APPROVED" | "DENIED" | "SETTLED";
  driverId?: string;
  methodDetails?: Record<string, any>;
}

interface WithdrawState {
  methods: WithdrawMethod[];
  selectedMethod: WithdrawMethod | null;
  requests: WithdrawRequest[];
  selectedRequest: WithdrawRequest | null;
  isLoading: boolean;
  error: string | null;
  methodFilter: "all" | "active" | "inactive";
  methodSearchQuery: string;
  requestFilter: "all" | "pending" | "approved" | "settled" | "denied";
  requestSearchQuery: string;
}

const initialState: WithdrawState = {
  methods: [],
  selectedMethod: null,
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  methodFilter: "all",
  methodSearchQuery: "",
  requestFilter: "all",
  requestSearchQuery: "",
};

const withdrawSlice = createSlice({
  name: "withdraw",
  initialState,
  reducers: {
    clearWithdrawError: (state) => {
      state.error = null;
    },
    setMethodFilter: (state, action: PayloadAction<WithdrawState["methodFilter"]>) => {
      state.methodFilter = action.payload;
    },
    setMethodSearchQuery: (state, action: PayloadAction<string>) => {
      state.methodSearchQuery = action.payload;
    },
    setRequestFilter: (state, action: PayloadAction<WithdrawState["requestFilter"]>) => {
      state.requestFilter = action.payload;
    },
    setRequestSearchQuery: (state, action: PayloadAction<string>) => {
      state.requestSearchQuery = action.payload;
    },
    setSelectedMethod: (state, action: PayloadAction<WithdrawMethod | null>) => {
      state.selectedMethod = action.payload;
    },
    setSelectedRequest: (state, action: PayloadAction<WithdrawRequest | null>) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Withdraw Methods
      .addCase(getWithdrawMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWithdrawMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.methods = action.payload || [];
      })
      .addCase(getWithdrawMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getWithdrawMethodById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWithdrawMethodById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMethod = action.payload || null;
      })
      .addCase(getWithdrawMethodById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWithdrawMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWithdrawMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.methods.unshift(action.payload);
      })
      .addCase(createWithdrawMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWithdrawMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWithdrawMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.methods.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.methods[idx] = action.payload;
        if (state.selectedMethod?.id === action.payload.id) {
          state.selectedMethod = action.payload;
        }
      })
      .addCase(updateWithdrawMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWithdrawMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWithdrawMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.methods = state.methods.filter((m) => m.id.toString() !== action.payload);
      })
      .addCase(deleteWithdrawMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Withdraw Requests
      .addCase(getWithdrawRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWithdrawRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload || [];
      })
      .addCase(getWithdrawRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getWithdrawRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWithdrawRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRequest = action.payload || null;
      })
      .addCase(getWithdrawRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWithdrawRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWithdrawRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
        if (state.selectedRequest?.id === action.payload.id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(updateWithdrawRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveWithdrawRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveWithdrawRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(approveWithdrawRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(denyWithdrawRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(denyWithdrawRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(denyWithdrawRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearWithdrawError,
  setMethodFilter,
  setMethodSearchQuery,
  setRequestFilter,
  setRequestSearchQuery,
  setSelectedMethod,
  setSelectedRequest,
} = withdrawSlice.actions;
export default withdrawSlice.reducer;

