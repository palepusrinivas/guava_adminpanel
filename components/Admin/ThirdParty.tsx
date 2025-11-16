"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getThirdPartyConfiguration,
  updateThirdPartyConfiguration,
} from "@/utils/reducers/adminReducers";

export default function ThirdParty() {
  const dispatch = useAppDispatch();
  const { thirdPartyConfiguration, isLoading, error } = useAppSelector((s) => s.notification);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    paymentGateway: "",
    smsProvider: "",
    emailProvider: "",
    mapProvider: "",
  });

  useEffect(() => {
    dispatch(getThirdPartyConfiguration()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (thirdPartyConfiguration) {
      setConfig(thirdPartyConfiguration);
    }
  }, [thirdPartyConfiguration]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const result = await dispatch(updateThirdPartyConfiguration(config));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Third party configuration saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save. Ensure backend API is ready.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">3rd Party Configuration</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load third party configuration from server. Displaying sample form. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Configure Third Party Services</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
            <input
              type="text"
              value={config.paymentGateway}
              onChange={(e) => setConfig({ ...config, paymentGateway: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter payment gateway configuration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
            <input
              type="text"
              value={config.smsProvider}
              onChange={(e) => setConfig({ ...config, smsProvider: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter SMS provider configuration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
            <input
              type="text"
              value={config.emailProvider}
              onChange={(e) => setConfig({ ...config, emailProvider: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter email provider configuration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Map Provider</label>
            <input
              type="text"
              value={config.mapProvider}
              onChange={(e) => setConfig({ ...config, mapProvider: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter map provider configuration"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

