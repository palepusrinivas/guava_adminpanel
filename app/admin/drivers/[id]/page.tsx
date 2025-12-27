"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getApiUrl, getAuthToken } from "@/utils/config";

interface DriverDetails {
  driver: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    rating: number;
    latitude: number;
    longitude: number;
    shortCode: string;
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    vehicle?: {
      id: number;
      model: string;
      licensePlate: string;
      color: string;
      serviceType?: string; // BIKE, MEGA, CAR, etc.
      vehicleType?: string; // two_wheeler, three_wheeler, four_wheeler
    };
    license?: {
      id: number;
      licenseNumber: string;
    };
  };
  kyc?: {
    id: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    aadhaarNumber?: string;
    licenseNumber?: string;
    rcNumber?: string;
    rejectionReason?: string;
    submittedAt?: string;
    reviewedAt?: string;
    documents: {
      profilePhoto?: string;
      licenseFront?: string;
      licenseBack?: string;
      rcFront?: string;
      rcBack?: string;
      aadhaarFront?: string;
      aadhaarBack?: string;
    };
  };
}

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;
  
  const [data, setData] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDriverDetails = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`/api/admin/drivers/${driverId}/details`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch driver details");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driverId) {
      fetchDriverDetails();
    }
  }, [driverId]);

  const handleApproveKyc = async () => {
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`/api/admin/drivers/${driverId}/kyc/approve`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to approve KYC");
      toast.success("KYC approved successfully!");
      fetchDriverDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
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
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );
      if (!response.ok) throw new Error("Failed to reject KYC");
      toast.success("KYC rejected");
      setShowRejectModal(false);
      setRejectionReason("");
      fetchDriverDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>Driver not found</div>;
  }

  const { driver, kyc } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-2"
          >
            ← Back to Drivers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Driver Details</h1>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-500 text-sm">Name</label>
            <p className="font-medium">{driver.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <p className="font-medium">{driver.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Mobile</label>
            <p className="font-medium">{driver.mobile || "N/A"}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Short Code</label>
            <p className="font-medium">{driver.shortCode || "N/A"}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Rating</label>
            <p className="font-medium">⭐ {driver.rating || 0}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Location</label>
            <p className="font-medium">
              {driver.latitude && driver.longitude
                ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Vehicle Info */}
        {driver.vehicle && (
          <>
            <h3 className="text-lg font-semibold mt-6 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-gray-500 text-sm">Vehicle Type</label>
                <p className="font-medium">
                  {driver.vehicle.serviceType 
                    ? driver.vehicle.serviceType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                    : driver.vehicle.vehicleType 
                      ? driver.vehicle.vehicleType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                      : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Model</label>
                <p className="font-medium">{driver.vehicle.model || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">License Plate</label>
                <p className="font-medium">{driver.vehicle.licensePlate || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Color</label>
                <p className="font-medium">{driver.vehicle.color || "N/A"}</p>
              </div>
            </div>
          </>
        )}

        {/* Bank Details */}
        {(driver.bankName || driver.upiId) && (
          <>
            <h3 className="text-lg font-semibold mt-6 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-500 text-sm">Account Holder</label>
                <p className="font-medium">{driver.accountHolderName || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Bank Name</label>
                <p className="font-medium">{driver.bankName || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Account Number</label>
                <p className="font-medium">{driver.accountNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">IFSC Code</label>
                <p className="font-medium">{driver.ifscCode || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">UPI ID</label>
                <p className="font-medium">{driver.upiId || "N/A"}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* KYC Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">KYC Verification</h2>
          {kyc && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kyc.status)}`}>
              {kyc.status}
            </span>
          )}
        </div>

        {!kyc ? (
          <p className="text-gray-500">KYC documents not submitted yet.</p>
        ) : (
          <>
            {/* KYC Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-gray-500 text-sm">Aadhaar Number</label>
                <p className="font-medium">{kyc.aadhaarNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">License Number</label>
                <p className="font-medium">{kyc.licenseNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">RC Number</label>
                <p className="font-medium">{kyc.rcNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Submitted At</label>
                <p className="font-medium">
                  {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : "N/A"}
                </p>
              </div>
              {kyc.reviewedAt && (
                <div>
                  <label className="text-gray-500 text-sm">Reviewed At</label>
                  <p className="font-medium">{new Date(kyc.reviewedAt).toLocaleString()}</p>
                </div>
              )}
              {kyc.rejectionReason && (
                <div className="col-span-full">
                  <label className="text-gray-500 text-sm">Rejection Reason</label>
                  <p className="font-medium text-red-600">{kyc.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            <h3 className="text-md font-semibold mb-4">Uploaded Documents</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kyc.documents?.profilePhoto && (
                <DocumentCard label="Profile Photo" url={kyc.documents.profilePhoto} />
              )}
              {kyc.documents?.licenseFront && (
                <DocumentCard label="License Front" url={kyc.documents.licenseFront} />
              )}
              {kyc.documents?.licenseBack && (
                <DocumentCard label="License Back" url={kyc.documents.licenseBack} />
              )}
              {kyc.documents?.rcFront && (
                <DocumentCard label="RC Front" url={kyc.documents.rcFront} />
              )}
              {kyc.documents?.rcBack && (
                <DocumentCard label="RC Back" url={kyc.documents.rcBack} />
              )}
              {kyc.documents?.aadhaarFront && (
                <DocumentCard label="Aadhaar Front" url={kyc.documents.aadhaarFront} />
              )}
              {kyc.documents?.aadhaarBack && (
                <DocumentCard label="Aadhaar Back" url={kyc.documents.aadhaarBack} />
              )}
            </div>

            {/* Action Buttons */}
            {kyc.status === "PENDING" && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleApproveKyc}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "✓ Approve KYC"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  ✗ Reject KYC
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject KYC</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-md p-3 h-32"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKyc}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({ label, url }: { label: string; url: string }) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Backend returns signed URLs directly, so use them as-is
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));

  return (
    <>
      <div
        className="border rounded-lg p-2 cursor-pointer hover:shadow-md transition"
        onClick={() => isValidUrl && !imageError && setShowModal(true)}
      >
        <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
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
              <span className="text-gray-400 text-xs text-center px-2">Image unavailable</span>
            </div>
          )}
        </div>
        <p className="text-sm text-center mt-2 font-medium">{label}</p>
      </div>

      {showModal && isValidUrl && !imageError && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={url}
              alt={label}
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded"
              onError={() => setImageError(true)}
            />
            <p className="text-white text-center mt-4">{label}</p>
          </div>
        </div>
      )}
    </>
  );
}

