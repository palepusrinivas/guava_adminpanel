"use client";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getTripFares,
  createTripFare,
  deleteTripFare,
} from "@/utils/reducers/adminReducers";
import type { TripFare, TripFarePayload } from "@/types/pricing";

// ✅ Validation schema
const fareValidationSchema: Yup.ObjectSchema<TripFarePayload> = Yup.object({
  zoneName: Yup.string()
    .transform((v) => v?.trim())
    .test(
      "zone-required",
      "Either Zone Name or Zone ID must be provided",
      function (value) {
        return Boolean(value || this.parent.zoneId);
      }
    ),
  zoneId: Yup.string()
    .transform((v) => v?.trim())
    .test(
      "zone-required",
      "Either Zone Name or Zone ID must be provided",
      function (value) {
        return Boolean(value || this.parent.zoneName);
      }
    ),

  vehicleCategoryId: Yup.string().transform((v) => v?.trim()),
  categoryType: Yup.string().transform((v) => v?.trim()),
  categoryName: Yup.string().transform((v) => v?.trim()),

  baseFare: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .required("Base fare is required")
    .min(0, "Base fare must be non-negative"),

  baseFarePerKm: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .required("Per km rate is required")
    .min(0, "Per km rate must be non-negative"),

  timeRatePerMinOverride: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Time rate must be non-negative")
    .nullable(),

  waitingFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Waiting fee must be non-negative")
    .nullable(),

  cancellationFeePercent: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Cancellation fee must be non-negative")
    .max(100, "Cancellation fee cannot exceed 100%")
    .nullable(),

  minCancellationFee: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Minimum cancellation fee must be non-negative")
    .nullable(),

  idleFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Idle fee must be non-negative")
    .nullable(),

  tripDelayFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Trip delay fee must be non-negative")
    .nullable(),

  penaltyFeeForCancel: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Penalty fee must be non-negative")
    .nullable(),

  feeAddToNext: Yup.number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0, "Additional fee must be non-negative")
    .nullable(),
}).test(
  "category-identifier",
  "One of Category ID, Type, or Name must be provided",
  (value) =>
    Boolean(
      value.vehicleCategoryId || value.categoryType || value.categoryName
    )
);

function TripFares() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((s) => s.admin);
  const [fares, setFares] = useState<TripFare[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchFares = async () => {
    setLoading(true);
    try {
      const response = await dispatch(getTripFares({ page, size }));
      if (getTripFares.fulfilled.match(response)) {
        const data: any = response.payload;
        const list = Array.isArray(data) ? data : data?.content || [];
        setFares(list);
      } else {
        toast.error(
          typeof response.payload === "string"
            ? response.payload
            : "Failed to fetch trip fares"
        );
      }
    } catch (err) {
      toast.error("Error fetching trip fares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFares();
  }, [page]);

  const formik = useFormik<TripFarePayload>({
    initialValues: {
      zoneName: "",
      zoneId: "",
      vehicleCategoryId: "",
      categoryType: "",
      categoryName: "",
      baseFare: 0,
      baseFarePerKm: 0,
      timeRatePerMinOverride: undefined,
      waitingFeePerMin: undefined,
      cancellationFeePercent: undefined,
      minCancellationFee: undefined,
      idleFeePerMin: undefined,
      tripDelayFeePerMin: undefined,
      penaltyFeeForCancel: undefined,
      feeAddToNext: undefined,
    },
    validationSchema: fareValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await dispatch(createTripFare(values));
        if (createTripFare.fulfilled.match(response)) {
          toast.success("Trip fare created");
          resetForm();
          fetchFares();
        } else {
          toast.error(
            typeof response.payload === "string"
              ? response.payload
              : "Failed to create fare"
          );
        }
      } catch (error) {
        toast.error("Error creating fare");
      }
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fare?")) return;
    try {
      const response = await dispatch(deleteTripFare(id));
      if (deleteTripFare.fulfilled.match(response)) {
        toast.success("Fare deleted");
        fetchFares();
      } else {
        toast.error(
          typeof response.payload === "string"
            ? response.payload
            : "Failed to delete fare"
        );
      }
    } catch (err) {
      toast.error("Error deleting fare");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Trip Fares by Vehicle Type
          </h2>
          <p className="text-gray-600 text-sm">
            Add and manage per-vehicle fares
          </p>
        </div>
      </div>

      {/* Add Fare Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zone Name
                </label>
                <input
                  name="zoneName"
                  value={formik.values.zoneName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Hyderabad-Central"
                />
                {formik.touched.zoneName && formik.errors.zoneName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.zoneName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Type
                </label>
                <input
                  name="categoryType"
                  value={formik.values.categoryType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., MEGA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base Fare (₹)
                </label>
                <input
                  type="number"
                  name="baseFare"
                  value={formik.values.baseFare}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.baseFare && formik.errors.baseFare && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.baseFare}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Per KM Rate (₹)
                </label>
                <input
                  type="number"
                  name="baseFarePerKm"
                  value={formik.values.baseFarePerKm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.baseFarePerKm && formik.errors.baseFarePerKm && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.baseFarePerKm}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Rate (₹/min)
                </label>
                <input
                  type="number"
                  name="timeRatePerMinOverride"
                  value={formik.values.timeRatePerMinOverride ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cancellation Fee (%)
                </label>
                <input
                  type="number"
                  name="cancellationFeePercent"
                  value={formik.values.cancellationFeePercent ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Fare
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fare List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Existing Fares
          </h3>
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per KM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per Min
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fares.map((f) => (
                    <tr key={f.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {f.zone?.name || f.zone?.id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {f.vehicleCategory?.type ||
                          f.vehicleCategory?.name ||
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{f.baseFare}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{f.baseFarePerKm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {f.timeRatePerMinOverride
                          ? `₹${f.timeRatePerMinOverride}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripFares;
