"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getDrivers } from "@/utils/reducers/adminReducers";

export default function DriverSetupList() {
  const dispatch = useAppDispatch();
  const { drivers, isLoading, error } = useAppSelector((s: any) => s.adminDashboard || { drivers: [] });
  // If adminDashboard slice is different, we still show clean placeholders

  useEffect(() => {
    try { (dispatch as any)(getDrivers({})); } catch { /* keep UI clean */ }
  }, [dispatch]);

  const total = drivers?.length || 0;
  const active = drivers?.filter((d: any) => d.active)?.length || 0;
  const inactive = total - active;
  const carDriver = 56; // placeholder visual metric
  const motorbikeDriver = 91;

  const filtered = useMemo(() => drivers || [], [drivers]);

  return (
    <div className="space-y-6">
      {/* Analytics header */}
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Driver Analytical Data</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[{
            label: "Total Driver", value: total, icon: "🧑‍🤝‍🧑"
          }, {
            label: "Active Driver", value: active, icon: "🟢"
          }, {
            label: "Inactive Driver", value: inactive, icon: "🔴"
          }, {
            label: "Car Driver", value: carDriver, icon: "🚗"
          }, {
            label: "Motorbike Driver", value: motorbikeDriver, icon: "🏍️"
          }].map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-700 grid place-items-center text-lg">{c.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                <div className="text-sm text-gray-600">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver List */}
      <div>
        <h3 className="text-2xl font-extrabold text-gray-900">Driver List</h3>
        <div className="mt-3 inline-flex bg-teal-600/10 rounded-lg overflow-hidden ring-1 ring-teal-600/20">
          {(["All", "Active", "Inactive"]).map((tab) => (
            <button key={tab} className={`px-4 py-2 text-sm font-semibold transition ${tab === "All" ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-600/20"}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-4">
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
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 9 }).map((__, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>))}
                </tr>
              ))}
              {!isLoading && filtered.map((d: any, idx: number) => (
                <tr key={d.id || idx} className="hover:bg-gray-50 hover:shadow-sm transition rounded">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                    <div>
                      <div className="font-medium text-gray-900">{d.name || d.username || "Driver Name"}</div>
                      <div className="text-xs text-gray-500">{d.email || "user@example.com"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 leading-tight">
                      <div>{d.phone || "+91XXXXXXXXXX"}</div>
                      <div>{d.email || "user@example.com"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">90%</td>
                  <td className="px-4 py-3">Platinum</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">₹ 0</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span></td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">👁</button>
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">✏️</button>
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">🗑️</button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10" colSpan={9}>
                    <div className="mx-auto max-w-md text-center">
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"><span className="text-gray-400 text-2xl">📁</span></div>
                      <p className="mt-3 text-gray-700 font-medium">No data available</p>
                      <p className="mt-1 text-sm text-gray-500">Add a driver to see them here.</p>
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





