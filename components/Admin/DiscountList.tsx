"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getDiscounts, deleteDiscount, updateDiscount } from "@/utils/reducers/adminReducers";
import { setDiscountFilter, setDiscountSearchQuery } from "@/utils/slices/discountSlice";

export default function DiscountList() {
  const dispatch = useAppDispatch();
  const { discounts, isLoading, error, filter, searchQuery } = useAppSelector((s) => s.discount);

  useEffect(() => { dispatch(getDiscounts()).catch(() => {}); }, [dispatch]);

  const filtered = useMemo(() => {
    const base = discounts.filter((d) => (filter === "active" ? d.active : filter === "inactive" ? !d.active : true));
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((d) => [d.title, d.zone, d.customer, d.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [discounts, filter, searchQuery]);

  const totalAmount = discounts.reduce((s, d) => s + (d.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Teal header */}
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">All Discount</h2>
          <div className="text-white/90 text-sm">Total Discounts : {discounts.length}</div>
        </div>
        <div className="mt-4 inline-flex bg-white/10 rounded-lg overflow-hidden">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setDiscountFilter(tab))}
              className={`px-4 py-2 text-sm font-semibold transition ${filter === tab ? "bg-white text-teal-700" : "text-white hover:bg-white/20"}`}
            >
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
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setDiscountSearchQuery(e.target.value))}
                placeholder="Search here by title"
                className="w-full border border-gray-200 rounded-lg pl-11 pr-3 py-2 focus:ring-2 focus:ring-teal-500 shadow-sm hover:shadow-md transition"
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition active:scale-[.98]" title="Refresh">⟳</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition active:scale-[.98]" title="Settings">⚙</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition active:scale-[.98]" title="Download">⬇</button>
            <a href="/admin/discounts/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 active:scale-[.98]">+ Add Discount</a>
          </div>
        </div>

        {/* Clean UI: suppress server error banners for a pristine look */}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Discount Title</th>
                <th className="px-4 py-2 text-left">Zone</th>
                <th className="px-4 py-2 text-left">Customer Level</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Discount Amount</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Total Times Used</th>
                <th className="px-4 py-2 text-left">Total Discount Amount (₹)</th>
                <th className="px-4 py-2 text-left">Discount Status</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Skeleton state for clean loading */}
              {isLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 14 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-24 bg-gray-100 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
              {!isLoading && filtered.map((d, idx) => (
                <tr key={d.id} className="hover:bg-gray-50 hover:shadow-sm transition rounded">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {d.imageUrl ? (
                      <img src={d.imageUrl} alt="discount" className="h-6 w-20 rounded object-cover shadow-sm ring-1 ring-black/5" />
                    ) : (
                      <div className="h-6 w-20 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{d.zone || "All"}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">{d.customerLevel || "All"}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">{d.customer || "All"}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">{d.category || "All"}</span></td>
                  <td className="px-4 py-3">₹ {d.amount}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 leading-tight">
                      {d.startDate && <div>Start : {d.startDate}</div>}
                      {d.endDate && <div>End : {d.endDate}</div>}
                      <div>Duration : {d.duration || "-"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{d.totalTimesUsed || 0}</td>
                  <td className="px-4 py-3">₹ {d.totalAmount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${d.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{d.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => dispatch(updateDiscount({ discountId: String(d.id), discountData: { active: !d.active } }))} className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700 shadow-sm active:scale-[.98]">{d.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => dispatch(deleteDiscount(String(d.id)))} className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[.98]">Delete</button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10" colSpan={14}>
                    <div className="mx-auto max-w-md text-center">
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                        <span className="text-gray-400 text-2xl">📁</span>
                      </div>
                      <p className="mt-3 text-gray-700 font-medium">No data available</p>
                      <p className="mt-1 text-sm text-gray-500">Create your first discount to get started.</p>
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
