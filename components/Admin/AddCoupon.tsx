"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createCoupon, getCoupons } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";

const schema = yup.object({
  code: yup.string().required("Code is required").max(64, "Code must be 64 characters or less"),
  type: yup.string().oneOf(["PERCENT", "FLAT"], "Type must be PERCENT or FLAT").required("Type is required"),
  value: yup.number().min(0, "Value must be positive").required("Value is required"),
  minFare: yup.number().min(0).nullable(),
  startsAt: yup.string().nullable(),
  endsAt: yup.string().nullable(),
  maxRedemptions: yup.number().min(1).nullable(),
  maxRedemptionsPerUser: yup.number().min(1).nullable(),
  active: yup.boolean().default(true),
});

export default function AddCoupon() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.coupon);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      code: "",
      type: "PERCENT" as "PERCENT" | "FLAT",
      value: 0,
      minFare: undefined as number | undefined,
      startsAt: "",
      endsAt: "",
      maxRedemptions: undefined as number | undefined,
      maxRedemptionsPerUser: undefined as number | undefined,
      active: true,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);

        // Transform to backend format
        const backendData: any = {
          code: values.code.toUpperCase().trim(),
          type: values.type,
          value: values.value,
          active: values.active,
        };

        // Only include optional fields if they have values
        if (values.minFare !== undefined && values.minFare !== null && values.minFare > 0) {
          backendData.minFare = values.minFare;
        }
        if (values.startsAt) {
          backendData.startsAt = new Date(values.startsAt).toISOString();
        }
        if (values.endsAt) {
          backendData.endsAt = new Date(values.endsAt).toISOString();
        }
        if (values.maxRedemptions !== undefined && values.maxRedemptions !== null && values.maxRedemptions > 0) {
          backendData.maxRedemptions = values.maxRedemptions;
        }
        if (values.maxRedemptionsPerUser !== undefined && values.maxRedemptionsPerUser !== null && values.maxRedemptionsPerUser > 0) {
          backendData.maxRedemptionsPerUser = values.maxRedemptionsPerUser;
        }

        const result = await dispatch(createCoupon(backendData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Coupon created successfully!");
          formik.resetForm();
          dispatch(getCoupons());
          setTimeout(() => {
            router.push("/admin/coupons");
          }, 1500);
        } else {
          throw new Error((result as any).payload || "Failed to create coupon");
        }
      } catch (e: any) {
        const errorMsg = e.message || "Failed to create coupon. Ensure backend API is ready.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white">Add New Coupon</h2>
        <p className="text-white/80 text-sm mt-1">Create and configure a new coupon for your promotions</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {submitSuccess && (
          <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
            {submitSuccess}
          </div>
        )}
        {submitError && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
            {submitError}
          </div>
        )}
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
            <input
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: NEW20"
              maxLength={64}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Type *</label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="PERCENT">Percentage</option>
              <option value="FLAT">Flat Amount</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formik.values.type === "PERCENT" ? "Percentage (%) *" : "Flat Amount (₹) *"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="value"
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              placeholder={formik.values.type === "PERCENT" ? "Ex: 20" : "Ex: 50"}
              max={formik.values.type === "PERCENT" ? 100 : undefined}
            />
            {formik.touched.value && formik.errors.value && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.value}</p>
            )}
            {formik.values.type === "PERCENT" && (
              <p className="text-xs text-gray-500 mt-1">Enter percentage (0-100)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="minFare"
              value={formik.values.minFare || ""}
              onChange={(e) => formik.setFieldValue("minFare", e.target.value ? parseFloat(e.target.value) : undefined)}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              placeholder="Optional - minimum fare to apply coupon"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty if no minimum fare required</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              name="startsAt"
              value={formik.values.startsAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to start immediately</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              name="endsAt"
              value={formik.values.endsAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Redemptions</label>
            <input
              type="number"
              min="1"
              name="maxRedemptions"
              value={formik.values.maxRedemptions || ""}
              onChange={(e) => formik.setFieldValue("maxRedemptions", e.target.value ? parseInt(e.target.value) : undefined)}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              placeholder="Optional - unlimited if empty"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum times this coupon can be used globally</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Redemptions Per User</label>
            <input
              type="number"
              min="1"
              name="maxRedemptionsPerUser"
              value={formik.values.maxRedemptionsPerUser || ""}
              onChange={(e) => formik.setFieldValue("maxRedemptionsPerUser", e.target.value ? parseInt(e.target.value) : undefined)}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              placeholder="Optional - unlimited if empty"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum times a single user can use this coupon</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="active"
                checked={formik.values.active}
                onChange={formik.handleChange}
                className="h-4 w-4 text-teal-600"
              />
              <span className="text-sm font-medium text-gray-700">Active (coupon will be available for use)</span>
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => router.push("/admin/coupons")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
