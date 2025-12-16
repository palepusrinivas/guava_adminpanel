"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getCoupons, deleteCoupon, updateCoupon, createCoupon } from "@/utils/reducers/adminReducers";
import { setCouponFilter, setCouponSearchQuery } from "@/utils/slices/couponSlice";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      </div>
      {icon ? <div className="text-teal-700">{icon}</div> : null}
    </div>
  );
}

export default function CouponSetup() {
  const dispatch = useAppDispatch();
  const { coupons, isLoading, error, filter, searchQuery } = useAppSelector((s) => s.coupon);

  useEffect(() => {
    dispatch(getCoupons()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = coupons.filter((c) => {
      if (filter === "active") return c.active;
      if (filter === "inactive") return !c.active;
      return true;
    });
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((c) =>
      [c.code, c.type || c.couponType, c.zone, c.customerLevel, c.customer, c.category, c.title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [coupons, filter, searchQuery]);

  const totalAmountGiven = coupons.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Header section to match screenshot */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white">Coupon Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard label="Total Coupon Amount Given" value={`₹ ${totalAmountGiven}`} icon={<span className="text-2xl">%</span>} />
            <StatCard label="Active Coupon Offer Running" value={activeCount} />
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-gray-800 font-semibold mb-1">Coupon analytics</div>
            <div className="text-sm text-gray-500 mb-4">Monitor coupon statistics</div>
            {/* Placeholder sparkline */}
            <div className="h-28 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
              Chart Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar and filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">All Coupon</h3>
        <div className="text-sm text-gray-500">Total Coupons : {coupons.length}</div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(setCouponFilter("all"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"}`}
        >
          All
        </button>
        <button
          onClick={() => dispatch(setCouponFilter("active"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"}`}
        >
          Active
        </button>
        <button
          onClick={() => dispatch(setCouponFilter("inactive"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"}`}
        >
          Inactive
        </button>
      </div>

      {/* Search & actions bar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setCouponSearchQuery(e.target.value))}
                placeholder="Search here by Coupon"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">Search</button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border rounded-lg">⟳</button>
            <button className="px-3 py-2 border rounded-lg">⚙</button>
            <button className="px-3 py-2 border rounded-lg">⬇</button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">+ Add Coupon</button>
          </div>
        </div>

        {/* Error state when backend not connected */}
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load coupons from server. Ensure backend coupon endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Coupon Title</th>
                <th className="px-4 py-2 text-left">Coupon Code</th>
                <th className="px-4 py-2 text-left">Coupon Type</th>
                <th className="px-4 py-2 text-left">Zone</th>
                <th className="px-4 py-2 text-left">Customer Level</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Coupon Amount</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Total Times Used</th>
                <th className="px-4 py-2 text-left">Total Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2 font-mono">{c.code}</td>
                  <td className="px-4 py-2">{c.couponType}</td>
                  <td className="px-4 py-2">{c.zone || "-"}</td>
                  <td className="px-4 py-2">{c.customerLevel || "-"}</td>
                  <td className="px-4 py-2">{c.customer || "-"}</td>
                  <td className="px-4 py-2">{c.category || "-"}</td>
                  <td className="px-4 py-2">₹ {c.amount}</td>
                  <td className="px-4 py-2">{c.duration || "-"}</td>
                  <td className="px-4 py-2">{c.totalTimesUsed || 0}</td>
                  <td className="px-4 py-2">₹ {c.totalAmount || 0}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => dispatch(updateCoupon({ couponId: String(c.id), couponData: { active: !c.active } }))}
                      className="px-3 py-1 text-xs rounded bg-teal-600 text-white"
                    >
                      {c.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => dispatch(deleteCoupon(String(c.id)))}
                      className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={14}>
                    No coupons found.
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

