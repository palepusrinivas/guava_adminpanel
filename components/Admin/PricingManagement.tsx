"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import { getPricing, updatePricing } from "@/utils/slices/adminSlice";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";

interface PricingManagementProps {
  onUpdatePricing?: (pricingData: any) => void;
}

interface PricingConfig {
  // Auto
  autoBaseFare?: number | null;
  autoPerKmFare?: number | null;
  autoNightSurchargePercent?: number | null;
  autoPlatformFeeFlat?: number | null;
  
  // Bike
  bikeCommissionPercent?: number | null;
  bikeNightSurchargePercent?: number | null;
  
  // Car
  carCommissionPercent?: number | null;
  carNightSurchargePercent?: number | null;
  
  // Common
  gstPercent?: number | null;
  firstRideCashbackPercent?: number | null;
  walletUsageCapPercent?: number | null;
  walletCreditValidityDays?: number | null;
  
  // Night window
  nightStartHour?: number | null;
  nightEndHour?: number | null;
  
  // Payouts
  minPayoutAmount?: number | null;
  payoutFeeFlat?: number | null;
  payoutFeePercent?: number | null;
}

const pricingValidationSchema = yup.object({
  // Auto
  autoBaseFare: yup.number().min(0, "Must be positive").nullable(),
  autoPerKmFare: yup.number().min(0, "Must be positive").nullable(),
  autoNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  autoPlatformFeeFlat: yup.number().min(0, "Must be positive").nullable(),
  
  // Bike
  bikeCommissionPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  bikeNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  
  // Car
  carCommissionPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  carNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  
  // Common
  gstPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  firstRideCashbackPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  walletUsageCapPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  walletCreditValidityDays: yup.number().min(0, "Must be positive").nullable(),
  
  // Night window
  nightStartHour: yup.number().min(0).max(23, "Must be 0-23").nullable(),
  nightEndHour: yup.number().min(0).max(23, "Must be 0-23").nullable(),
  
  // Payouts
  minPayoutAmount: yup.number().min(0, "Must be positive").nullable(),
  payoutFeeFlat: yup.number().min(0, "Must be positive").nullable(),
  payoutFeePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
});

function PricingManagement({ onUpdatePricing }: PricingManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.admin);
  
  // Get pricing from Redux store
  const pricingState = useAppSelector((state: any) => state.admin?.pricing);
  const pricingLoading = useAppSelector((state: any) => state.admin?.pricingLoading);
  
  // Fetch pricing on mount
  useEffect(() => {
    if (!pricingState && !pricingLoading) {
      dispatch(getPricing());
    }
  }, [dispatch, pricingState, pricingLoading]);
  
  // Default pricing data structure matching backend
  const defaultPricing: PricingConfig = {
    autoBaseFare: null,
    autoPerKmFare: null,
    autoNightSurchargePercent: null,
    autoPlatformFeeFlat: null,
    bikeCommissionPercent: null,
    bikeNightSurchargePercent: null,
    carCommissionPercent: null,
    carNightSurchargePercent: null,
    gstPercent: null,
    firstRideCashbackPercent: null,
    walletUsageCapPercent: null,
    walletCreditValidityDays: null,
    nightStartHour: 22,
    nightEndHour: 6,
    minPayoutAmount: null,
    payoutFeeFlat: null,
    payoutFeePercent: null,
  };

  // Use pricing from store or default
  const currentPricing: PricingConfig = pricingState || defaultPricing;

  const formik = useFormik({
    initialValues: currentPricing,
    validationSchema: pricingValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Convert empty strings to null for backend
        const cleanedValues: any = {};
        Object.keys(values).forEach((key) => {
          const value = (values as any)[key];
          cleanedValues[key] = value === "" || value === undefined ? null : value;
        });
        
        // Use provided callback or dispatch directly
        if (onUpdatePricing) {
          await onUpdatePricing(cleanedValues);
        } else {
          const result = await dispatch(updatePricing(cleanedValues));
          if (updatePricing.fulfilled.match(result)) {
            toast.success("Pricing updated successfully");
          } else {
            toast.error("Failed to update pricing");
          }
        }
        setIsEditing(false);
      } catch (error: any) {
        toast.error(`Failed to update pricing: ${error.message || error}`);
      }
    },
  });

  // Update form values when pricing data changes
  useEffect(() => {
    if (currentPricing && !isEditing) {
      formik.setValues(currentPricing);
    }
  }, [currentPricing]);

  const handleEdit = () => {
    setIsEditing(true);
    formik.setValues(currentPricing);
  };

  const handleCancel = () => {
    setIsEditing(false);
    formik.resetForm();
    formik.setValues(currentPricing);
  };

  if (pricingLoading && !pricingState) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Configure ride pricing, fees, and commissions</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit Pricing
          </button>
        )}
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Auto/Rickshaw Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">🛺 Auto/Rickshaw Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    name="autoBaseFare"
                    value={formik.values.autoBaseFare || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 50"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.autoBaseFare && formik.errors.autoBaseFare && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.autoBaseFare}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Fixed base fare for auto rides</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Per KM Fare (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="autoPerKmFare"
                    value={formik.values.autoPerKmFare || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 15"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.autoPerKmFare && formik.errors.autoPerKmFare && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.autoPerKmFare}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Rate per kilometer for auto rides</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Night Surcharge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="autoNightSurchargePercent"
                    value={formik.values.autoNightSurchargePercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 15"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.autoNightSurchargePercent && formik.errors.autoNightSurchargePercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.autoNightSurchargePercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Percentage surcharge during night hours</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Platform Fee (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="autoPlatformFeeFlat"
                    value={formik.values.autoPlatformFeeFlat || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 7"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.autoPlatformFeeFlat && formik.errors.autoPlatformFeeFlat && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.autoPlatformFeeFlat}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Flat platform fee for auto rides</p>
                </div>
              </div>
            </div>

            {/* Bike Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">🏍️ Bike Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bike Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="bikeCommissionPercent"
                    value={formik.values.bikeCommissionPercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 7"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.bikeCommissionPercent && formik.errors.bikeCommissionPercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.bikeCommissionPercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Commission percentage for bike rides</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bike Night Surcharge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="bikeNightSurchargePercent"
                    value={formik.values.bikeNightSurchargePercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 15"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.bikeNightSurchargePercent && formik.errors.bikeNightSurchargePercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.bikeNightSurchargePercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Percentage surcharge during night hours</p>
                </div>
              </div>
            </div>

            {/* Car Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">🚗 Car Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="carCommissionPercent"
                    value={formik.values.carCommissionPercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 7"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.carCommissionPercent && formik.errors.carCommissionPercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.carCommissionPercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Commission percentage for car rides</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Night Surcharge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="carNightSurchargePercent"
                    value={formik.values.carNightSurchargePercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 15"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.carNightSurchargePercent && formik.errors.carNightSurchargePercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.carNightSurchargePercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Percentage surcharge during night hours</p>
                </div>
              </div>
            </div>

            {/* Common Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">⚙️ Common Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="gstPercent"
                    value={formik.values.gstPercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 5"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.gstPercent && formik.errors.gstPercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.gstPercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">GST percentage applied to rides</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Ride Cashback (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="firstRideCashbackPercent"
                    value={formik.values.firstRideCashbackPercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 20"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.firstRideCashbackPercent && formik.errors.firstRideCashbackPercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.firstRideCashbackPercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Cashback percentage for first ride</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Usage Cap (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="walletUsageCapPercent"
                    value={formik.values.walletUsageCapPercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 10"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.walletUsageCapPercent && formik.errors.walletUsageCapPercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.walletUsageCapPercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Maximum wallet usage percentage per ride</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Credit Validity (Days)
                  </label>
                  <input
                    type="number"
                    name="walletCreditValidityDays"
                    value={formik.values.walletCreditValidityDays || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 7"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.walletCreditValidityDays && formik.errors.walletCreditValidityDays && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.walletCreditValidityDays}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Validity period for wallet credits</p>
                </div>
              </div>
            </div>

            {/* Night Window Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">🌙 Night Window Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Night Start Hour (24-hour format)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    name="nightStartHour"
                    value={formik.values.nightStartHour || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 22"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.nightStartHour && formik.errors.nightStartHour && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.nightStartHour}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Hour when night surcharge starts (0-23)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Night End Hour (24-hour format)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    name="nightEndHour"
                    value={formik.values.nightEndHour || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 6"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.nightEndHour && formik.errors.nightEndHour && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.nightEndHour}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Hour when night surcharge ends (0-23)</p>
                </div>
              </div>
            </div>

            {/* Payout Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">💳 Payout Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Payout Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="minPayoutAmount"
                    value={formik.values.minPayoutAmount || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 100"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.minPayoutAmount && formik.errors.minPayoutAmount && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.minPayoutAmount}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Minimum amount required for payout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Fee (Flat ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="payoutFeeFlat"
                    value={formik.values.payoutFeeFlat || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 0"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.payoutFeeFlat && formik.errors.payoutFeeFlat && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.payoutFeeFlat}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Flat fee charged per payout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="payoutFeePercent"
                    value={formik.values.payoutFeePercent || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    placeholder="e.g., 0"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? "bg-gray-50" : ""
                    }`}
                  />
                  {formik.touched.payoutFeePercent && formik.errors.payoutFeePercent && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.payoutFeePercent}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Percentage fee charged per payout</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pricingLoading}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {pricingLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Auto Base Fare</div>
              <div className="text-2xl font-bold text-blue-600">₹{currentPricing.autoBaseFare || "N/A"}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">GST</div>
              <div className="text-2xl font-bold text-green-600">{currentPricing.gstPercent || "N/A"}%</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">Bike Commission</div>
              <div className="text-2xl font-bold text-yellow-600">{currentPricing.bikeCommissionPercent || "N/A"}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-900">Car Commission</div>
              <div className="text-2xl font-bold text-purple-600">{currentPricing.carCommissionPercent || "N/A"}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingManagement;
