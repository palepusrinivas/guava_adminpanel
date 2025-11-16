"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getCustomers, updateCustomer } from "@/utils/reducers/adminReducers";
import { setCustomerFilter, setCustomerSearchQuery } from "@/utils/slices/customerSlice";
import { useRouter } from "next/navigation";

export default function CustomerList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { customers, isLoading, error, filter, searchQuery } = useAppSelector((s) => s.customer);

  useEffect(() => {
    dispatch(getCustomers()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = customers.filter((c) => {
      if (filter === "all") return true;
      return c.level === filter;
    });
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, filter, searchQuery]);

  const analytics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "ACTIVE").length;
    const inactive = customers.filter((c) => c.status === "INACTIVE").length;
    // New customers could be based on recent signups - for now, same as total
    const newCustomers = total;
    return { total, active, inactive, newCustomers };
  }, [customers]);

  const handleToggleStatus = async (customer: any) => {
    await dispatch(
      updateCustomer({
        customerId: String(customer.id),
        customerData: { status: customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
      })
    );
    dispatch(getCustomers());
  };

  // Get unique levels for filter buttons
  const levels = useMemo(() => {
    const uniqueLevels = Array.from(new Set(customers.map((c) => c.level).filter((level): level is string => !!level)));
    return uniqueLevels;
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Customer Analytics Section */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Customer Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Customer Card */}
          <div className="bg-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Customer</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.total}</div>
            </div>
            <div className="text-4xl">🟣</div>
          </div>

          {/* In-Active Customer Card */}
          <div className="bg-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">In-Active Customer</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.inactive}</div>
            </div>
            <div className="text-4xl">🔴</div>
          </div>

          {/* New Customer Card */}
          <div className="bg-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">New Customer</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.newCustomers}</div>
            </div>
            <div className="text-4xl">🔵</div>
          </div>

          {/* Active Customer Card */}
          <div className="bg-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Active Customer</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.active}</div>
            </div>
            <div className="text-4xl">🟢</div>
          </div>
        </div>
      </div>

      {/* Customer List Section */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Customer List</h3>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Total Customer: {customers.length}</div>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => dispatch(setCustomerFilter("all"))}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            All
          </button>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => dispatch(setCustomerFilter(level))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === level ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 mb-4">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setCustomerSearchQuery(e.target.value))}
                placeholder="Search Here by Custom"
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
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
            <button
              onClick={() => router.push("/admin/customer/create")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              + Add Customer
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load customers from server. Ensure backend endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Customer Name</th>
                <th className="px-4 py-3 text-left">Profile Status</th>
                <th className="px-4 py-3 text-left">Contact Info</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Total Trip</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((customer, idx) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">
                          {customer.firstName?.[0] || "?"}
                        </span>
                      </div>
                      <span className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-orange-600 font-medium">{customer.profileStatus || 30}%</span>
                  </td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.level || "Level 1"}</td>
                  <td className="px-4 py-3">{customer.totalTrip || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        customer.status === "ACTIVE" ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          customer.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700" title="Clock">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                    No customers found.
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

