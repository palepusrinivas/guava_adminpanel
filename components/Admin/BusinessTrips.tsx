"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessTripsSettings, updateBusinessTripsSettings } from "@/utils/reducers/adminReducers";

const tripsSchema = yup.object({
  addRouteBetweenPickup: yup.string().required("Route option is required"),
  activeTimeMinutes: yup.number().min(0).required("Active time is required"),
  driverOtpConfirmation: yup.boolean(),
  cancellationReason: yup.string().max(255),
  cancellationType: yup.string(),
  userType: yup.string(),
});

export default function BusinessTrips() {
  const dispatch = useAppDispatch();
  const { tripsSettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessTripsSettings()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      addRouteBetweenPickup: "Yes",
      activeTimeMinutes: 1,
      driverOtpConfirmation: true,
      cancellationReason: "",
      cancellationType: "",
      userType: "",
    },
    validationSchema: tripsSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(updateBusinessTripsSettings(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Trips settings saved successfully!");
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
    if (tripsSettings) {
      formik.setValues({
        addRouteBetweenPickup: tripsSettings.addRouteBetweenPickup || "Yes",
        activeTimeMinutes: tripsSettings.activeTimeMinutes || 1,
        driverOtpConfirmation: tripsSettings.driverOtpConfirmation ?? true,
        cancellationReason: tripsSettings.cancellationReason || "",
        cancellationType: tripsSettings.cancellationType || "",
        userType: tripsSettings.userType || "",
      });
    }
  }, [tripsSettings]);

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
          Unable to load trips settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      {/* Trips Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Trips Settings</h3>
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
            i
          </div>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">Add Route Between Pickup & Destination</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="addRouteBetweenPickup"
                  value="Yes"
                  checked={formik.values.addRouteBetweenPickup === "Yes"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="addRouteBetweenPickup"
                  value="No"
                  checked={formik.values.addRouteBetweenPickup === "No"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Request Active Time For Customer
            </label>
            <label className="block text-xs text-gray-600 mb-1">Searching Active Time For (Min)</label>
            <input
              type="number"
              name="activeTimeMinutes"
              value={formik.values.activeTimeMinutes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {formik.touched.activeTimeMinutes && formik.errors.activeTimeMinutes && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.activeTimeMinutes}</p>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">Trip OTP</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Driver OTP Confirmation For Trip</label>
              <button
                type="button"
                onClick={() => formik.setFieldValue("driverOtpConfirmation", !formik.values.driverOtpConfirmation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formik.values.driverOtpConfirmation ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formik.values.driverOtpConfirmation ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
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

      {/* Trips Cancellation Messages */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Trips Cancellation Messages</h3>
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
            i
          </div>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Trip Cancellation Reason (Max 255 Character)
              </label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <textarea
              name="cancellationReason"
              value={formik.values.cancellationReason}
              onChange={(e) => {
                formik.handleChange(e);
                if (e.target.value.length <= 255) {
                  formik.setFieldValue("cancellationReason", e.target.value);
                }
              }}
              onBlur={formik.handleBlur}
              placeholder="Ex: vehicle problem"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formik.values.cancellationReason.length}/255
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Type</label>
              <select
                name="cancellationType"
                value={formik.values.cancellationType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Cancellation Type</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                name="userType"
                value={formik.values.userType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select User Type</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </select>
            </div>
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

