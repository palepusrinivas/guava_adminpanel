"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getDriverLevels, updateDriverLevel, deleteDriverLevel } from "@/utils/reducers/adminReducers";
import { setDriverLevelFilter, setDriverLevelSearchQuery } from "@/utils/slices/driverLevelSlice";

export default function DriverLevelList() {
  const dispatch = useAppDispatch();
  const { levels, isLoading, error, filter, searchQuery } = useAppSelector((s) => s.driverLevel);

  useEffect(() => { dispatch(getDriverLevels()).catch(() => {}); }, [dispatch]);

  const filtered = useMemo(() => {
    const base = levels.filter((l) => (filter === "active" ? l.active : filter === "inactive" ? !l.active : true));
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((l) => l.name.toLowerCase().includes(q));
  }, [levels, filter, searchQuery]);

  const topCard = levels[0];
  const totalLevels = levels.length;

  return (
    <div className="space-y-6">
      {/* Header with stat card */}
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Driver Levels</h2>
            <div className="mt-4 bg-white rounded-xl shadow p-4 inline-flex items-center gap-6">
              <div>
                <div className="text-gray-800 font-semibold">{topCard?.name || "Platinum"}</div>
                <div className="text-xs text-gray-500 mt-1">Drivers</div>
                <div className="text-2xl font-bold text-gray-900">{topCard?.totalDriver ?? 180}</div>
              </div>
              <div className="h-14 w-14 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">100</div>
            </div>
          </div>
          <select className="bg-white rounded-lg px-3 py-2 text-sm shadow min-w-[140px]">
            <option>All time</option>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
          </select>
        </div>
        <div className="mt-6 text-white/80 text-sm">Total Levels</div>
      </div>

      {/* List header with tabs */}
      <div>
        <h3 className="text-2xl font-extrabold text-gray-900">Level List</h3>
        <div className="mt-3 inline-flex bg-teal-600/10 rounded-lg overflow-hidden ring-1 ring-teal-600/20">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button key={tab} onClick={() => dispatch(setDriverLevelFilter(tab))} className={`px-4 py-2 text-sm font-semibold transition ${filter === tab ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-600/20"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-lg">
              <input value={searchQuery} onChange={(e) => dispatch(setDriverLevelSearchQuery(e.target.value))} placeholder="Search here by Level name" className="w-full border border-gray-200 rounded-lg pl-11 pr-3 py-2 focus:ring-2 focus:ring-teal-500 shadow-sm hover:shadow-md transition" />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Refresh">⟳</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Settings">⚙</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Download">⬇</button>
            <a href="/admin/driver-levels/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">+ Add Level</a>
            {/* Extra quick-actions placed next to the Add Level button as requested */}
            <div className="hidden md:flex items-center gap-2 pl-2 ml-2 border-l">
              <button className="h-9 w-9 grid place-items-center border rounded-lg hover:bg-gray-50 transition" title="Duplicate Level">⧉</button>
              <button className="h-9 w-9 grid place-items-center border rounded-lg hover:bg-gray-50 transition" title="Archive">🗄️</button>
              <button className="h-9 w-9 grid place-items-center border rounded-lg hover:bg-gray-50 transition" title="Help">❔</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Level Name</th>
                <th className="px-4 py-2 text-left">Target To Proceed Level <div className="text-xs text-gray-400">(For Next Level)</div></th>
                <th className="px-4 py-2 text-left">Total Trip</th>
                <th className="px-4 py-2 text-left">Maximum Cancellation Rate</th>
                <th className="px-4 py-2 text-left">Total Driver</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && filtered.map((l, idx) => (
                <tr key={l.id} className="hover:bg-gray-50 hover:shadow-sm transition rounded">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">100</div>
                    <span className="font-medium text-gray-900">{l.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 leading-tight space-y-1">
                      <div>Ride Complete : {l.targets?.rideComplete ?? 20} (50 Points)</div>
                      <div>Earning Amount : ₹ {l.targets?.earningAmount ?? 1500} (50 Points)</div>
                      <div>Cancellation Rate : {l.targets?.cancellationRate ?? 0}% (0 Points)</div>
                      <div>Given Review : {l.targets?.givenReview ?? 0} (0 Points)</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.totalTrip ?? 161}</td>
                  <td className="px-4 py-3">{l.maxCancellationRate ?? 56.08}%</td>
                  <td className="px-4 py-3">{l.totalDriver ?? 180}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${l.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{l.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => dispatch(updateDriverLevel({ levelId: String(l.id), levelData: { active: !l.active } }))} className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700 shadow-sm active:scale-[.98]">{l.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => dispatch(deleteDriverLevel(String(l.id)))} className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[.98]">Delete</button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10" colSpan={8}>
                    <div className="mx-auto max-w-md text-center">
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"><span className="text-gray-400 text-2xl">📁</span></div>
                      <p className="mt-3 text-gray-700 font-medium">No data available</p>
                      <p className="mt-1 text-sm text-gray-500">Create your first level to get started.</p>
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
