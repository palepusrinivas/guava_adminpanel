"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getParcelWeights,
  createParcelWeight,
  updateParcelWeight,
} from "@/utils/reducers/adminReducers";
import { setWeightFilter, setWeightSearchQuery } from "@/utils/slices/parcelSlice";

const schema = yup.object({
  minimumWeight: yup.number().positive("Minimum weight must be positive").required("Minimum weight is required"),
  maximumWeight: yup
    .number()
    .positive("Maximum weight must be positive")
    .required("Maximum weight is required")
    .test("max-greater-than-min", "Maximum weight must be greater than minimum weight", function (value) {
      return value > (this.parent.minimumWeight || 0);
    }),
});

export default function ParcelWeight() {
  const dispatch = useAppDispatch();
  const { weights, isLoading, error, weightFilter, weightSearchQuery } = useAppSelector((s) => s.parcel);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getParcelWeights()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      minimumWeight: "",
      maximumWeight: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const weightData = {
          minimumWeight: Number(values.minimumWeight),
          maximumWeight: Number(values.maximumWeight),
          active: true,
        };
        const result = await dispatch(createParcelWeight(weightData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Weight range created successfully!");
          formik.resetForm();
          dispatch(getParcelWeights());
        } else {
          throw new Error((result as any).payload || "Failed to create weight range");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create weight range. Ensure backend API is ready.");
      }
    },
  });

  const filtered = useMemo(() => {
    const base = weights.filter((w) => {
      if (weightFilter === "active") return w.active;
      if (weightFilter === "inactive") return !w.active;
      return true;
    });
    if (!weightSearchQuery) return base;
    const q = weightSearchQuery.toLowerCase();
    return base.filter(
      (w) =>
        `${w.minimumWeight}-${w.maximumWeight}`.toLowerCase().includes(q) ||
        `kg`.toLowerCase().includes(q)
    );
  }, [weights, weightFilter, weightSearchQuery]);

  const handleToggleStatus = async (weight: any) => {
    await dispatch(updateParcelWeight({ weightId: String(weight.id), weightData: { active: !weight.active } }));
    dispatch(getParcelWeights());
  };

  return (
    <div className="space-y-6">
      {/* Add Weight Range Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ADD WEIGHT RANGE</h2>
          {submitSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
          )}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Weight (Kg)</label>
                <input
                  name="minimumWeight"
                  type="number"
                  step="0.01"
                  value={formik.values.minimumWeight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: Minimum Weight"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.minimumWeight && formik.errors.minimumWeight && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.minimumWeight}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Weight (Kg)</label>
                <input
                  name="maximumWeight"
                  type="number"
                  step="0.01"
                  value={formik.values.maximumWeight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: Maximum Weight"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {formik.touched.maximumWeight && formik.errors.maximumWeight && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.maximumWeight}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Weight Range List Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="bg-teal-500 rounded-t-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Weight Range List</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => dispatch(setWeightFilter("all"))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    weightFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => dispatch(setWeightFilter("active"))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    weightFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => dispatch(setWeightFilter("inactive"))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    weightFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Inactive
                </button>
              </div>
              <div className="text-sm text-white">Total Parcel Weight Ranges: {weights.length}</div>
              <button className="p-2 text-white hover:bg-teal-600 rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative w-full">
                <input
                  value={weightSearchQuery}
                  onChange={(e) => dispatch(setWeightSearchQuery(e.target.value))}
                  placeholder='Search here by Parcel "'
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Search</button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
              Unable to load parcel weights from server. Ensure backend endpoints are implemented. Error: {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">SL</th>
                  <th className="px-4 py-3 text-left">Parcel Weight Range</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(isLoading ? [] : filtered).map((weight, idx) => (
                  <tr key={weight.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {weight.minimumWeight} - {weight.maximumWeight} Kg
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(weight)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          weight.active ? "bg-teal-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            weight.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={4}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-500 text-lg">No data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

