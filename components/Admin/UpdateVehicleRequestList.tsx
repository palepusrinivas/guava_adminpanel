"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getVehicleUpdateRequests,
  approveVehicleUpdateRequest,
  rejectVehicleUpdateRequest,
} from "@/utils/reducers/adminReducers";
import { setRequestSearchQuery } from "@/utils/slices/vehicleSlice";

export default function UpdateVehicleRequestList() {
  const dispatch = useAppDispatch();
  const { updateRequests, isLoading, error, requestSearchQuery } = useAppSelector((s) => s.vehicle);

  useEffect(() => {
    dispatch(getVehicleUpdateRequests()).catch(() => {});
  }, [dispatch]);

  const filteredRequests = useMemo(() => {
    const base = updateRequests.filter((r) => r.status === "PENDING");
    if (!requestSearchQuery) return base;
    const q = requestSearchQuery.toLowerCase();
    return base.filter((r) => r.vehicleId.toLowerCase().includes(q));
  }, [updateRequests, requestSearchQuery]);

  const pendingCount = updateRequests.filter((r) => r.status === "PENDING").length;

  const handleApprove = async (requestId: string | number) => {
    await dispatch(approveVehicleUpdateRequest(String(requestId)));
    dispatch(getVehicleUpdateRequests());
  };

  const handleReject = async (requestId: string | number) => {
    await dispatch(rejectVehicleUpdateRequest(String(requestId)));
    dispatch(getVehicleUpdateRequests());
  };

  const parseEditData = (dataString: string) => {
    const lines = dataString.split(/\r?\n/).filter((l) => l.trim());
    return lines.map((line) => {
      const [key, ...valueParts] = line.split(" : ");
      return { key: key.trim(), value: valueParts.join(" : ").trim() };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Update Vehicle Request List</h2>
        <div className="text-white font-medium">Total Pending Request : {pendingCount}</div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative w-full">
                <input
                  value={requestSearchQuery}
                  onChange={(e) => dispatch(setRequestSearchQuery(e.target.value))}
                  placeholder="Search"
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
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
              Unable to load vehicle update requests from server. Ensure backend endpoints are implemented. Error:{" "}
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">SL</th>
                  <th className="px-4 py-3 text-left">Vehicle ID</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Before Edit</th>
                  <th className="px-4 py-3 text-left">After Edit</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(isLoading ? [] : filteredRequests).map((request, idx) => {
                  const beforeData = parseEditData(request.beforeEdit);
                  const afterData = parseEditData(request.afterEdit);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">#{request.vehicleId}</td>
                      <td className="px-4 py-3">{request.dateTime || request.createdAt || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          {beforeData.map((item, i) => (
                            <div key={i}>
                              <span className="font-medium">{item.key}</span> : {item.value}
                            </div>
                          ))}
                          {beforeData.length === 0 && <div className="text-gray-400">-</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          {afterData.map((item, i) => (
                            <div key={i}>
                              <span className="font-medium">{item.key}</span> : {item.value}
                            </div>
                          ))}
                          {afterData.length === 0 && <div className="text-gray-400">-</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
                            title="View"
                            onClick={() => {
                              // View details - implement as needed
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isLoading}
                            className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700 disabled:opacity-50"
                            title="Approve"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isLoading}
                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700 disabled:opacity-50"
                            title="Reject"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredRequests.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                      No pending update requests found.
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

