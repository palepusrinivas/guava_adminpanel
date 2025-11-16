"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessFarePenalty, updateBusinessFarePenalty } from "@/utils/reducers/adminReducers";

const farePenaltySchema = yup.object({
  idleFeeStartMinutes: yup.number().min(0).required("Idle Fee Start Minutes is required"),
  delayFeeStartMinutes: yup.number().min(0).required("Delay Fee Start Minutes is required"),
});

export default function BusinessFarePenalty() {
  const dispatch = useAppDispatch();
  const { farePenalty, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessFarePenalty()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      idleFeeStartMinutes: 2,
      delayFeeStartMinutes: 2,
    },
    validationSchema: farePenaltySchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(updateBusinessFarePenalty(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Fare & Penalty settings saved successfully!");
          setTimeout(() => setSubmitSuccess(null), 3000);
        } else {
          throw new Error((result as any).payload || "Failed to save settings");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to save settings. Ensure backend API is ready.");
      }
    },
  });

  useEffect(() => {
    if (farePenalty) {
      formik.setValues({
        idleFeeStartMinutes: farePenalty.idleFeeStartMinutes || 2,
        delayFeeStartMinutes: farePenalty.delayFeeStartMinutes || 2,
      });
    }
  }, [farePenalty]);

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load fare & penalty settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Fare & Penalty Settings</h3>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Count Idle Fee After (Min)
              </label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="number"
              name="idleFeeStartMinutes"
              value={formik.values.idleFeeStartMinutes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {formik.touched.idleFeeStartMinutes && formik.errors.idleFeeStartMinutes && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.idleFeeStartMinutes}</p>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Count Delay Fee After (Min)
              </label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="number"
              name="delayFeeStartMinutes"
              value={formik.values.delayFeeStartMinutes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {formik.touched.delayFeeStartMinutes && formik.errors.delayFeeStartMinutes && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.delayFeeStartMinutes}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

