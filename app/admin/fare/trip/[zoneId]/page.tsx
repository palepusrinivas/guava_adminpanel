"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiUrl, getAuthToken } from "@/utils/config";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getTripFares,
  createTripFare,
  deleteTripFare,
  getVehicleCategories,
} from "@/utils/reducers/adminReducers";
import { Autocomplete, TextField } from "@mui/material";
import * as Yup from "yup";
import { useFormik } from "formik";
import type { TripFarePayload } from "@/types/pricing";

interface TripFare {
  id: string;
  zone?: { id: string | number; name: string };
  vehicleCategory?: { id: string; name: string; type: string };
  baseFare: number;
  baseFarePerKm: number;
  timeRatePerMinOverride?: number;
  waitingFeePerMin?: number;
  cancellationFeePercent?: number;
  minCancellationFee?: number;
  idleFeePerMin?: number;
  tripDelayFeePerMin?: number;
  penaltyFeeForCancel?: number;
  feeAddToNext?: number;
}

const fareValidationSchema: Yup.ObjectSchema<TripFarePayload> = Yup.object({
  zoneId: Yup.string().required("Zone ID is required"),
  vehicleCategoryId: Yup.string()
    .transform((v) => v?.trim())
    .test(
      "category-required",
      "Vehicle category is required",
      function (value) {
        return Boolean(value || this.parent.categoryType || this.parent.categoryName);
      }
    ),
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
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Time rate must be non-negative")
    .optional(),
  waitingFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Waiting fee must be non-negative")
    .optional(),
  cancellationFeePercent: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Cancellation fee must be non-negative")
    .max(100, "Cancellation fee cannot exceed 100%")
    .optional(),
  minCancellationFee: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Minimum cancellation fee must be non-negative")
    .optional(),
  idleFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Idle fee must be non-negative")
    .optional(),
  tripDelayFeePerMin: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Trip delay fee must be non-negative")
    .optional(),
  penaltyFeeForCancel: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Penalty fee must be non-negative")
    .optional(),
  feeAddToNext: Yup.number()
    .transform((v) => (isNaN(v) || v === null || v === undefined ? undefined : v))
    .min(0, "Additional fee must be non-negative")
    .optional(),
}).test(
  "category-identifier",
  "One of Category ID, Type, or Name must be provided",
  (value) =>
    Boolean(
      value.vehicleCategoryId || value.categoryType || value.categoryName
    )
);

export default function ZoneFareSetupPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const zoneId = params?.zoneId as string;
  
  const { categories: vehicleCategories } = useAppSelector((s) => s.vehicle);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState<string>("");
  const [fares, setFares] = useState<TripFare[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFare, setEditingFare] = useState<TripFare | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch vehicle categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        await dispatch(getVehicleCategories()).unwrap();
      } catch (error: any) {
        // Silently handle error - categories dropdown will just be empty
        console.warn("Failed to fetch vehicle categories:", error?.message || error);
        // Don't show toast error as this is not critical for the form to work
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (zoneId) {
      fetchZoneFareSetup();
    }
  }, [zoneId, dispatch]);

  const fetchZoneFareSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      // Fetch zone details
      const zoneResponse = await fetch(
        getApiUrl(`/api/admin/zones/operation/${zoneId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!zoneResponse.ok) {
        throw new Error("Failed to fetch zone details");
      }

      const zone = await zoneResponse.json();
      setZoneName(zone.name || `Zone ${zoneId}`);

      // Fetch trip fares for this zone
      const response = await dispatch(getTripFares({ page: 0, size: 100 }));
      if (getTripFares.fulfilled.match(response)) {
        const data: any = response.payload;
        const allFares = Array.isArray(data) ? data : data?.content || [];
        // Filter fares for this zone
        const zoneFares = allFares.filter((fare: any) => 
          fare.zone?.id?.toString() === zoneId || 
          fare.zoneId?.toString() === zoneId
        );
        setFares(zoneFares);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load fare setup");
      toast.error(err.message || "Failed to load fare setup");
    } finally {
      setLoading(false);
    }
  };

  // Prepare vehicle categories for Autocomplete
  const categoryOptions = useMemo(() => {
    if (!vehicleCategories || vehicleCategories.length === 0) return [];
    
    return vehicleCategories.map((category: any) => {
      const categoryName = category.name || category.type || category.categoryName || `Category ${category.id}`;
      const categoryType = category.type || category.name || category.categoryName || "";
      
      return {
        id: category.id?.toString() || "",
        name: categoryName,
        type: categoryType,
        label: categoryType ? `${categoryType} (${categoryName})` : categoryName,
      };
    });
  }, [vehicleCategories]);

  const formik = useFormik<TripFarePayload>({
    initialValues: {
      zoneId: zoneId,
      zoneName: "",
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
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await dispatch(createTripFare(values));
        if (createTripFare.fulfilled.match(response)) {
          toast.success(editingFare ? "Fare updated successfully" : "Trip fare created");
          resetForm();
          setShowAddForm(false);
          setEditingFare(null);
          fetchZoneFareSetup();
        } else {
          toast.error(
            typeof response.payload === "string"
              ? response.payload
              : "Failed to save fare"
          );
        }
      } catch (error) {
        toast.error("Error saving fare");
      }
    },
  });

  const handleEdit = (fare: TripFare) => {
    setEditingFare(fare);
    setShowAddForm(true);
    formik.setValues({
      zoneId: zoneId,
      zoneName: "",
      vehicleCategoryId: fare.vehicleCategory?.id || "",
      categoryType: fare.vehicleCategory?.type || "",
      categoryName: fare.vehicleCategory?.name || "",
      baseFare: fare.baseFare || 0,
      baseFarePerKm: fare.baseFarePerKm || 0,
      timeRatePerMinOverride: fare.timeRatePerMinOverride,
      waitingFeePerMin: fare.waitingFeePerMin,
      cancellationFeePercent: fare.cancellationFeePercent,
      minCancellationFee: fare.minCancellationFee,
      idleFeePerMin: fare.idleFeePerMin,
      tripDelayFeePerMin: fare.tripDelayFeePerMin,
      penaltyFeeForCancel: fare.penaltyFeeForCancel,
      feeAddToNext: fare.feeAddToNext,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fare?")) return;
    try {
      const response = await dispatch(deleteTripFare(id));
      if (deleteTripFare.fulfilled.match(response)) {
        toast.success("Fare deleted");
        fetchZoneFareSetup();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-2"
          >
            ← Back to Fare Setup
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Fare Setup - {zoneName || `Zone ${zoneId}`}
          </h1>
        </div>
      </div>

      {/* Zone Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Zone Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-sm">Zone ID</label>
            <p className="font-medium">{zoneId}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Zone Name</label>
            <p className="font-medium">{zoneName || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Fare Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingFare ? "Edit Fare" : "Add New Fare"}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingFare(null);
                formik.resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Category
                </label>
                <Autocomplete
                  options={categoryOptions}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : option.label || option.type || option.name || ""
                  }
                  value={
                    categoryOptions.find(
                      (c) => c.id === formik.values.vehicleCategoryId ||
                            c.type === formik.values.categoryType ||
                            c.name === formik.values.categoryName
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue("categoryType", newValue.type || newValue.name);
                      formik.setFieldValue("vehicleCategoryId", newValue.id);
                      formik.setFieldValue("categoryName", newValue.name);
                    } else {
                      formik.setFieldValue("categoryType", "");
                      formik.setFieldValue("vehicleCategoryId", "");
                      formik.setFieldValue("categoryName", "");
                    }
                  }}
                  onBlur={() => formik.setFieldTouched("vehicleCategoryId", true)}
                  loading={categoriesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select category..."
                      size="small"
                      error={formik.touched.vehicleCategoryId && Boolean(formik.errors.vehicleCategoryId)}
                      helperText={formik.touched.vehicleCategoryId && formik.errors.vehicleCategoryId}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <p className="mt-1 text-sm text-red-600">{formik.errors.baseFare}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <p className="mt-1 text-sm text-red-600">{formik.errors.baseFarePerKm}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFare(null);
                  formik.resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                {editingFare ? "Update Fare" : "Add Fare"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fare Rules */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Fare Rules</h2>
          <button
            onClick={() => {
              setEditingFare(null);
              formik.resetForm();
              formik.setFieldValue("zoneId", zoneId);
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            + Add Fare
          </button>
        </div>

        {fares.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No fare rules have been set up for this zone yet.</p>
            <button
              onClick={() => {
                setEditingFare(null);
                formik.resetForm();
                formik.setFieldValue("zoneId", zoneId);
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add First Fare Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Fare (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Per Km (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Per Min (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancellation Fee (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fares.map((fare) => (
                  <tr key={fare.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fare.vehicleCategory?.type || fare.vehicleCategory?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{fare.baseFare?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{fare.baseFarePerKm?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fare.timeRatePerMinOverride ? `₹${fare.timeRatePerMinOverride.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fare.cancellationFeePercent ? `${fare.cancellationFeePercent}%` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(fare)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fare.id)}
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
  );
}

