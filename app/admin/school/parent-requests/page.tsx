"use client";
import React, { useState, useEffect } from "react";
import {
  getAllParentRequests,
  acceptParentRequest,
  rejectParentRequest,
  getParentRequest,
} from "@/utils/schoolAdminApi";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";

interface ParentRequest {
  id: number;
  studentName: string;
  studentClass: string;
  section: string;
  address: string;
  parentPhone: string;
  parentEmail: string;
  status: string;
  branch?: {
    id: number;
    name: string;
    branchId: string;
  };
  assignedBus?: {
    id: number;
    busNumber: string;
  };
  assignedStop?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export default function ParentRequestsPage() {
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ParentRequest | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [busId, setBusId] = useState("");
  const [stopId, setStopId] = useState("");

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await getAllParentRequests(status);
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedRequest) return;
    try {
      await acceptParentRequest(
        selectedRequest.id,
        busId ? parseInt(busId) : undefined,
        stopId ? parseInt(stopId) : undefined
      );
      setShowAcceptModal(false);
      setSelectedRequest(null);
      setBusId("");
      setStopId("");
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to accept request");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await rejectParentRequest(id);
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to reject request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parent Requests</h1>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={loadRequests}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading requests...</div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{request.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{request.studentName}</div>
                        <div className="text-gray-500">{request.studentClass} {request.section}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {request.branch ? (
                        <div>
                          <div>{request.branch.name}</div>
                          <div className="text-gray-500 text-xs">{request.branch.branchId}</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div>{request.parentPhone}</div>
                        <div className="text-gray-500 text-xs">{request.parentEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowAcceptModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">No requests found</div>
            )}
          </div>
        )}

        {/* Accept Modal */}
        {showAcceptModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Accept Request</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Student: {selectedRequest.studentName}</p>
                  <p className="text-sm text-gray-600">Class: {selectedRequest.studentClass} {selectedRequest.section}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bus ID (Optional)</label>
                  <input
                    type="number"
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter bus ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stop ID (Optional)</label>
                  <input
                    type="number"
                    value={stopId}
                    onChange={(e) => setStopId(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter stop ID"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

