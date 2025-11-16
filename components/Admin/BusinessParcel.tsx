"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessParcelSettings, updateBusinessParcelSettings } from "@/utils/reducers/adminReducers";

const parcelSchema = yup.object({
  trackingLinkEnabled: yup.boolean(),
  trackingMessageTemplate: yup.string().max(200),
  returnTimeFeeEnabled: yup.boolean(),
  weightUnit: yup.string(),
  weightLimitEnabled: yup.boolean(),
  maxWeightLimit: yup.number().min(0),
  cancellationReason: yup.string().max(255),
  cancellationType: yup.string(),
  userType: yup.string(),
});

export default function BusinessParcel() {
  const dispatch = useAppDispatch();
  const { parcelSettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessParcelSettings()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      trackingLinkEnabled: true,
      trackingMessageTemplate: "Dear {CustomerName}\nParcel ID is {ParcelId} You can track this parcel from this link {TrackingLink}",
      returnTimeFeeEnabled: false,
      weightUnit: "Kg",
      weightLimitEnabled: true,
      maxWeightLimit: 15,
      cancellationReason: "",
      cancellationType: "",
      userType: "",
    },
    validationSchema: parcelSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(updateBusinessParcelSettings(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Parcel settings saved successfully!");
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
    if (parcelSettings) {
      formik.setValues({
        trackingLinkEnabled: parcelSettings.trackingLinkEnabled ?? true,
        trackingMessageTemplate: parcelSettings.trackingMessageTemplate || formik.initialValues.trackingMessageTemplate,
        returnTimeFeeEnabled: parcelSettings.returnTimeFeeEnabled ?? false,
        weightUnit: parcelSettings.weightUnit || "Kg",
        weightLimitEnabled: parcelSettings.weightLimitEnabled ?? true,
        maxWeightLimit: parcelSettings.maxWeightLimit || 15,
        cancellationReason: parcelSettings.cancellationReason || "",
        cancellationType: parcelSettings.cancellationType || "",
        userType: parcelSettings.userType || "",
      });
    }
  }, [parcelSettings]);

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
          Unable to load parcel settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      {/* Sent Parcel Tracking Link To Customer */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sent Parcel Tracking Link To Customer</h3>
            <p className="text-sm text-gray-600 mt-1">
              Enabling This Option Will Send The Parcel Tracking Link To The Customer Via SMS When They Place Any Parcel Booking
            </p>
          </div>
          <button
            onClick={() => {
              formik.setFieldValue("trackingLinkEnabled", !formik.values.trackingLinkEnabled);
              dispatch(updateBusinessParcelSettings({ ...formik.values, trackingLinkEnabled: !formik.values.trackingLinkEnabled }));
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formik.values.trackingLinkEnabled ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formik.values.trackingLinkEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tracking Link Template Setup */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tracking Link Template Setup</h3>
        <p className="text-sm text-gray-600 mb-4">
          Hear You Can Write A Massage Body. Customer Name Parcel ID & Tracking Link Will Generate Automatically For Each Individual Parcel.
        </p>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              name="trackingMessageTemplate"
              value={formik.values.trackingMessageTemplate}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  formik.setFieldValue("trackingMessageTemplate", e.target.value);
                }
              }}
              onBlur={formik.handleBlur}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formik.values.trackingMessageTemplate.length}/200
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => formik.resetForm()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              Save
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-800">
              In Message Field You Can't Change The {"{CustomerName}"}, {"{ParcelId}"} & {"{TrackingLink}"}. They Will Automatically Generate. You Can Only Edit Other Text.
            </p>
          </div>
        </form>
      </div>

      {/* Parcel Return Time & Fee */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Parcel Return Time & Fee</h3>
            <p className="text-sm text-gray-600 mt-1">
              When The Toggle Is Turned ON The Parcel Return Time And Fee Are Activated When Turned OFF They Are Deactivated.
            </p>
          </div>
          <button
            onClick={() => {
              formik.setFieldValue("returnTimeFeeEnabled", !formik.values.returnTimeFeeEnabled);
              dispatch(updateBusinessParcelSettings({ ...formik.values, returnTimeFeeEnabled: !formik.values.returnTimeFeeEnabled }));
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formik.values.returnTimeFeeEnabled ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formik.values.returnTimeFeeEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Parcel weight Unit */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Parcel weight Unit</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose the Weight unit from the dropdown list. This selected Unit will be applicable for all weight measurements
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Set Unit</label>
            <select
              name="weightUnit"
              value={formik.values.weightUnit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="Kg">Kg (Kilograms)</option>
              <option value="g">g (Grams)</option>
              <option value="lb">lb (Pounds)</option>
            </select>
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

      {/* Parcel weight limit */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Parcel weight limit</h3>
            <p className="text-sm text-gray-600 mt-1">
              If turned ON customer will notify if their requested weight exceeds the capacity.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View ↑</button>
            <button
              onClick={() => {
                formik.setFieldValue("weightLimitEnabled", !formik.values.weightLimitEnabled);
                dispatch(updateBusinessParcelSettings({ ...formik.values, weightLimitEnabled: !formik.values.weightLimitEnabled }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formik.values.weightLimitEnabled ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formik.values.weightLimitEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Parcel Weight Limit (Kg)</label>
            <div className="relative">
              <input
                type="number"
                name="maxWeightLimit"
                value={formik.values.maxWeightLimit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: 15 kg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

      {/* Parcel Cancellation Reason */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Parcel Cancellation Reason</h3>
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
            i
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Here You Can Add The Reasons That Customer & User Will Select For Cancel Parcel
        </p>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parcel Cancellation Reason (Max 255 Character)
            </label>
            <textarea
              name="cancellationReason"
              value={formik.values.cancellationReason}
              onChange={(e) => {
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
        </form>
      </div>
    </div>
  );
}

