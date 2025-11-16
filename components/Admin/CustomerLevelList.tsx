"use client";
import React from "react";

export default function CustomerLevelList() {
  const levels: any[] = [
    {
      id: 1,
      name: "Level 1",
      stats: {
        rideComplete: "1 (10 Points)",
        spendAmount: "₹ 100 (500 Points)",
        cancellationRate: "0% (0 Points)",
        givenReview: "0 (0 Points)",
      },
      totalTrip: 160,
      maxCancellationRate: "75.44 %",
      totalCustomer: 4689,
      active: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Levels</h2>
            <div className="mt-4 bg-white rounded-xl shadow p-4 inline-flex items-center gap-6">
              <div>
                <div className="text-gray-800 font-semibold">Level 1</div>
                <div className="text-xs text-gray-500 mt-1">Customers</div>
                <div className="text-2xl font-bold text-gray-900">4689</div>
              </div>
              <div className="h-14 w-14 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">👮</div>
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

      <div>
        <h3 className="text-2xl font-extrabold text-gray-900">Level List</h3>
        <div className="mt-3 inline-flex bg-teal-600/10 rounded-lg overflow-hidden ring-1 ring-teal-600/20">
          {["All", "Active", "Inactive"].map((t) => (
            <button key={t} className={`px-4 py-2 text-sm font-semibold transition ${t === "All" ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-600/20"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-lg">
              <input placeholder="Search here by Level Name" className="w-full border border-gray-200 rounded-lg pl-11 pr-3 py-2 focus:ring-2 focus:ring-teal-500 shadow-sm hover:shadow-md transition" />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition">⟳</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition">⚙</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition">⬇</button>
            <a href="/admin/customer-levels/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">+ Add Level</a>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Level Name</th>
                <th className="px-4 py-2 text-left">Target To Proceed Level <div className="text-xs text-gray-400">(For Next Level)</div></th>
                <th className="px-4 py-2 text-left">Total Trip</th>
                <th className="px-4 py-2 text-left">Maximum Cancellation Rate</th>
                <th className="px-4 py-2 text-left">Total Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {levels.map((l, idx) => (
                <tr key={l.id} className="hover:bg-gray-50 hover:shadow-sm transition rounded">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-700 grid place-items-center text-xl">👮</div>
                    <span className="font-medium text-gray-900">{l.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 leading-tight space-y-1">
                      <div>Ride Complete : {l.stats.rideComplete}</div>
                      <div>Spend Amount : {l.stats.spendAmount}</div>
                      <div>Cancellation Rate : {l.stats.cancellationRate}</div>
                      <div>Given Review : {l.stats.givenReview}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.totalTrip}</td>
                  <td className="px-4 py-3">{l.maxCancellationRate}</td>
                  <td className="px-4 py-3">{l.totalCustomer}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{l.active ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">👁</button>
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





