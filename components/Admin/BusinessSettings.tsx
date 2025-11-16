"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessSettings, updateBusinessSettings } from "@/utils/reducers/adminReducers";

const settingsSchema = yup.object({
  tripCommission: yup.number().min(0).max(100).required("Trip Commission is required"),
  vat: yup.number().min(0).max(100).required("VAT is required"),
  searchRadius: yup.number().min(0).required("Search Radius is required"),
  driverCompletionRadius: yup.number().min(0).required("Driver Completion Radius is required"),
  websocketUrl: yup.string().required("Websocket URL is required"),
  websocketPort: yup.number().min(1).max(65535).required("Websocket Port is required"),
  maxLoginAttempt: yup.number().min(1).required("Maximum Login Attempt is required"),
  tempLoginBlockTime: yup.number().min(0).required("Temporary Login Block Time is required"),
  maxOtpSubmitAttempt: yup.number().min(1).required("Maximum OTP Submit Attempt is required"),
  otpResendTime: yup.number().min(0).required("OTP Resend Time is required"),
  tempOtpBlockTime: yup.number().min(0).required("Temporary OTP Block Time is required"),
  paginationLimit: yup.number().min(1).required("Pagination Limit is required"),
  bidOnFare: yup.boolean(),
});

export default function BusinessSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessSettings()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      tripCommission: 7,
      vat: 0,
      searchRadius: 10,
      driverCompletionRadius: 50,
      websocketUrl: "gauvaservices.in",
      websocketPort: 8082,
      maxLoginAttempt: 5,
      tempLoginBlockTime: 60,
      maxOtpSubmitAttempt: 3,
      otpResendTime: 60,
      tempOtpBlockTime: 60,
      paginationLimit: 100,
      bidOnFare: false,
    },
    validationSchema: settingsSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(updateBusinessSettings(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Business settings saved successfully!");
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
    if (settings) {
      formik.setValues({
        tripCommission: settings.tripCommission || 7,
        vat: settings.vat || 0,
        searchRadius: settings.searchRadius || 10,
        driverCompletionRadius: settings.driverCompletionRadius || 50,
        websocketUrl: settings.websocketUrl || "gauvaservices.in",
        websocketPort: settings.websocketPort || 8082,
        maxLoginAttempt: settings.maxLoginAttempt || 5,
        tempLoginBlockTime: settings.tempLoginBlockTime || 60,
        maxOtpSubmitAttempt: settings.maxOtpSubmitAttempt || 3,
        otpResendTime: settings.otpResendTime || 60,
        tempOtpBlockTime: settings.tempOtpBlockTime || 60,
        paginationLimit: settings.paginationLimit || 100,
        bidOnFare: settings.bidOnFare ?? false,
      });
    }
  }, [settings]);

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
          Unable to load business settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Business Settings</h3>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Commission (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tripCommission"
                value={formik.values.tripCommission}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.tripCommission && formik.errors.tripCommission && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.tripCommission}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vat (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="vat"
                value={formik.values.vat}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.vat && formik.errors.vat && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.vat}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (Km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="searchRadius"
                value={formik.values.searchRadius}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.searchRadius && formik.errors.searchRadius && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.searchRadius}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Completion Radius (Meter) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="driverCompletionRadius"
                value={formik.values.driverCompletionRadius}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.driverCompletionRadius && formik.errors.driverCompletionRadius && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.driverCompletionRadius}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Websocket Url <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="websocketUrl"
                value={formik.values.websocketUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.websocketUrl && formik.errors.websocketUrl && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.websocketUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Websocket Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="websocketPort"
                value={formik.values.websocketPort}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.websocketPort && formik.errors.websocketPort && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.websocketPort}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Login Attempt <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxLoginAttempt"
                value={formik.values.maxLoginAttempt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.maxLoginAttempt && formik.errors.maxLoginAttempt && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.maxLoginAttempt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Login Block Time (In Seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tempLoginBlockTime"
                value={formik.values.tempLoginBlockTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.tempLoginBlockTime && formik.errors.tempLoginBlockTime && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.tempLoginBlockTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum OTP Submit Attempt <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxOtpSubmitAttempt"
                value={formik.values.maxOtpSubmitAttempt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.maxOtpSubmitAttempt && formik.errors.maxOtpSubmitAttempt && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.maxOtpSubmitAttempt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Resend Time (In Seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="otpResendTime"
                value={formik.values.otpResendTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.otpResendTime && formik.errors.otpResendTime && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.otpResendTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporary OTP Block Time (In Seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tempOtpBlockTime"
                value={formik.values.tempOtpBlockTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.tempOtpBlockTime && formik.errors.tempOtpBlockTime && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.tempOtpBlockTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pagination Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="paginationLimit"
                value={formik.values.paginationLimit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.paginationLimit && formik.errors.paginationLimit && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.paginationLimit}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">Bid On Fare</label>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                  i
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">Enable Bid On Fare</span>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue("bidOnFare", !formik.values.bidOnFare)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formik.values.bidOnFare ? "bg-teal-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formik.values.bidOnFare ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Saving..." : "Save Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

