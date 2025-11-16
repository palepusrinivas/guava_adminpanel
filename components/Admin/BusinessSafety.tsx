"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessSafetySettings, updateBusinessSafetySettings } from "@/utils/reducers/adminReducers";

export default function BusinessSafety() {
  const dispatch = useAppDispatch();
  const { safetySettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBusinessSafetySettings()).catch(() => {});
  }, [dispatch]);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const settings = { ...safetySettings, [field]: value };
      const result = await dispatch(updateBusinessSafetySettings(settings));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Safety settings saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save settings");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save settings. Ensure backend API is ready.");
    }
  };

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
          Unable to load safety settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Safety & Precautions Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure safety features and precautions for trips and deliveries.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Enable Emergency Contact Feature</label>
            <button
              onClick={() => handleToggle("emergencyContactEnabled", !(safetySettings?.emergencyContactEnabled ?? true))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                safetySettings?.emergencyContactEnabled ?? true ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  safetySettings?.emergencyContactEnabled ?? true ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

