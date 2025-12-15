import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import {
    adminWalletCreditUserUrl,
    adminWalletCreditDriverUrl,
    adminWalletDebitUserUrl,
    adminWalletDebitDriverUrl,
    adminWalletManualPaymentUserUrl,
    adminWalletManualPaymentDriverUrl,
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

export interface DebitRequest {
    amount: number;
    reason: string;
    notes?: string;
}

export interface ManualPaymentRequest {
    amount: number;
    paymentMethod: string; // CASH, BANK_TRANSFER, UPI, CHEQUE, OTHER
    referenceNumber?: string;
    notes?: string;
}

export interface TopUpRequest {
    amount: number;
    ownerType: "USER" | "DRIVER";
    ownerId: string;
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
    debitSuccess: boolean;
    manualPaymentSuccess: boolean;
    topUpLink: string | null;
    users: any[];
    drivers: any[];
    workflowStep: number;
}

const initialState: WalletState = {
    balance: null,
    transactions: [],
    isLoading: false,
    error: null,
    creditSuccess: false,
    debitSuccess: false,
    manualPaymentSuccess: false,
    topUpLink: null,
    users: [],
    drivers: [],
    workflowStep: 0,
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

export const debitUserWallet = createAsyncThunk(
    "wallet/debitUser",
    async ({ userId, data }: { userId: string; data: DebitRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletDebitUserUrl(userId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to debit user wallet");
        }
    }
);

export const debitDriverWallet = createAsyncThunk(
    "wallet/debitDriver",
    async ({ driverId, data }: { driverId: string; data: DebitRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletDebitDriverUrl(driverId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to debit driver wallet");
        }
    }
);

export const manualPaymentUser = createAsyncThunk(
    "wallet/manualPaymentUser",
    async ({ userId, data }: { userId: string; data: ManualPaymentRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletManualPaymentUserUrl(userId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to process manual payment for user");
        }
    }
);

export const manualPaymentDriver = createAsyncThunk(
    "wallet/manualPaymentDriver",
    async ({ driverId, data }: { driverId: string; data: ManualPaymentRequest }, { rejectWithValue }) => {
        try {
            const response = await adminAxios.post(adminWalletManualPaymentDriverUrl(driverId), data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to process manual payment for driver");
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
        clearDebitSuccess: (state) => {
            state.debitSuccess = false;
        },
        clearManualPaymentSuccess: (state) => {
            state.manualPaymentSuccess = false;
        },
        setWorkflowStep: (state, action) => {
            state.workflowStep = action.payload;
        },
        resetWalletState: (state) => {
            state.balance = null;
            state.transactions = [];
            state.error = null;
            state.creditSuccess = false;
            state.debitSuccess = false;
            state.manualPaymentSuccess = false;
            state.topUpLink = null;
            state.workflowStep = 0;
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
            // Debit User Wallet
            .addCase(debitUserWallet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.debitSuccess = false;
            })
            .addCase(debitUserWallet.fulfilled, (state) => {
                state.isLoading = false;
                state.debitSuccess = true;
            })
            .addCase(debitUserWallet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Debit Driver Wallet
            .addCase(debitDriverWallet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.debitSuccess = false;
            })
            .addCase(debitDriverWallet.fulfilled, (state) => {
                state.isLoading = false;
                state.debitSuccess = true;
            })
            .addCase(debitDriverWallet.rejected, (state, action) => {
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
                const data = action.payload?.content || action.payload;
                state.users = Array.isArray(data) ? data : [];
            })
            // Get Drivers
            .addCase(getDrivers.fulfilled, (state, action) => {
                const data = action.payload?.content || action.payload;
                state.drivers = Array.isArray(data) ? data : [];
            })
            // Manual Payment User
            .addCase(manualPaymentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.manualPaymentSuccess = false;
            })
            .addCase(manualPaymentUser.fulfilled, (state) => {
                state.isLoading = false;
                state.manualPaymentSuccess = true;
            })
            .addCase(manualPaymentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Manual Payment Driver
            .addCase(manualPaymentDriver.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.manualPaymentSuccess = false;
            })
            .addCase(manualPaymentDriver.fulfilled, (state) => {
                state.isLoading = false;
                state.manualPaymentSuccess = true;
            })
            .addCase(manualPaymentDriver.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearWalletError, clearCreditSuccess, clearDebitSuccess, clearManualPaymentSuccess, setWorkflowStep, resetWalletState } = walletSlice.actions;
export { getUsers, getDrivers };
export default walletSlice.reducer;
