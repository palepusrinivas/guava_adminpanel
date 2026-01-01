"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getTransactions } from "@/utils/reducers/adminReducers";
import { setSearchQuery } from "@/utils/slices/transactionSlice";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
};

export default function TransactionList() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, error, searchQuery, totalTransactions } = useAppSelector(
    (s) => s.transaction
  );

  useEffect(() => {
    dispatch(getTransactions({})).catch(() => {});
  }, [dispatch]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.transactionId.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q) ||
        t.transactionTo.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Sample data if API is not available - matching the image
  const sampleTransactions = [
    {
      id: 1,
      transactionId: "20d350e1-cc40-4333-b713-6a5c4c81029e",
      reference: "8895c4e7-1eb1-4066-abe5-325c14bc917c",
      transactionDate: "31-10-2025 10:14 AM",
      transactionTo: "Gauva Mobility Services",
      transactionToType: "Receivable Balance",
      credit: 2,
      debit: 0,
      balance: 1947,
      status: "PAID",
    },
    {
      id: 2,
      transactionId: "732d7f58-5904-4bab-b825-d3172f9d7d81",
      reference: "",
      transactionDate: "31-10-2025 10:14 AM",
      transactionTo: "RAMESH KODURI",
      transactionToType: "Received Balance",
      credit: 33,
      debit: 0,
      balance: 1255,
      status: "PAID",
    },
    {
      id: 3,
      transactionId: "8895c4e7-1eb1-4066-abe5-325c14bc917c",
      reference: "732d7f58-5904-4bab-b825-d3172f9d7d81",
      transactionDate: "31-10-2025 10:14 AM",
      transactionTo: "RAMESH KODURI",
      transactionToType: "Payable Balance",
      credit: 2,
      debit: 0,
      balance: 95,
      status: "PENDING",
    },
    {
      id: 4,
      transactionId: "ce9177c2-f466-4294-9ccb-3c084cf5e651",
      reference: "",
      transactionDate: "31-10-2025 10:12 AM",
      transactionTo: "chandramouli Marisetti",
      transactionToType: "Wallet Balance",
      credit: 50,
      debit: 0,
      balance: 50,
      status: "COMPLETED",
    },
  ];

  const transactionsToDisplay =
    isLoading || transactions.length === 0 ? sampleTransactions : filteredTransactions;
  const displayTotal = totalTransactions || transactionsToDisplay.length;

  const handleSearch = () => {
    dispatch(getTransactions({ searchQuery })).catch(() => {});
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log("Download transactions");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transaction List</h2>
        <div className="text-white font-medium">Total Transactions: {displayTotal}</div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
          Unable to load transactions from server. Displaying sample data. Ensure backend endpoints are implemented.
          Error: {error}
        </div>
      )}

      {/* Search and Download Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 flex-1">
            <input
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search Here by Transa"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium whitespace-nowrap"
            >
              Search
            </button>
          </div>
          <div className="ml-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 font-medium"
            >
              <span>Download</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Transaction Id</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Transaction Date</th>
                <th className="px-4 py-3 text-left">Transaction To</th>
                <th className="px-4 py-3 text-left">Credit</th>
                <th className="px-4 py-3 text-left">Debit</th>
                <th className="px-4 py-3 text-left">Balance</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactionsToDisplay.map((transaction, idx) => (
                <tr key={transaction.id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{transaction.transactionId}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {transaction.reference || "-"}
                  </td>
                  <td className="px-4 py-3">{transaction.transactionDate}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{transaction.transactionTo}</div>
                      {transaction.transactionToType && (
                        <div className="text-xs text-gray-500">{transaction.transactionToType}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">₹{transaction.credit}</td>
                  <td className="px-4 py-3">₹{transaction.debit}</td>
                  <td className="px-4 py-3 font-medium">₹{transaction.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {transaction.status ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "PAID" || transaction.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "PENDING" || transaction.status === "CREATED" || transaction.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : transaction.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : transaction.status === "REFUNDED" || transaction.status === "PARTIAL_REFUNDED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && transactionsToDisplay.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

