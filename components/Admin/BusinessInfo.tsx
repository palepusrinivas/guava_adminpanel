"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessInfo, updateBusinessInfo } from "@/utils/reducers/adminReducers";

const businessInfoSchema = yup.object({
  businessName: yup.string().required("Business Name is required"),
  businessAddress: yup.string().required("Business Address is required"),
  businessContactNumber: yup.string().required("Business Contact Number is required"),
  businessContactEmail: yup.string().email("Invalid email").required("Business Contact Email is required"),
  businessSupportNumber: yup.string().required("Business Support Number is required"),
  businessSupportEmail: yup.string().email("Invalid email").required("Business Support Email is required"),
});

export default function BusinessInfo() {
  const dispatch = useAppDispatch();
  const { businessInfo, isLoading, error } = useAppSelector((s) => s.business);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessInfo()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (businessInfo) {
      formik.setValues({
        businessName: businessInfo.businessName || "GAUVA MOBILITY SERVICES",
        businessAddress: businessInfo.businessAddress || "R T C COMPLEX OPPOSITE AMALAPURAM DR B R AMBEDKAR DISTRICT ANDHRA PRADESH 533201 INDIA",
        tradeLicenseNumber: businessInfo.tradeLicenseNumber || "",
        businessContactNumber: businessInfo.businessContactNumber || "7095591373",
        businessContactEmail: businessInfo.businessContactEmail || "info@gauvaservices.in",
        businessSupportNumber: businessInfo.businessSupportNumber || "7095591373",
        businessSupportEmail: businessInfo.businessSupportEmail || "driversupport@gauvaservices.in",
        companyCopyrightText: businessInfo.companyCopyrightText || "",
      });
      setMaintenanceMode(businessInfo.maintenanceMode || false);
    }
  }, [businessInfo]);

  const formik = useFormik({
    initialValues: {
      businessName: "GAUVA MOBILITY SERVICES",
      businessAddress: "R T C COMPLEX OPPOSITE AMALAPURAM DR B R AMBEDKAR DISTRICT ANDHRA PRADESH 533201 INDIA",
      tradeLicenseNumber: "",
      businessContactNumber: "7095591373",
      businessContactEmail: "info@gauvaservices.in",
      businessSupportNumber: "7095591373",
      businessSupportEmail: "driversupport@gauvaservices.in",
      companyCopyrightText: "",
    },
    validationSchema: businessInfoSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const businessData = {
          ...values,
          maintenanceMode,
        };
        const result = await dispatch(updateBusinessInfo(businessData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Business information saved successfully!");
        } else {
          throw new Error((result as any).payload || "Failed to save business information");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to save business information. Ensure backend API is ready.");
      }
    },
  });

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">
          {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load business information from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      {/* System Maintenance Mode */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-gray-900">System Maintenance Mode</h3>
              <p className="text-sm text-gray-600 mt-1">
                Use the System Maintenance feature to work on the system and disable user access.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">{maintenanceMode ? "On" : "Off"}</span>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                maintenanceMode ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  maintenanceMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
            <p className="text-sm text-gray-600">Configure Essential Company Details</p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formik.values.businessName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessName && formik.errors.businessName && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="businessAddress"
                  value={formik.values.businessAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessAddress && formik.errors.businessAddress && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessAddress}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trade License Number</label>
                <input
                  type="text"
                  name="tradeLicenseNumber"
                  value={formik.values.tradeLicenseNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessContactNumber"
                  value={formik.values.businessContactNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessContactNumber && formik.errors.businessContactNumber && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessContactNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="businessContactEmail"
                  value={formik.values.businessContactEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessContactEmail && formik.errors.businessContactEmail && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessContactEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Support Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessSupportNumber"
                  value={formik.values.businessSupportNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessSupportNumber && formik.errors.businessSupportNumber && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessSupportNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Support Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="businessSupportEmail"
                  value={formik.values.businessSupportEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.businessSupportEmail && formik.errors.businessSupportEmail && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.businessSupportEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Copyright Text</label>
                <input
                  type="text"
                  name="companyCopyrightText"
                  value={formik.values.companyCopyrightText}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isLoading ? "Saving..." : "Save Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

