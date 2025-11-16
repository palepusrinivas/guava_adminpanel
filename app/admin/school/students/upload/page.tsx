"use client";
import React, { useState } from "react";
import adminAxios from "@/utils/axiosConfig";
import { toast } from "react-hot-toast";

export default function StudentsUploadPage() {
  const [branchId, setBranchId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !file) {
      toast.error("Branch ID and CSV file are required");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await adminAxios.post(`/api/v1/branches/${branchId}/students/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Uploaded: ${data.created}, Skipped: ${data.skipped}`);
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const csvHeader = "student_name,class,section,parent_phone,parent_email,address,assigned_branch,assigned_stop_id";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upload Students CSV</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <input className="border p-2 rounded w-full" placeholder="Branch ID *" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
        <input className="border p-2 rounded w-full" type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {isSubmitting ? "Uploading..." : "Upload"}
        </button>
      </form>
      <div className="text-sm text-gray-700">
        <p className="font-medium mb-1">CSV header (required):</p>
        <pre className="p-3 bg-gray-50 border rounded overflow-x-auto">{csvHeader}</pre>
      </div>
    </div>
  );
}


