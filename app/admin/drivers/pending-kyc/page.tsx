"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getApiUrl, getAuthToken } from "@/utils/config";
import { formatDateIST } from "@/utils/dateUtils";

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
        getApiUrl(`/api/admin/kyc/pending?page=${page}&size=20`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pending KYC");
      const data = await response.json();
      const kycList = data.content || [];
      
      // Map the enriched data from the new endpoint
      const driversWithDocs = kycList.map((item: any) => ({
        id: item.kyc?.id || 0,
        driver: item.driver || {},
        status: item.kyc?.status || "PENDING",
        aadhaarNumber: item.kyc?.aadhaarNumber,
        licenseNumber: item.kyc?.licenseNumber,
        rcNumber: item.kyc?.rcNumber,
        submittedAt: item.kyc?.submittedAt,
        documents: item.documentUrls || {},
      }));
      
      setDrivers(driversWithDocs);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch pending KYC requests");
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
        getApiUrl(`/api/admin/kyc/drivers/${driverId}/approve`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve KYC");
      }
      toast.success("KYC approved successfully!");
      fetchPendingKyc();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve KYC");
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
        getApiUrl(`/api/admin/kyc/drivers/${driverId}/reject`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reject KYC");
      }
      toast.success("KYC rejected");
      fetchPendingKyc();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject KYC");
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
                    {kyc.documents?.profilePhoto ? (
                      <img
                        src={kyc.documents.profilePhoto}
                        alt={kyc.driver.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          // Show placeholder on error
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const placeholder = img.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-xs"
                      style={{ display: kyc.documents?.profilePhoto ? 'none' : 'flex' }}
                    >
                      No Photo
                    </div>
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
                        {formatDateIST(kyc.submittedAt)}
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {kyc.documents?.profilePhoto && (
                      <DocumentViewer label="Profile Photo" url={kyc.documents.profilePhoto} />
                    )}
                    {kyc.documents?.licenseFront && (
                      <DocumentViewer label="License Front" url={kyc.documents.licenseFront} />
                    )}
                    {kyc.documents?.licenseBack && (
                      <DocumentViewer label="License Back" url={kyc.documents.licenseBack} />
                    )}
                    {kyc.documents?.rcFront && (
                      <DocumentViewer label="RC Front" url={kyc.documents.rcFront} />
                    )}
                    {kyc.documents?.rcBack && (
                      <DocumentViewer label="RC Back" url={kyc.documents.rcBack} />
                    )}
                    {kyc.documents?.aadhaarFront && (
                      <DocumentViewer label="Aadhaar Front" url={kyc.documents.aadhaarFront} />
                    )}
                    {kyc.documents?.aadhaarBack && (
                      <DocumentViewer label="Aadhaar Back" url={kyc.documents.aadhaarBack} />
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

function DocumentViewer({ label, url }: { label: string; url: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Backend returns signed URLs directly, so validate they're proper URLs
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));
  
  return (
    <>
      <div
        onClick={() => isValidUrl && !imageError && setIsOpen(true)}
        className={`relative group border rounded-lg p-2 cursor-pointer hover:shadow-md transition ${
          isValidUrl && !imageError ? 'border-gray-300 hover:border-blue-500' : 'border-gray-200'
        }`}
      >
        <div className="relative h-24 bg-gray-100 rounded overflow-hidden">
          {isValidUrl && !imageError ? (
            <img
              src={url}
              alt={label}
              className="w-full h-full object-cover rounded"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xs text-center px-1">Unavailable</span>
            </div>
          )}
        </div>
        <p className="text-xs text-center mt-1 font-medium text-gray-700">{label}</p>
      </div>
      
      {isOpen && isValidUrl && !imageError && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 z-10 shadow-lg"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={url}
              alt={label}
              className="max-w-full max-h-[90vh] object-contain rounded-lg bg-white"
              onError={() => {
                setImageError(true);
                setIsOpen(false);
              }}
            />
            <p className="text-white text-center mt-4">{label}</p>
          </div>
        </div>
      )}
    </>
  );
}

