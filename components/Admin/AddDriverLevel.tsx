"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createDriverLevel, getDriverLevels } from "@/utils/reducers/adminReducers";

const schema = yup.object({
  name: yup.string().required("Level name is required"),
  rideComplete: yup.number().min(0).required(),
  earningAmount: yup.number().min(0).required(),
  cancellationRate: yup.number().min(0).max(100).required(),
  givenReview: yup.number().min(0).required(),
  active: yup.boolean().default(true),
});

export default function AddDriverLevel() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.driverLevel);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "Platinum",
      rideComplete: 20,
      earningAmount: 1500,
      cancellationRate: 0,
      givenReview: 0,
      active: true,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name,
        targets: {
          rideComplete: values.rideComplete,
          earningAmount: values.earningAmount,
          cancellationRate: values.cancellationRate,
          givenReview: values.givenReview,
        },
        active: values.active,
      };
      const result: any = await dispatch(createDriverLevel(payload));
      if (result.meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Level created successfully!");
        formik.resetForm();
        dispatch(getDriverLevels());
        setTimeout(() => setSubmitSuccess(null), 4000);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <h2 className="text-xl font-extrabold text-white">Add Driver Level</h2>
        <p className="text-white/80 text-sm mt-1">Define targets and activation for a new level</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {submitSuccess && (<div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{submitSuccess}</div>)}

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level Name *</label>
            <input name="name" value={formik.values.name} onChange={formik.handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ride Complete *</label>
            <input type="number" name="rideComplete" value={formik.values.rideComplete} onChange={formik.handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Earning Amount (₹) *</label>
            <input type="number" name="earningAmount" value={formik.values.earningAmount} onChange={formik.handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Cancellation Rate (%) *</label>
            <input type="number" name="cancellationRate" value={formik.values.cancellationRate} onChange={formik.handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Given Review *</label>
            <input type="number" name="givenReview" value={formik.values.givenReview} onChange={formik.handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <input type="checkbox" id="active" name="active" checked={formik.values.active} onChange={formik.handleChange} className="h-4 w-4 text-teal-600" />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 active:scale-[.98] disabled:opacity-50 shadow">{isLoading ? "Saving..." : "Save Level"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}





