import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import {
    adminWalletCreditUserUrl,
    adminWalletCreditDriverUrl,
    walletBalanceUrl,
    walletTransactionsUrl,
    walletTopUpUrl,
} from "../apiRoutes";
import { getUsers, getDrivers } from "../reducers/adminReducers";

// Interfaces
export interface CreditRequest {
    amount: number;
    notes: string;
}

export interface TopUpRequest {
    amount: number;
    ownerType: "USER" | "DRIVER";
}

export interface TopUpResponse {
    paymentLinkUrl: string;
    paymentLinkId: string;
    amount: number;
    transactionId: number;
    status: string;
}

export interface BalanceResponse {
    balance: number;
}

export interface WalletTransaction {
    id: number;
    wallet: {
        id: number;
        ownerType: "USER" | "DRIVER";
        ownerId: string;
        balance: number;
        currency: string;
        createdAt: string;
        updatedAt: string;
    };
    type: "CREDIT" | "DEBIT";
    amount: number;
    currency: string;
    referenceType: string;
    referenceId: string;
    status: string;
    notes: string;
    createdAt: string;
}

interface WalletState {
    balance: number | null;
    transactions: WalletTransaction[];
    isLoading: boolean;
    error: string | null;
    creditSuccess: boolean;
    topUpLink: string | null;
    users: any[];
    drivers: any[];
}

const initialState: WalletState = {
    balance: null,
    transactions: [],
    isLoading: false,
    error: null,
    creditSuccess: false,
    topUpLink: null,
    users: [],
    drivers: [],
};

// Async Thunks
export const creditUserWallet = createAsyncThunk(
    "wallet/creditUser",
    async ({ userId, data }: { userId: string; data: CreditRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletCreditUserUrl(userId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to credit user wallet");
        }
    }
);

export const creditDriverWallet = createAsyncThunk(
    "wallet/creditDriver",
    async ({ driverId, data }: { driverId: string; data: CreditRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletCreditDriverUrl(driverId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to credit driver wallet");
        }
    }
);

export const getWalletBalance = createAsyncThunk(
    "wallet/getBalance",
    async ({ ownerType, ownerId }: { ownerType: string; ownerId: string }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.get(walletBalanceUrl(ownerType, ownerId));
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch wallet balance");
        }
    }
);

export const getWalletTransactions = createAsyncThunk(
    "wallet/getTransactions",
    async ({ ownerType, ownerId }: { ownerType: string; ownerId: string }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.get(walletTransactionsUrl(ownerType, ownerId));
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
        }
    }
);



export const initiateWalletTopUp = createAsyncThunk(
    "wallet/initiateTopUp",
    async (data: TopUpRequest, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(walletTopUpUrl, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to initiate top-up");
        }
    }
);

// Slice
const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        clearWalletError: (state) => {
            state.error = null;
        },
        clearCreditSuccess: (state) => {
            state.creditSuccess = false;
        },
        resetWalletState: (state) => {
            state.balance = null;
            state.transactions = [];
            state.error = null;
            state.creditSuccess = false;
            state.topUpLink = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Credit User Wallet
            .addCase(creditUserWallet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.creditSuccess = false;
            })
            .addCase(creditUserWallet.fulfilled, (state) => {
                state.isLoading = false;
                state.creditSuccess = true;
            })
            .addCase(creditUserWallet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Credit Driver Wallet
            .addCase(creditDriverWallet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.creditSuccess = false;
            })
            .addCase(creditDriverWallet.fulfilled, (state) => {
                state.isLoading = false;
                state.creditSuccess = true;
            })
            .addCase(creditDriverWallet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Balance
            .addCase(getWalletBalance.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getWalletBalance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.balance = action.payload.balance;
            })
            .addCase(getWalletBalance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Transactions
            .addCase(getWalletTransactions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getWalletTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = action.payload;
            })
            .addCase(getWalletTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Initiate Top Up
            .addCase(initiateWalletTopUp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.topUpLink = null;
            })
            .addCase(initiateWalletTopUp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.topUpLink = action.payload.paymentLinkUrl;
            })
            .addCase(initiateWalletTopUp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Users
            .addCase(getUsers.fulfilled, (state, action) => {
                state.users = action.payload.content || action.payload || [];
            })
            // Get Drivers
            .addCase(getDrivers.fulfilled, (state, action) => {
                state.drivers = action.payload.content || action.payload || [];
            });
    },
});

export const { clearWalletError, clearCreditSuccess, resetWalletState } = walletSlice.actions;
export { getUsers, getDrivers };
export default walletSlice.reducer;
