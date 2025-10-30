"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

interface WalletManagementProps {
  onCreditUserWallet: (userId: string, amount: number, notes: string) => void;
  onCreditDriverWallet: (driverId: string, amount: number, notes: string) => void;
}

const creditValidationSchema = yup.object({
  userId: yup.string().required("User ID is required"),
  amount: yup.number().min(0.01, "Amount must be greater than 0").required("Amount is required"),
  notes: yup.string().required("Notes are required"),
});

const driverCreditValidationSchema = yup.object({
  driverId: yup.string().required("Driver ID is required"),
  amount: yup.number().min(0.01, "Amount must be greater than 0").required("Amount is required"),
  notes: yup.string().required("Notes are required"),
});

function WalletManagement({ onCreditUserWallet, onCreditDriverWallet }: WalletManagementProps) {
  const [showUserCreditModal, setShowUserCreditModal] = useState(false);
  const [showDriverCreditModal, setShowDriverCreditModal] = useState(false);

  const userCreditFormik = useFormik({
    initialValues: {
      userId: "",
      amount: 0,
      notes: "",
    },
    validationSchema: creditValidationSchema,
    onSubmit: (values) => {
      onCreditUserWallet(values.userId, values.amount, values.notes);
      setShowUserCreditModal(false);
      userCreditFormik.resetForm();
    },
  });

  const driverCreditFormik = useFormik({
    initialValues: {
      driverId: "",
      amount: 0,
      notes: "",
    },
    validationSchema: driverCreditValidationSchema,
    onSubmit: (values) => {
      onCreditDriverWallet(values.driverId, values.amount, values.notes);
      setShowDriverCreditModal(false);
      driverCreditFormik.resetForm();
    },
  });

  // Sample wallet data - replace with actual data from Redux store
  const walletStats = {
    totalUserWallets: 1250,
    totalDriverWallets: 89,
    totalCreditsToday: 15000,
    totalDebitsToday: 12000,
  };

  const recentTransactions = [
    { id: 1, type: "credit", user: "John Doe", amount: 500, notes: "Refund for cancelled ride", timestamp: "2 minutes ago" },
    { id: 2, type: "debit", user: "Jane Smith", amount: 250, notes: "Ride payment", timestamp: "5 minutes ago" },
    { id: 3, type: "credit", user: "Mike Johnson", amount: 1000, notes: "Bonus payment", timestamp: "10 minutes ago" },
    { id: 4, type: "debit", user: "Sarah Wilson", amount: 300, notes: "Ride payment", timestamp: "15 minutes ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-gray-600">Manage user and driver wallets</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUserCreditModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Credit User Wallet
          </button>
          <button
            onClick={() => setShowDriverCreditModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Credit Driver Wallet
          </button>
        </div>
      </div>

      {/* Wallet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">User Wallets</dt>
                  <dd className="text-lg font-medium text-gray-900">{walletStats.totalUserWallets.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🚗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Driver Wallets</dt>
                  <dd className="text-lg font-medium text-gray-900">{walletStats.totalDriverWallets}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Credits Today</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{walletStats.totalCreditsToday.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💸</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Debits Today</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{walletStats.totalDebitsToday.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <span className={`text-sm ${
                      transaction.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "credit" ? "↗" : "↘"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{transaction.user}</div>
                    <div className="text-sm text-gray-500">{transaction.notes}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    transaction.type === "credit" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                  </div>
                  <div className="text-sm text-gray-500">{transaction.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit User Wallet Modal */}
      {showUserCreditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credit User Wallet</h3>
              <form onSubmit={userCreditFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    name="userId"
                    value={userCreditFormik.values.userId}
                    onChange={userCreditFormik.handleChange}
                    onBlur={userCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter user ID"
                  />
                  {userCreditFormik.touched.userId && userCreditFormik.errors.userId && (
                    <p className="mt-1 text-sm text-red-600">{userCreditFormik.errors.userId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={userCreditFormik.values.amount}
                    onChange={userCreditFormik.handleChange}
                    onBlur={userCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                  {userCreditFormik.touched.amount && userCreditFormik.errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{userCreditFormik.errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={userCreditFormik.values.notes}
                    onChange={userCreditFormik.handleChange}
                    onBlur={userCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter notes for this transaction"
                  />
                  {userCreditFormik.touched.notes && userCreditFormik.errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{userCreditFormik.errors.notes}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserCreditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Credit Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Credit Driver Wallet Modal */}
      {showDriverCreditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Driver Wallet</h3>
              <form onSubmit={driverCreditFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver ID</label>
                  <input
                    type="text"
                    name="driverId"
                    value={driverCreditFormik.values.driverId}
                    onChange={driverCreditFormik.handleChange}
                    onBlur={driverCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter driver ID"
                  />
                  {driverCreditFormik.touched.driverId && driverCreditFormik.errors.driverId && (
                    <p className="mt-1 text-sm text-red-600">{driverCreditFormik.errors.driverId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={driverCreditFormik.values.amount}
                    onChange={driverCreditFormik.handleChange}
                    onBlur={driverCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                  {driverCreditFormik.touched.amount && driverCreditFormik.errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{driverCreditFormik.errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={driverCreditFormik.values.notes}
                    onChange={driverCreditFormik.handleChange}
                    onBlur={driverCreditFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter notes for this transaction"
                  />
                  {driverCreditFormik.touched.notes && driverCreditFormik.errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{driverCreditFormik.errors.notes}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDriverCreditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                  >
                    Credit Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletManagement;
