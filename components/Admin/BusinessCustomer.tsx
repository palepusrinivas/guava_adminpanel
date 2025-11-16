"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessCustomerSettings, updateBusinessCustomerSettings } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

export default function BusinessCustomer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { customerSettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [loyaltyPoint, setLoyaltyPoint] = useState({
    enabled: true,
    equivalentPoints: "10",
  });
  const [customerReview, setCustomerReview] = useState({
    enabled: true,
  });
  const [customerLevel, setCustomerLevel] = useState({
    enabled: true,
  });

  useEffect(() => {
    dispatch(getBusinessCustomerSettings()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (customerSettings) {
      setLoyaltyPoint({
        enabled: customerSettings.loyaltyPoint?.enabled ?? true,
        equivalentPoints: customerSettings.loyaltyPoint?.equivalentPoints?.toString() || "10",
      });
      setCustomerReview({
        enabled: customerSettings.customerReview?.enabled ?? true,
      });
      setCustomerLevel({
        enabled: customerSettings.customerLevel?.enabled ?? true,
      });
    }
  }, [customerSettings]);

  const handleSubmit = async (section: string, data: any) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const settings = {
        ...customerSettings,
        [section]: data,
      };
      const result = await dispatch(updateBusinessCustomerSettings(settings));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess(`${section} settings saved successfully!`);
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
          Unable to load customer settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Point Card - Larger */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Loyalty Point</h3>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Customer Can Earn Loyalty Point</label>
              <button
                onClick={() => {
                  const newValue = { ...loyaltyPoint, enabled: !loyaltyPoint.enabled };
                  setLoyaltyPoint(newValue);
                  handleSubmit("loyaltyPoint", newValue);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  loyaltyPoint.enabled ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    loyaltyPoint.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">₹ 1 Equivalent To Points</label>
              <input
                type="number"
                value={loyaltyPoint.equivalentPoints}
                onChange={(e) => setLoyaltyPoint({ ...loyaltyPoint, equivalentPoints: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSubmit("loyaltyPoint", loyaltyPoint)}
                disabled={isLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Two Cards */}
        <div className="space-y-6">
          {/* Customer Review */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Customer Review</h3>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                  i
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Customer Can Give Review A Driver</label>
              <button
                onClick={() => {
                  const newValue = { enabled: !customerReview.enabled };
                  setCustomerReview(newValue);
                  handleSubmit("customerReview", newValue);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customerReview.enabled ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customerReview.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Customer Level */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Customer Level</h3>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                  i
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/customer-levels")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to settings →
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">You Can ON/OFF Level Feature</label>
              <button
                onClick={() => {
                  const newValue = { enabled: !customerLevel.enabled };
                  setCustomerLevel(newValue);
                  handleSubmit("customerLevel", newValue);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customerLevel.enabled ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customerLevel.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

