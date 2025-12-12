"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getIntercityPricingConfig,
  updateIntercityPricingConfig,
} from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import type { IntercityPricingConfig } from "@/utils/slices/intercitySlice";

export default function IntercityPricingPage() {
  const dispatch = useAppDispatch();
  const { pricingConfig, isLoading, error } = useAppSelector((state) => state.intercity);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Partial<IntercityPricingConfig>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(getIntercityPricingConfig());
    }
  }, [dispatch, mounted]);

  useEffect(() => {
    if (pricingConfig) {
      setFormData({
        commissionPercent: pricingConfig.commissionPercent,
        platformFeePercent: pricingConfig.platformFeePercent,
        gstPercent: pricingConfig.gstPercent,
        minCommissionAmount: pricingConfig.minCommissionAmount,
        maxCommissionAmount: pricingConfig.maxCommissionAmount,
        nightFareMultiplier: pricingConfig.nightFareMultiplier,
        defaultRoutePriceMultiplier: pricingConfig.defaultRoutePriceMultiplier,
        commissionEnabled: pricingConfig.commissionEnabled,
        nightFareEnabled: pricingConfig.nightFareEnabled,
        nightFareStartHour: pricingConfig.nightFareStartHour,
        nightFareEndHour: pricingConfig.nightFareEndHour,
      });
    }
  }, [pricingConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await dispatch(updateIntercityPricingConfig(formData));
      if (updateIntercityPricingConfig.fulfilled.match(result)) {
        toast.success("Pricing configuration updated successfully!");
      } else {
        toast.error(result.payload as string || "Failed to update pricing configuration");
      }
    } catch (error) {
      toast.error("An error occurred while updating pricing configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof IntercityPricingConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Intercity Pricing Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage commission percentages, pricing multipliers, and other intercity pricing settings
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Commission Settings */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionPercent ?? ""}
                    onChange={(e) => handleChange("commissionPercent", parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Commission percentage charged on intercity bookings (e.g., 5.00 for 5%)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Enabled
                  </label>
                  <select
                    value={formData.commissionEnabled ? "true" : "false"}
                    onChange={(e) => handleChange("commissionEnabled", e.target.value === "true")}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Commission Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minCommissionAmount ?? ""}
                    onChange={(e) => handleChange("minCommissionAmount", parseFloat(e.target.value) || undefined)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Commission Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxCommissionAmount ?? ""}
                    onChange={(e) => handleChange("maxCommissionAmount", parseFloat(e.target.value) || undefined)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Additional Fees */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Fees</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.platformFeePercent ?? ""}
                    onChange={(e) => handleChange("platformFeePercent", parseFloat(e.target.value) || undefined)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.gstPercent ?? ""}
                    onChange={(e) => handleChange("gstPercent", parseFloat(e.target.value) || undefined)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Night Fare Settings */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Night Fare Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Night Fare Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="3.0"
                    value={formData.nightFareMultiplier ?? ""}
                    onChange={(e) => handleChange("nightFareMultiplier", parseFloat(e.target.value) || 1.0)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Multiplier for night fares (e.g., 1.20 for 20% extra)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Night Fare Enabled
                  </label>
                  <select
                    value={formData.nightFareEnabled ? "true" : "false"}
                    onChange={(e) => handleChange("nightFareEnabled", e.target.value === "true")}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Night Fare Start Hour (24-hour format)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.nightFareStartHour ?? ""}
                    onChange={(e) => handleChange("nightFareStartHour", parseInt(e.target.value) || 22)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">e.g., 22 for 10 PM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Night Fare End Hour (24-hour format)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.nightFareEndHour ?? ""}
                    onChange={(e) => handleChange("nightFareEndHour", parseInt(e.target.value) || 6)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">e.g., 6 for 6 AM</p>
                </div>
              </div>
            </div>

            {/* Route Pricing */}
            <div className="pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Pricing</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Route Price Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="10.0"
                  value={formData.defaultRoutePriceMultiplier ?? ""}
                  onChange={(e) => handleChange("defaultRoutePriceMultiplier", parseFloat(e.target.value) || 1.0)}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Default multiplier for routes (1.0 = use base vehicle price, 1.2 = 20% increase)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (pricingConfig) {
                    setFormData({
                      commissionPercent: pricingConfig.commissionPercent,
                      platformFeePercent: pricingConfig.platformFeePercent,
                      gstPercent: pricingConfig.gstPercent,
                      minCommissionAmount: pricingConfig.minCommissionAmount,
                      maxCommissionAmount: pricingConfig.maxCommissionAmount,
                      nightFareMultiplier: pricingConfig.nightFareMultiplier,
                      defaultRoutePriceMultiplier: pricingConfig.defaultRoutePriceMultiplier,
                      commissionEnabled: pricingConfig.commissionEnabled,
                      nightFareEnabled: pricingConfig.nightFareEnabled,
                      nightFareStartHour: pricingConfig.nightFareStartHour,
                      nightFareEndHour: pricingConfig.nightFareEndHour,
                    });
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading || isSaving}
                className="px-6 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
