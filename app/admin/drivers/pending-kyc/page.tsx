"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getApiUrl, getAuthToken } from "@/utils/config";

interface PendingKycDriver {
  id: number;
  driver: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    shortCode: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  aadhaarNumber?: string;
  licenseNumber?: string;
  rcNumber?: string;
  submittedAt?: string;
  documents: {
    profilePhoto?: string;
    licenseFront?: string;
    licenseBack?: string;
    rcFront?: string;
    rcBack?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
  };
}

export default function PendingKycPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<PendingKycDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPendingKyc = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`/api/admin/drivers/pending-kyc?page=${page}&size=20`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pending KYC");
      const data = await response.json();
      const kycList = data.content || [];
      
      // Fetch document URLs for each driver
      const driversWithDocs = await Promise.all(
        kycList.map(async (kyc: any) => {
          try {
            const detailsResponse = await fetch(
              getApiUrl(`/api/admin/drivers/${kyc.driver.id}/details`),
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (detailsResponse.ok) {
              const details = await detailsResponse.json();
              return {
                ...kyc,
                documents: details.kyc?.documents || {},
              };
            }
          } catch (err) {
            console.error("Failed to fetch driver details:", err);
          }
          return { ...kyc, documents: {} };
        })
      );
      
      setDrivers(driversWithDocs);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, [page]);

  const handleApprove = async (driverId: number) => {
    setActionLoading(driverId);
    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`/api/admin/drivers/${driverId}/kyc/approve`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to approve KYC");
      toast.success("KYC approved successfully!");
      fetchPendingKyc();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (driverId: number, reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(driverId);
    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`/api/admin/drivers/${driverId}/kyc/reject`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) throw new Error("Failed to reject KYC");
      toast.success("KYC rejected");
      fetchPendingKyc();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (driverId: number) => {
    router.push(`/admin/drivers/${driverId}`);
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Driver KYC</h1>
          <p className="text-gray-600">Review and approve driver registration requests</p>
        </div>
        <button
          onClick={fetchPendingKyc}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 text-sm font-medium">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-800">{drivers.length}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Total Pages</div>
          <div className="text-2xl font-bold text-blue-800">{totalPages}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">Page {page + 1}</div>
          <div className="text-2xl font-bold text-green-800">of {totalPages || 1}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No pending KYC requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {drivers.map((kyc) => (
            <div
              key={kyc.id}
              className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    {kyc.documents?.profilePhoto && (
                      <img
                        src={kyc.documents.profilePhoto}
                        alt={kyc.driver.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
                        }}
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {kyc.driver.name}
                      </h3>
                      <p className="text-sm text-gray-600">{kyc.driver.email}</p>
                      <p className="text-sm text-gray-600">{kyc.driver.mobile}</p>
                      <p className="text-xs text-gray-500">Code: {kyc.driver.shortCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-gray-500 text-xs">Aadhaar</label>
                      <p className="font-medium text-sm">
                        {kyc.aadhaarNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">License</label>
                      <p className="font-medium text-sm">
                        {kyc.licenseNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">RC Number</label>
                      <p className="font-medium text-sm">
                        {kyc.rcNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Submitted</label>
                      <p className="font-medium text-sm">
                        {kyc.submittedAt
                          ? new Date(kyc.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="flex gap-2 flex-wrap">
                    {kyc.documents?.licenseFront && (
                      <DocumentBadge label="License Front" />
                    )}
                    {kyc.documents?.licenseBack && (
                      <DocumentBadge label="License Back" />
                    )}
                    {kyc.documents?.rcFront && (
                      <DocumentBadge label="RC Front" />
                    )}
                    {kyc.documents?.rcBack && (
                      <DocumentBadge label="RC Back" />
                    )}
                    {kyc.documents?.aadhaarFront && (
                      <DocumentBadge label="Aadhaar Front" />
                    )}
                    {kyc.documents?.aadhaarBack && (
                      <DocumentBadge label="Aadhaar Back" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(kyc.driver.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => handleApprove(kyc.driver.id)}
                    disabled={actionLoading === kyc.driver.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {actionLoading === kyc.driver.id ? "Processing..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) handleReject(kyc.driver.id, reason);
                    }}
                    disabled={actionLoading === kyc.driver.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function DocumentBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
      📄 {label}
    </span>
  );
}

