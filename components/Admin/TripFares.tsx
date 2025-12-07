"use client";
import React, { useEffect, useState, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getTripFares,
  createTripFare,
  deleteTripFare,
  getOperationZones,
  getVehicleCategories,
} from "@/utils/reducers/adminReducers";
import type { TripFare, TripFarePayload } from "@/types/pricing";
import { Autocomplete, TextField } from "@mui/material";

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

function TripFares() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((s) => s.admin);
  const { operationZones } = useAppSelector((s) => s.tripFare);
  const { categories: vehicleCategories } = useAppSelector((s) => s.vehicle);
  const [fares, setFares] = useState<TripFare[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

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

  // Fetch zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      setZonesLoading(true);
      try {
        await dispatch(getOperationZones()).unwrap();
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setZonesLoading(false);
      }
    };
    fetchZones();
  }, [dispatch]);

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

  // Prepare zones for Autocomplete
  const zoneOptions = useMemo(() => {
    if (!operationZones || operationZones.length === 0) return [];
    
    return operationZones.map((zone: any) => {
      const zoneId = zone.id?.toString() || "";
      const zoneName = zone.name || `Zone ${zone.id}`;
      // Check if ID is numeric (old Zone model) or UUID (new ZoneV2 model)
      const isNumericId = zoneId && !isNaN(Number(zoneId)) && !zoneId.includes('-');
      
      return {
        id: zoneId,
        name: zoneName,
        label: `${zoneName}${isNumericId ? ' (Use name)' : ''}`,
        isNumericId, // Flag to indicate if this is a numeric ID
      };
    });
  }, [operationZones]);

  // Prepare vehicle categories for Autocomplete
  const categoryOptions = useMemo(() => {
    if (!vehicleCategories || vehicleCategories.length === 0) return [];
    
    return vehicleCategories.map((category: any) => {
      // Category can have name, type, or categoryName field
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
        // Clean the payload: remove numeric zoneId (old Zone model uses numeric IDs)
        // TripFare uses ZoneV2 which requires UUID strings or zoneName
        const payload: TripFarePayload = { ...values };
        
        // If zoneId is numeric (not a UUID), remove it and rely on zoneName
        if (payload.zoneId) {
          const zoneIdStr = payload.zoneId.toString();
          // UUID format: 36 characters with hyphens (e.g., "550e8400-e29b-41d4-a716-446655440000")
          const isUuid = zoneIdStr.length === 36 && zoneIdStr.includes('-');
          if (!isUuid) {
            // Numeric ID from old Zone model - remove it, use zoneName instead
            delete payload.zoneId;
          }
        }
        
        // Ensure zoneName is set if zoneId was removed
        if (!payload.zoneId && !payload.zoneName) {
          toast.error("Zone name is required");
          return;
        }
        
        const response = await dispatch(createTripFare(payload));
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name
                </label>
                <Autocomplete
                  options={zoneOptions}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : option.label || option.name || ""
                  }
                  value={
                    zoneOptions.find(
                      (z) => z.id === formik.values.zoneId || z.name === formik.values.zoneName
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    if (newValue && typeof newValue === 'object') {
                      // Always set zoneName (works for both old and new zone models)
                      formik.setFieldValue("zoneName", newValue.name || "");
                      
                      // Only set zoneId if it's a UUID (36 chars with hyphens)
                      // Old Zone model uses numeric IDs which won't work with ZoneV2
                      const zoneIdStr = newValue.id?.toString() || "";
                      const isUuid = zoneIdStr.length === 36 && zoneIdStr.includes('-');
                      
                      if (isUuid) {
                        formik.setFieldValue("zoneId", zoneIdStr);
                      } else {
                        // Clear zoneId for numeric IDs - backend will use zoneName instead
                        formik.setFieldValue("zoneId", "");
                      }
                    } else {
                      formik.setFieldValue("zoneName", "");
                      formik.setFieldValue("zoneId", "");
                    }
                  }}
                  onBlur={() => formik.setFieldTouched("zoneName", true)}
                  loading={zonesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select zone..."
                      size="small"
                      error={formik.touched.zoneName && Boolean(formik.errors.zoneName)}
                      helperText={formik.touched.zoneName && formik.errors.zoneName}
                    />
                  )}
                />
                {formik.touched.zoneName && formik.errors.zoneName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.zoneName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Type
                </label>
                <Autocomplete
                  options={categoryOptions}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : option.label || option.type || option.name || ""
                  }
                  value={
                    categoryOptions.find(
                      (c) => c.type === formik.values.categoryType || 
                            c.name === formik.values.categoryType ||
                            c.id === formik.values.vehicleCategoryId
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
                  onBlur={() => formik.setFieldTouched("categoryType", true)}
                  loading={categoriesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select category..."
                      size="small"
                    />
                  )}
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
