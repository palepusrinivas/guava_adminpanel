"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createCoupon, getCoupons } from "@/utils/reducers/adminReducers";

const schema = yup.object({
  title: yup.string().required("Title is required"),
  code: yup.string().required("Code is required").max(20),
  couponType: yup.string().oneOf(["percentage", "flat"]).required(),
  amount: yup.number().min(0).required("Amount is required"),
  duration: yup.string().required("Duration is required"),
  active: yup.boolean().default(true),
});

export default function AddCoupon() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.coupon);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      code: "",
      couponType: "percentage",
      zone: "",
      customerLevel: "",
      customer: "",
      category: "",
      amount: 0,
      duration: "7 days",
      active: true,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(createCoupon(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Coupon created successfully!");
          formik.resetForm();
          dispatch(getCoupons());
          setTimeout(() => setSubmitSuccess(null), 4000);
        } else {
          throw new Error((result as any).payload || "Failed to create coupon");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create coupon. Ensure backend API is ready.");
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
          <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{submitSuccess}</div>
        )}
        {submitError && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
        )}
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Title *</label>
            <input name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: New Year 20% Off" />
            {formik.touched.title && formik.errors.title && <p className="text-sm text-red-600 mt-1">{formik.errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
            <input name="code" value={formik.values.code} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: NEW20" />
            {formik.touched.code && formik.errors.code && <p className="text-sm text-red-600 mt-1">{formik.errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Type *</label>
            <select name="couponType" value={formik.values.couponType} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Amount *</label>
            <input type="number" name="amount" value={formik.values.amount} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: 20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <input name="zone" value={formik.values.zone} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Downtown" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Level</label>
            <input name="customerLevel" value={formik.values.customerLevel} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Gold" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input name="customer" value={formik.values.customer} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input name="category" value={formik.values.category} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Rides" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
            <select name="duration" value={formik.values.duration} onChange={formik.handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500">
              <option>7 days</option>
              <option>14 days</option>
              <option>1 month</option>
              <option>3 months</option>
              <option>Permanent</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input type="checkbox" id="active" name="active" checked={formik.values.active} onChange={formik.handleChange} className="h-4 w-4 text-teal-600" />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">{isLoading ? "Saving..." : "Save Coupon"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

