"use client";
import React from "react";
import Link from "next/link";

type Status = "all" | "active" | "inactive";

export default function DriverIdentityRequests({ defaultStatus = "all" as Status }: { defaultStatus?: Status }) {
  const items = [] as any[]; // clean UI; backend integration can be added later
  const tabs: { label: string; status: Status; href: string }[] = [
    { label: "All", status: "all", href: "/admin/driver-setup/identity-requests" },
    { label: "Active", status: "active", href: "/admin/driver-setup/identity-requests/active" },
    { label: "Inactive", status: "inactive", href: "/admin/driver-setup/identity-requests/inactive" },
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Driver Identity Update Request List</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((t) => (
            <Link key={t.status} href={t.href} className={`px-4 py-2 text-sm font-semibold rounded ${defaultStatus === t.status ? "bg-teal-600 text-white" : "bg-white text-teal-700 hover:bg-teal-50"}`}>{t.label}</Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-lg">
              <input placeholder="Search here by name" className="w-full border border-gray-200 rounded-lg pl-11 pr-3 py-2 focus:ring-2 focus:ring-teal-500 shadow-sm hover:shadow-md transition" />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Refresh">⟳</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Settings">⚙</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Download">⬇</button>
            <a href="/admin/driver-setup/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">+ Add Driver</a>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Contact Info</th>
                <th className="px-4 py-2 text-left">Profile Status</th>
                <th className="px-4 py-2 text-left">Level</th>
                <th className="px-4 py-2 text-left">Total Trip</th>
                <th className="px-4 py-2 text-left">Earning</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10" colSpan={9}>
                    <div className="mx-auto max-w-md text-center">
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"><span className="text-gray-400 text-2xl">📁</span></div>
                      <p className="mt-3 text-gray-700 font-medium">No data available</p>
                    </div>
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
