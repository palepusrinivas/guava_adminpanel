import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getTransactions, getTransactionById } from "../reducers/adminReducers";

export interface Transaction {
  id: string | number;
  transactionId: string;
  reference?: string;
  transactionDate: string;
  transactionTo: string;
  transactionToType?: string; // "Receivable Balance", "Received Balance", "Payable Balance", "Wallet Balance"
  credit: number;
  debit: number;
  balance: number;
}

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  totalTransactions: number;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  totalTransactions: 0,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload || {};
        state.transactions = Array.isArray(data) ? data : data.transactions || [];
        state.totalTransactions = data.total || state.transactions.length;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransaction = action.payload || null;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionError, setSearchQuery, setSelectedTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

