"use client";

import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";
import { adminDriverKycSearchUrl, adminDriverKycFileUrl, adminDriverKycDetailsUrl } from "@/utils/apiRoutes";
import { getAuthToken } from "@/utils/config";
import Image from "next/image";

interface Driver {
  id: number;
  name: string;
  email: string;
  mobile: string;
  hasKyc: boolean;
  kycStatus?: string;
}

interface DocumentFile {
  file: File | null;
  preview: string | null;
}

const KYC_DOCUMENTS = [
  { key: "photo", label: "Profile Photo", required: true },
  { key: "aadhaar_front", label: "Aadhaar Front", required: true },
  { key: "aadhaar_back", label: "Aadhaar Back", required: true },
  { key: "license_front", label: "License Front", required: true },
  { key: "license_back", label: "License Back", required: true },
  { key: "rc_front", label: "RC Front", required: true },
  { key: "rc_back", label: "RC Back", required: true },
];

export default function UploadKycPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  const [documents, setDocuments] = useState<Record<string, DocumentFile>>(
    KYC_DOCUMENTS.reduce((acc, doc) => {
      acc[doc.key] = { file: null, preview: null };
      return acc;
    }, {} as Record<string, DocumentFile>)
  );
  
  const [kycDetails, setKycDetails] = useState({
    aadhaarNumber: "",
    licenseNumber: "",
    rcNumber: "",
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

  // Debounce search
  const searchDrivers = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await adminAxios.get(adminDriverKycSearchUrl(query, 0, 10));
        setSearchResults(response.data.drivers || []);
      } catch (error: any) {
        console.error("Search error:", error);
        toast.error(error.response?.data?.error || "Failed to search drivers");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  // Handle search input with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchDrivers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchDrivers]);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleDocumentChange = (docKey: string, file: File | null) => {
    if (!file) {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: { file: null, preview: null },
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(`${KYC_DOCUMENTS.find((d) => d.key === docKey)?.label} must be an image file`);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${KYC_DOCUMENTS.find((d) => d.key === docKey)?.label} must be less than 5MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: { file, preview: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocument = async (docKey: string) => {
    if (!selectedDriver) {
      toast.error("Please select a driver first");
      return;
    }

    const doc = documents[docKey];
    if (!doc.file) {
      toast.error(`Please select ${KYC_DOCUMENTS.find((d) => d.key === docKey)?.label}`);
      return;
    }

    setUploadProgress((prev) => ({ ...prev, [docKey]: true }));

    try {
      const formData = new FormData();
      formData.append("file", doc.file);

      await adminAxios.put(adminDriverKycFileUrl(selectedDriver.id.toString(), docKey), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`${KYC_DOCUMENTS.find((d) => d.key === docKey)?.label} uploaded successfully`);
      
      // Clear the file after successful upload
      setDocuments((prev) => ({
        ...prev,
        [docKey]: { file: null, preview: null },
      }));
    } catch (error: any) {
      console.error(`Upload error for ${docKey}:`, error);
      toast.error(
        error.response?.data?.error || `Failed to upload ${KYC_DOCUMENTS.find((d) => d.key === docKey)?.label}`
      );
    } finally {
      setUploadProgress((prev) => ({ ...prev, [docKey]: false }));
    }
  };

  const handleUploadAll = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver first");
      return;
    }

    // Check if at least one document is selected
    const hasDocuments = Object.values(documents).some((doc) => doc.file !== null);
    if (!hasDocuments) {
      toast.error("Please upload at least one document");
      return;
    }

    setUploading(true);

    try {
      // Upload all documents
      const uploadPromises = Object.entries(documents)
        .filter(([_, doc]) => doc.file !== null)
        .map(([docKey, doc]) => {
          const formData = new FormData();
          formData.append("file", doc.file!);
          return adminAxios.put(adminDriverKycFileUrl(selectedDriver.id.toString(), docKey), formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        });

      await Promise.all(uploadPromises);

      // Update KYC details if provided
      if (kycDetails.aadhaarNumber || kycDetails.licenseNumber || kycDetails.rcNumber) {
        try {
          await adminAxios.put(adminDriverKycDetailsUrl(selectedDriver.id.toString()), kycDetails);
        } catch (error: any) {
          console.error("Error updating KYC details:", error);
          // Don't fail the whole operation if details update fails
        }
      }

      toast.success("All documents uploaded successfully!");
      
      // Clear all documents
      setDocuments(
        KYC_DOCUMENTS.reduce((acc, doc) => {
          acc[doc.key] = { file: null, preview: null };
          return acc;
        }, {} as Record<string, DocumentFile>)
      );
      setKycDetails({ aadhaarNumber: "", licenseNumber: "", rcNumber: "" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Driver KYC Documents</h1>

        {/* Driver Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Driver by Name or Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter driver name or email..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {searchLoading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => handleDriverSelect(driver)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{driver.name}</div>
                  <div className="text-sm text-gray-600">{driver.email}</div>
                  <div className="text-sm text-gray-600">{driver.mobile}</div>
                  {driver.hasKyc && (
                    <div className="text-xs text-blue-600 mt-1">
                      KYC Status: {driver.kycStatus || "UNKNOWN"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Driver Info */}
        {selectedDriver && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Selected Driver:</h3>
            <div className="text-sm text-gray-700">
              <div><strong>Name:</strong> {selectedDriver.name}</div>
              <div><strong>Email:</strong> {selectedDriver.email}</div>
              <div><strong>Mobile:</strong> {selectedDriver.mobile}</div>
              <div><strong>Driver ID:</strong> {selectedDriver.id}</div>
            </div>
            <button
              onClick={() => {
                setSelectedDriver(null);
                setDocuments(
                  KYC_DOCUMENTS.reduce((acc, doc) => {
                    acc[doc.key] = { file: null, preview: null };
                    return acc;
                  }, {} as Record<string, DocumentFile>)
                );
                setKycDetails({ aadhaarNumber: "", licenseNumber: "", rcNumber: "" });
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Change Driver
            </button>
          </div>
        )}

        {/* Document Upload Section */}
        {selectedDriver && (
          <>
            {/* KYC Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">KYC Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={kycDetails.aadhaarNumber}
                    onChange={(e) => setKycDetails({ ...kycDetails, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={kycDetails.licenseNumber}
                    onChange={(e) => setKycDetails({ ...kycDetails, licenseNumber: e.target.value.toUpperCase() })}
                    placeholder="License number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RC Number
                  </label>
                  <input
                    type="text"
                    value={kycDetails.rcNumber}
                    onChange={(e) => setKycDetails({ ...kycDetails, rcNumber: e.target.value.toUpperCase() })}
                    placeholder="RC number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Grid */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {KYC_DOCUMENTS.map((doc) => {
                  const docFile = documents[doc.key];
                  return (
                    <div key={doc.key} className="border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </label>

                      {/* Preview or Upload Area */}
                      {docFile.preview ? (
                        <div className="relative mb-2">
                          <Image
                            src={docFile.preview}
                            alt={doc.label}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            onClick={() => handleDocumentChange(doc.key, null)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDocumentChange(doc.key, e.target.files?.[0] || null)}
                            className="hidden"
                            id={`file-${doc.key}`}
                          />
                          <label htmlFor={`file-${doc.key}`} className="cursor-pointer">
                            <svg
                              className="w-8 h-8 mx-auto text-gray-400 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-sm text-gray-600">Click to upload</p>
                          </label>
                        </div>
                      )}

                      {/* Upload Button */}
                      {docFile.file && (
                        <button
                          onClick={() => handleUploadDocument(doc.key)}
                          disabled={uploadProgress[doc.key]}
                          className="w-full mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {uploadProgress[doc.key] ? "Uploading..." : "Upload"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleUploadAll}
                disabled={uploading || Object.values(documents).every((doc) => !doc.file)}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading All Documents..." : "Upload All Documents"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
