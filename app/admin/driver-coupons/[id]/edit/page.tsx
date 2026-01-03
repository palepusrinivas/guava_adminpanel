"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch } from "@/utils/store/store";
import { getDriverCouponById, updateDriverCoupon } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";

interface DriverCoupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minAmount?: number;
  maxAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export default function EditDriverCouponPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const couponId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minAmount: "",
    maxAmount: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupon();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setFetching(true);
      const result = await dispatch(getDriverCouponById(couponId));
      if (getDriverCouponById.fulfilled.match(result)) {
        const coupon = result.payload as DriverCoupon;
        setFormData({
          code: coupon.code || "",
          discountType: coupon.discountType || "PERCENTAGE",
          discountValue: coupon.discountValue || 0,
          minAmount: coupon.minAmount?.toString() || "",
          maxAmount: coupon.maxAmount?.toString() || "",
          maxDiscount: coupon.maxDiscount?.toString() || "",
          expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : "",
          usageLimit: coupon.usageLimit?.toString() || "",
          isActive: coupon.isActive ?? true,
        });
      } else {
        toast.error("Failed to fetch coupon");
        router.push("/admin/driver-coupons");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch coupon");
      router.push("/admin/driver-coupons");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const couponData: any = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        expiryDate: formData.expiryDate,
        isActive: formData.isActive,
      };

      if (formData.minAmount) {
        couponData.minAmount = parseFloat(formData.minAmount);
      }
      if (formData.maxAmount) {
        couponData.maxAmount = parseFloat(formData.maxAmount);
      }
      if (formData.maxDiscount) {
        couponData.maxDiscount = parseFloat(formData.maxDiscount);
      }
      if (formData.usageLimit) {
        couponData.usageLimit = parseInt(formData.usageLimit);
      }

      const result = await dispatch(updateDriverCoupon({ couponId, couponData }));
      if (updateDriverCoupon.fulfilled.match(result)) {
        toast.success("Coupon updated successfully");
        router.push("/admin/driver-coupons");
      } else {
        toast.error(result.payload as string || "Failed to update coupon");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading coupon...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Driver Subscription Coupon</h1>
        <p className="text-gray-500 mt-1">Update coupon details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.discountType === "PERCENTAGE"
                ? "Percentage (0-100)"
                : "Fixed amount in ₹"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Subscription Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Subscription Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.maxAmount}
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
          </div>

          {formData.discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

