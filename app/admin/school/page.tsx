"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SchoolOverviewPage() {
  const [institutionId, setInstitutionId] = useState("");
  const [branchId, setBranchId] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">School Transport Overview</h1>
        <Link href="/admin/school/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          View Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Institutions</h2>
          <p className="text-sm text-gray-600">Create and manage institutions.</p>
          <Link href="/admin/school/institutions" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Open Institutions</Link>
          <div className="pt-3 border-t mt-3 space-y-2">
            <label className="text-sm block">Open Branches for Institution ID</label>
            <div className="flex gap-2">
              <input className="border p-2 rounded flex-1" placeholder="Institution ID" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} />
              <Link className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50" href={institutionId ? `/admin/school/branches/${institutionId}` : "#"} aria-disabled={!institutionId}>Open</Link>
            </div>
          </div>
        </div>
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Buses, Routes & Stops</h2>
          <p className="text-sm text-gray-600">Manage buses and route stops for a branch.</p>
          <div className="space-y-2">
            <label className="text-sm block">Open with Branch ID</label>
            <div className="flex gap-2">
              <input className="border p-2 rounded flex-1" placeholder="Branch ID" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Link className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" href={branchId ? `/admin/school/buses/${branchId}` : "#"} aria-disabled={!branchId}>Buses</Link>
              <Link className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" href={branchId ? `/admin/school/routes/${branchId}` : "#"} aria-disabled={!branchId}>Routes & Stops</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Students</h2>
        <p className="text-sm text-gray-600">Bulk upload students via CSV.</p>
        <Link href="/admin/school/students/upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Upload Students CSV</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/school/parent-requests" className="border rounded p-4 hover:shadow-md transition">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-medium">Parent Requests</h3>
          <p className="text-sm text-gray-600">Manage parent registration requests</p>
        </Link>
        <Link href="/admin/school/tracking" className="border rounded p-4 hover:shadow-md transition">
          <div className="text-2xl mb-2">📍</div>
          <h3 className="font-medium">Live Tracking</h3>
          <p className="text-sm text-gray-600">Monitor bus locations in real-time</p>
        </Link>
        <Link href="/admin/school/alerts" className="border rounded p-4 hover:shadow-md transition">
          <div className="text-2xl mb-2">🔔</div>
          <h3 className="font-medium">Alerts</h3>
          <p className="text-sm text-gray-600">View alert logs and notifications</p>
        </Link>
      </div>
    </div>
  );
}


