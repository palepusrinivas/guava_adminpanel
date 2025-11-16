"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessReferralSettings, updateBusinessReferralSettings } from "@/utils/reducers/adminReducers";

export default function BusinessReferral() {
  const dispatch = useAppDispatch();
  const { referralSettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referralAmount, setReferralAmount] = useState("");

  useEffect(() => {
    dispatch(getBusinessReferralSettings()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (referralSettings) {
      setReferralEnabled(referralSettings.enabled ?? false);
      setReferralAmount(referralSettings.amount?.toString() || "");
    }
  }, [referralSettings]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const settings = {
        enabled: referralEnabled,
        amount: referralAmount ? parseFloat(referralAmount) : 0,
      };
      const result = await dispatch(updateBusinessReferralSettings(settings));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Referral settings saved successfully!");
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
          Unable to load referral settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Referral Earning</h3>
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
            i
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Enable Referral Earning</label>
            <button
              onClick={() => setReferralEnabled(!referralEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                referralEnabled ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  referralEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {referralEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Amount (₹)</label>
              <input
                type="number"
                value={referralAmount}
                onChange={(e) => setReferralAmount(e.target.value)}
                placeholder="Enter referral amount"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

