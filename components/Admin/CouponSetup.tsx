"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getCoupons, deleteCoupon, updateCoupon, getCouponById } from "@/utils/reducers/adminReducers";
import { setCouponFilter, setCouponSearchQuery, setSelectedCoupon } from "@/utils/slices/couponSlice";
import { toast } from "react-hot-toast";
import type { Coupon } from "@/utils/slices/couponSlice";

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

interface EditCouponModalProps {
  coupon: Coupon | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Coupon>) => Promise<void>;
}

function EditCouponModal({ coupon, open, onClose, onSave }: EditCouponModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    type: "PERCENT",
    value: 0,
    minFare: undefined,
    startsAt: "",
    endsAt: "",
    maxRedemptions: undefined,
    maxRedemptionsPerUser: undefined,
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        type: coupon.type || "PERCENT",
        value: coupon.value || 0,
        minFare: coupon.minFare || undefined,
        startsAt: coupon.startsAt || "",
        endsAt: coupon.endsAt || "",
        maxRedemptions: coupon.maxRedemptions || undefined,
        maxRedemptionsPerUser: coupon.maxRedemptionsPerUser || undefined,
        active: coupon.active ?? true,
      });
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Transform to backend format
      const updateData: any = {
        code: formData.code?.toUpperCase().trim(),
        type: formData.type,
        value: formData.value,
        active: formData.active,
      };
      
      if (formData.minFare !== undefined && formData.minFare !== null) {
        updateData.minFare = formData.minFare;
      }
      if (formData.startsAt) {
        updateData.startsAt = formData.startsAt;
      }
      if (formData.endsAt) {
        updateData.endsAt = formData.endsAt;
      }
      if (formData.maxRedemptions !== undefined && formData.maxRedemptions !== null) {
        updateData.maxRedemptions = formData.maxRedemptions;
      }
      if (formData.maxRedemptionsPerUser !== undefined && formData.maxRedemptionsPerUser !== null) {
        updateData.maxRedemptionsPerUser = formData.maxRedemptionsPerUser;
      }

      await onSave(updateData);
      onClose();
      toast.success("Coupon updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-teal-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Coupon</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="PERCENT">Percentage</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === "PERCENT" ? "Percentage (0-100)" : "Flat amount in ₹"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minFare || ""}
                onChange={(e) => setFormData({ ...formData, minFare: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startsAt ? new Date(formData.startsAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={formData.endsAt ? new Date(formData.endsAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Redemptions (Total)</label>
              <input
                type="number"
                min="0"
                value={formData.maxRedemptions || ""}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                placeholder="Unlimited if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Redemptions Per User</label>
              <input
                type="number"
                min="0"
                value={formData.maxRedemptionsPerUser || ""}
                onChange={(e) => setFormData({ ...formData, maxRedemptionsPerUser: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                placeholder="Unlimited if empty"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-teal-600"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CouponSetup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { coupons, isLoading, error, filter, searchQuery, selectedCoupon } = useAppSelector((s) => s.coupon);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);

  useEffect(() => {
    dispatch(getCoupons()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    let base = coupons;
    if (filter === "active") base = base.filter((c) => c.active);
    if (filter === "inactive") base = base.filter((c) => !c.active);
    
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((c) =>
      [c.code, c.type, String(c.value || "")]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [coupons, filter, searchQuery]);

  const activeCount = coupons.filter((c) => c.active).length;

  const handleEdit = async (coupon: Coupon) => {
    try {
      await dispatch(getCouponById(String(coupon.id))).unwrap();
      setCouponToEdit(coupon);
      setEditModalOpen(true);
    } catch (error: any) {
      toast.error("Failed to load coupon details");
    }
  };

  const handleSaveEdit = async (data: Partial<Coupon>) => {
    if (!couponToEdit) return;
    await dispatch(updateCoupon({ couponId: String(couponToEdit.id), couponData: data })).unwrap();
    dispatch(getCoupons());
    setEditModalOpen(false);
    setCouponToEdit(null);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;
    try {
      await dispatch(deleteCoupon(String(coupon.id))).unwrap();
      toast.success("Coupon deleted successfully");
      dispatch(getCoupons());
    } catch (error: any) {
      toast.error(error || "Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await dispatch(updateCoupon({ couponId: String(coupon.id), couponData: { active: !coupon.active } })).unwrap();
      toast.success(`Coupon ${!coupon.active ? "activated" : "deactivated"}`);
      dispatch(getCoupons());
    } catch (error: any) {
      toast.error(error || "Failed to update coupon status");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === "PERCENT") {
      return `${coupon.value}%`;
    }
    return `₹${coupon.value}`;
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white">Coupon Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard label="Total Coupons" value={coupons.length} icon={<span className="text-2xl">🎫</span>} />
            <StatCard label="Active Coupons" value={activeCount} icon={<span className="text-2xl">✅</span>} />
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-gray-800 font-semibold mb-1">Coupon Analytics</div>
            <div className="text-sm text-gray-500 mb-4">Monitor coupon statistics</div>
            <div className="h-28 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
              Chart Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar and filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">All Coupons</h3>
        <div className="text-sm text-gray-500">Total Coupons: {coupons.length}</div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(setCouponFilter("all"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700 border"}`}
        >
          All
        </button>
        <button
          onClick={() => dispatch(setCouponFilter("active"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700 border"}`}
        >
          Active
        </button>
        <button
          onClick={() => dispatch(setCouponFilter("inactive"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700 border"}`}
        >
          Inactive
        </button>
      </div>

      {/* Search & actions bar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 mb-4">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setCouponSearchQuery(e.target.value))}
                placeholder="Search by coupon code, type, or value..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(getCoupons())}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              ⟳
            </button>
            <button
              onClick={() => router.push("/admin/coupons/new")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              + Add Coupon
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Min Fare</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Max Uses</th>
                <th className="px-4 py-3 text-left">Max/User</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${c.type === "PERCENT" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {c.type || "PERCENT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatValue(c)}</td>
                    <td className="px-4 py-3">{c.minFare ? `₹${c.minFare}` : "-"}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.startsAt)}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.endsAt)}</td>
                    <td className="px-4 py-3">{c.maxRedemptions || "∞"}</td>
                    <td className="px-4 py-3">{c.maxRedemptionsPerUser || "∞"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2 py-1 text-xs rounded text-white ${c.active ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}
                          title={c.active ? "Deactivate" : "Activate"}
                        >
                          {c.active ? "⏸ Deactivate" : "▶ Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                          title="Delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCouponModal
        coupon={couponToEdit}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setCouponToEdit(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
