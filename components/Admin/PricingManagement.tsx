"use client";
import React, { useState } from "react";
import { useAppSelector } from "@/utils/store/store";
import { useFormik } from "formik";
import * as yup from "yup";

interface PricingManagementProps {
  onUpdatePricing: (pricingData: any) => void;
}

const pricingValidationSchema = yup.object({
  baseFare: yup.number().min(0, "Base fare must be positive").required("Base fare is required"),
  perKmRate: yup.number().min(0, "Per km rate must be positive").required("Per km rate is required"),
  perMinuteRate: yup.number().min(0, "Per minute rate must be positive").required("Per minute rate is required"),
  minimumFare: yup.number().min(0, "Minimum fare must be positive").required("Minimum fare is required"),
  surgeMultiplier: yup.number().min(1, "Surge multiplier must be at least 1").required("Surge multiplier is required"),
  cancellationFee: yup.number().min(0, "Cancellation fee must be positive").required("Cancellation fee is required"),
});

function PricingManagement({ onUpdatePricing }: PricingManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { admin } = useAppSelector((state) => state.admin);

  // Sample pricing data - replace with actual data from Redux store
  const currentPricing = {
    baseFare: 25,
    perKmRate: 12,
    perMinuteRate: 2,
    minimumFare: 30,
    surgeMultiplier: 1.5,
    cancellationFee: 10,
  };

  const formik = useFormik({
    initialValues: currentPricing,
    validationSchema: pricingValidationSchema,
    onSubmit: (values) => {
      onUpdatePricing(values);
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    formik.setValues(currentPricing);
  };

  const handleCancel = () => {
    setIsEditing(false);
    formik.resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Configure ride pricing and fees</p>
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
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Fare (₹)
                </label>
                <input
                  type="number"
                  name="baseFare"
                  value={formik.values.baseFare}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.baseFare && formik.errors.baseFare && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.baseFare}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Fixed amount charged for each ride</p>
              </div>

              {/* Per KM Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per KM Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="perKmRate"
                  value={formik.values.perKmRate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.perKmRate && formik.errors.perKmRate && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.perKmRate}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Rate charged per kilometer</p>
              </div>

              {/* Per Minute Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per Minute Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="perMinuteRate"
                  value={formik.values.perMinuteRate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.perMinuteRate && formik.errors.perMinuteRate && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.perMinuteRate}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Rate charged per minute of ride time</p>
              </div>

              {/* Minimum Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Fare (₹)
                </label>
                <input
                  type="number"
                  name="minimumFare"
                  value={formik.values.minimumFare}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.minimumFare && formik.errors.minimumFare && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.minimumFare}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Minimum amount charged regardless of distance</p>
              </div>

              {/* Surge Multiplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surge Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="surgeMultiplier"
                  value={formik.values.surgeMultiplier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.surgeMultiplier && formik.errors.surgeMultiplier && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.surgeMultiplier}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Multiplier applied during peak hours</p>
              </div>

              {/* Cancellation Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Fee (₹)
                </label>
                <input
                  type="number"
                  name="cancellationFee"
                  value={formik.values.cancellationFee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
                {formik.touched.cancellationFee && formik.errors.cancellationFee && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.cancellationFee}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Fee charged for ride cancellations</p>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Base Fare</div>
              <div className="text-2xl font-bold text-blue-600">₹{currentPricing.baseFare}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">Per KM</div>
              <div className="text-2xl font-bold text-green-600">₹{currentPricing.perKmRate}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">Per Minute</div>
              <div className="text-2xl font-bold text-yellow-600">₹{currentPricing.perMinuteRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rules */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Rules</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Base Fare:</strong> Fixed amount charged for each ride, regardless of distance.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Distance Charge:</strong> Additional amount based on total distance traveled.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Time Charge:</strong> Additional amount based on total ride duration.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Surge Pricing:</strong> Multiplier applied during peak hours or high demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingManagement;
