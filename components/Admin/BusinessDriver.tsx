"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessDriverSettings, updateBusinessDriverSettings } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

export default function BusinessDriver() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { driverSettings, isLoading, error } = useAppSelector((s) => s.business);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // State for each card
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    enabled: true,
    equivalentPoints: "10",
  });
  const [parcelLimit, setParcelLimit] = useState({
    enabled: true,
    limit: "2",
  });
  const [driverReview, setDriverReview] = useState({
    enabled: false,
  });
  const [driverLevel, setDriverLevel] = useState({
    enabled: true,
  });
  const [updateVehicle, setUpdateVehicle] = useState({
    enabled: true,
  });

  useEffect(() => {
    dispatch(getBusinessDriverSettings()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (driverSettings) {
      setLoyaltyPoints({
        enabled: driverSettings.loyaltyPoints?.enabled ?? true,
        equivalentPoints: driverSettings.loyaltyPoints?.equivalentPoints?.toString() || "10",
      });
      setParcelLimit({
        enabled: driverSettings.parcelLimit?.enabled ?? true,
        limit: driverSettings.parcelLimit?.limit?.toString() || "2",
      });
      setDriverReview({
        enabled: driverSettings.driverReview?.enabled ?? false,
      });
      setDriverLevel({
        enabled: driverSettings.driverLevel?.enabled ?? true,
      });
      setUpdateVehicle({
        enabled: driverSettings.updateVehicle?.enabled ?? true,
      });
    }
  }, [driverSettings]);

  const handleSubmit = async (section: string, data: any) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const settings = {
        ...driverSettings,
        [section]: data,
      };
      const result = await dispatch(updateBusinessDriverSettings(settings));
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
          Unable to load driver settings from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      {/* Driver Can Earn Loyalty Point */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">Driver Can Earn Loyalty Point</h3>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
              i
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Driver Can Earn Loyalty Point</label>
            <button
              onClick={() => {
                const newValue = { ...loyaltyPoints, enabled: !loyaltyPoints.enabled };
                setLoyaltyPoints(newValue);
                handleSubmit("loyaltyPoints", newValue);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loyaltyPoints.enabled ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  loyaltyPoints.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">₹ 1 Equivalent To Points</label>
            <input
              type="number"
              value={loyaltyPoints.equivalentPoints}
              onChange={(e) => setLoyaltyPoints({ ...loyaltyPoints, equivalentPoints: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSubmit("loyaltyPoints", loyaltyPoints)}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      {/* Driver Parcel Limit Setup */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">Driver Parcel Limit Setup</h3>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
              i
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Max. Parcel Req. Accept Limit</label>
            <button
              onClick={() => {
                const newValue = { ...parcelLimit, enabled: !parcelLimit.enabled };
                setParcelLimit(newValue);
                handleSubmit("parcelLimit", newValue);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                parcelLimit.enabled ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  parcelLimit.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <input
              type="number"
              value={parcelLimit.limit}
              onChange={(e) => setParcelLimit({ ...parcelLimit, limit: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSubmit("parcelLimit", parcelLimit)}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      {/* Driver Review */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">Driver Review</h3>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
              i
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Driver Can Review Customer</label>
          <button
            onClick={() => {
              const newValue = { enabled: !driverReview.enabled };
              setDriverReview(newValue);
              handleSubmit("driverReview", newValue);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              driverReview.enabled ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                driverReview.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Driver Level */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">Driver Level</h3>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
              i
            </div>
          </div>
          <button
            onClick={() => router.push("/admin/driver-levels")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to settings →
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Active Level Feature</label>
          <button
            onClick={() => {
              const newValue = { enabled: !driverLevel.enabled };
              setDriverLevel(newValue);
              handleSubmit("driverLevel", newValue);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              driverLevel.enabled ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                driverLevel.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Update Vehicle */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900">Update Vehicle</h3>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
              i
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          When Driver Update A Existing Vehicle Which Info Need Admin Approval.
        </p>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Update Vehicle Approval Required</label>
          <button
            onClick={() => {
              const newValue = { enabled: !updateVehicle.enabled };
              setUpdateVehicle(newValue);
              handleSubmit("updateVehicle", newValue);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              updateVehicle.enabled ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                updateVehicle.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

