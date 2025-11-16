"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getWithdrawRequests, approveWithdrawRequest, denyWithdrawRequest } from "@/utils/reducers/adminReducers";
import { setRequestFilter, setRequestSearchQuery } from "@/utils/slices/withdrawSlice";

export default function WithdrawRequests() {
  const dispatch = useAppDispatch();
  const { requests, isLoading, error, requestFilter, requestSearchQuery } = useAppSelector((s) => s.withdraw);

  useEffect(() => {
    dispatch(getWithdrawRequests()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = requests.filter((r) => {
      if (requestFilter === "pending") return r.status === "PENDING";
      if (requestFilter === "approved") return r.status === "APPROVED";
      if (requestFilter === "settled") return r.status === "SETTLED";
      if (requestFilter === "denied") return r.status === "DENIED";
      return true;
    });
    if (!requestSearchQuery) return base;
    const q = requestSearchQuery.toLowerCase();
    return base.filter((r) =>
      [r.name, r.withdrawMethod, r.amount?.toString()]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [requests, requestFilter, requestSearchQuery]);

  const handleApprove = async (requestId: string | number) => {
    await dispatch(approveWithdrawRequest(String(requestId)));
    dispatch(getWithdrawRequests());
  };

  const handleDeny = async (requestId: string | number) => {
    await dispatch(denyWithdrawRequest(String(requestId)));
    dispatch(getWithdrawRequests());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-700";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "SETTLED":
        return "bg-purple-100 text-purple-700";
      case "DENIED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Withdraw Requests</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(setRequestFilter("all"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            requestFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => dispatch(setRequestFilter("pending"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            requestFilter === "pending" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => dispatch(setRequestFilter("approved"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            requestFilter === "approved" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => dispatch(setRequestFilter("settled"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            requestFilter === "settled" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Settled
        </button>
        <button
          onClick={() => dispatch(setRequestFilter("denied"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            requestFilter === "denied" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Denied
        </button>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={requestSearchQuery}
                onChange={(e) => dispatch(setRequestSearchQuery(e.target.value))}
                placeholder="Search here by custom"
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
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Search
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Total Requests: {requests.length}</div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none">
              <option>All Withdraw Methods</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load withdraw requests from server. Ensure backend endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Withdraw Method</th>
                <th className="px-4 py-3 text-left">Request Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((request, idx) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">₹ {request.amount}</td>
                  <td className="px-4 py-3">{request.name}</td>
                  <td className="px-4 py-3">{request.withdrawMethod}</td>
                  <td className="px-4 py-3">{request.requestTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {}}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {request.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded text-green-700"
                            title="Approve"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeny(request.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-700"
                            title="Deny"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {}}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                    No withdraw requests found.
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

