"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getCustomers,
  getCustomerWalletTransactions,
  addFundToCustomerWallet,
} from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

const schema = yup.object({
  customerId: yup.string().required("Customer is required"),
  amount: yup.number().positive("Amount must be positive").required("Amount is required"),
  reference: yup.string().max(800, "Reference must be less than 800 characters"),
});

export default function CustomerWallet() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { customers } = useAppSelector((s) => s.customer);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [filterCustomerId, setFilterCustomerId] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    dispatch(getCustomers()).catch(() => {});
    dispatch(getCustomerWalletTransactions({})).then((result: any) => {
      if (result.payload) {
        setTransactions(Array.isArray(result.payload) ? result.payload : []);
      }
    });
  }, [dispatch]);

  const addFundFormik = useFormik({
    initialValues: {
      customerId: "",
      amount: "",
      reference: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        setIsLoading(true);
        const result = await dispatch(
          addFundToCustomerWallet({
            customerId: values.customerId,
            amount: Number(values.amount),
            reference: values.reference || undefined,
          })
        );
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Fund added successfully!");
          addFundFormik.resetForm();
          dispatch(getCustomerWalletTransactions({})).then((result: any) => {
            if (result.payload) {
              setTransactions(Array.isArray(result.payload) ? result.payload : []);
            }
          });
          setTimeout(() => setSubmitSuccess(null), 3000);
        } else {
          throw new Error((result as any).payload || "Failed to add fund");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to add fund. Ensure backend API is ready.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterCustomerId) params.customerId = filterCustomerId;
      if (dateRange) {
        const dates = dateRange.split(" - ");
        if (dates.length === 2) {
          params.startDate = dates[0];
          params.endDate = dates[1];
        }
      }
      const result = await dispatch(getCustomerWalletTransactions(params));
      if (result.payload) {
        setTransactions(Array.isArray(result.payload) ? result.payload : []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.customerName?.toLowerCase().includes(q) ||
        t.customerPhone?.toLowerCase().includes(q) ||
        t.transactionId?.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Add Fund Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="bg-teal-500 rounded-t-xl p-4">
          <h2 className="text-xl font-bold text-white">Add Fund</h2>
        </div>
        <div className="p-6">
          {submitSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
          )}
          <form onSubmit={addFundFormik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                name="customerId"
                value={addFundFormik.values.customerId}
                onChange={addFundFormik.handleChange}
                onBlur={addFundFormik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} ({customer.phone})
                  </option>
                ))}
              </select>
              {addFundFormik.touched.customerId && addFundFormik.errors.customerId && (
                <p className="text-sm text-red-600 mt-1">{addFundFormik.errors.customerId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                value={addFundFormik.values.amount}
                onChange={addFundFormik.handleChange}
                onBlur={addFundFormik.handleBlur}
                placeholder="Ex: 100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {addFundFormik.touched.amount && addFundFormik.errors.amount && (
                <p className="text-sm text-red-600 mt-1">{addFundFormik.errors.amount}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
              <textarea
                name="reference"
                value={addFundFormik.values.reference}
                onChange={(e) => {
                  addFundFormik.setFieldValue("reference", e.target.value);
                }}
                onBlur={addFundFormik.handleBlur}
                rows={4}
                maxLength={800}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <div className="flex justify-between items-center mt-1">
                <div></div>
                <span className="text-xs text-gray-500">
                  {addFundFormik.values.reference.length}/800
                </span>
              </div>
              {addFundFormik.touched.reference && addFundFormik.errors.reference && (
                <p className="text-sm text-red-600 mt-1">{addFundFormik.errors.reference}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Wallet Transaction Report Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="bg-teal-500 rounded-t-xl p-4">
          <h2 className="text-xl font-bold text-white">Wallet Transaction Report</h2>
        </div>
        <div className="p-6">
          {/* Filter Data Section */}
          <div className="bg-teal-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">FILTER DATA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  value={filterCustomerId}
                  onChange={(e) => setFilterCustomerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="Date Range"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Search and Download */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative w-full">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here by Transac"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
            </div>
            <div>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">SL</th>
                  <th className="px-4 py-3 text-left">Customer Name</th>
                  <th className="px-4 py-3 text-left">Customer Phone</th>
                  <th className="px-4 py-3 text-left">Transaction Id</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Transaction Date</th>
                  <th className="px-4 py-3 text-left">Debit</th>
                  <th className="px-4 py-3 text-left">Credit</th>
                  <th className="px-4 py-3 text-left">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((transaction, idx) => (
                  <tr key={transaction.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{transaction.customerName || "-"}</td>
                    <td className="px-4 py-3">{transaction.customerPhone || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{transaction.transactionId || "-"}</td>
                    <td className="px-4 py-3">{transaction.reference || "-"}</td>
                    <td className="px-4 py-3">{transaction.transactionDate || "-"}</td>
                    <td className="px-4 py-3 text-red-600">₹ {transaction.debit || 0}</td>
                    <td className="px-4 py-3 text-green-600">₹ {transaction.credit || 0}</td>
                    <td className="px-4 py-3 font-medium">₹ {transaction.balance || 0}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={9}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-500 text-lg">No data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

