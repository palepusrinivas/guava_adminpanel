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
import {
  ArrowBack as ArrowBackIcon,
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
  AccessTime as ClockIcon,
  Close as XMarkIcon,
} from "@mui/icons-material";

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

const fareValidationSchema = Yup.object({
  zoneId: Yup.string()
    .transform((v) => v?.trim())
    .test(
      "zone-required",
      "Either Zone Name or Zone ID must be provided",
      function (value) {
        return Boolean(value || this.parent.zoneName);
      }
    ),
  zoneName: Yup.string()
    .transform((v) => v?.trim())
    .test(
      "zone-required",
      "Either Zone Name or Zone ID must be provided",
      function (value) {
        return Boolean(value || this.parent.zoneId);
      }
    ),
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
        console.warn("Failed to fetch vehicle categories:", error?.message || error);
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

  useEffect(() => {
    if (zoneName) {
      formik.setFieldValue("zoneName", zoneName);
    }
  }, [zoneName]);

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
      const fetchedZoneName = zone.name || `Zone ${zoneId}`;
      setZoneName(fetchedZoneName);

      // Fetch trip fares for this zone
      const response = await dispatch(getTripFares({ page: 0, size: 100 }));
      if (getTripFares.fulfilled.match(response)) {
        const data: any = response.payload;
        const allFares = Array.isArray(data) ? data : data?.content || [];
        
        // Filter fares for this zone
        // Note: Operation zones use numeric IDs (old Zone table), but TripFare uses ZoneV2 (UUID strings)
        // So we match by zone name instead, and also check zone IDs as fallback
        const zoneFares = allFares.filter((fare: any) => {
          // Match by zone name (primary method since zone IDs don't match between old Zone and ZoneV2)
          if (fare.zone?.name && zone.name && fare.zone.name.toLowerCase() === zone.name.toLowerCase()) {
            return true;
          }
          
          // Match by zone ID (fallback for UUID strings or if zones match)
          if (fare.zone?.id?.toString() === zoneId?.toString() || 
              fare.zoneId?.toString() === zoneId?.toString()) {
            return true;
          }
          
          return false;
        });
        
        console.log(`[Zone Fare Setup] Zone: ${fetchedZoneName} (ID: ${zoneId}), Found ${zoneFares.length} fare(s) out of ${allFares.length} total`);
        if (zoneFares.length === 0 && allFares.length > 0) {
          console.log(`[Zone Fare Setup] Sample fare structure:`, allFares[0]);
        }
        
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
      zoneName: zoneName || "",
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
        const payload: TripFarePayload = { ...values };
        
        if (payload.zoneId) {
          const zoneIdStr = payload.zoneId.toString();
          const isUuid = zoneIdStr.length === 36 && zoneIdStr.includes('-');
          if (!isUuid) {
            delete payload.zoneId;
            if (!payload.zoneName && zoneName) {
              payload.zoneName = zoneName;
            }
          }
        }
        
        if (!payload.zoneId && !payload.zoneName) {
          if (zoneName) {
            payload.zoneName = zoneName;
          } else {
            toast.error("Zone name is required. Please refresh the page.");
            return;
          }
        }
        
        const response = await dispatch(createTripFare(payload));
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
    
    const fareZoneName = fare.zone?.name || zoneName || "";
    
    formik.setValues({
      zoneId: zoneId,
      zoneName: fareZoneName,
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
      <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative px-8 py-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowBackIcon className="w-5 h-5" />
            <span className="font-medium">Back to Fare Setup</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Zone Fare Prices - {zoneName || `Zone ${zoneId}`}
          </h1>
          <p className="text-teal-50 text-lg">Manage pricing for all vehicle categories in this zone</p>
        </div>
      </div>

      {/* Zone Info Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">₹</span>
            <span>Zone Information</span>
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <span className="text-xl font-bold text-teal-600">₹</span>
            </div>
            <div>
              <label className="text-gray-500 text-sm font-medium">Zone ID</label>
              <p className="font-semibold text-gray-900 text-lg">{zoneId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <span className="text-xl font-bold text-emerald-600">📍</span>
            </div>
            <div>
              <label className="text-gray-500 text-sm font-medium">Zone Name</label>
              <p className="font-semibold text-gray-900 text-lg">{zoneName || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Fare Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingFare ? "Edit Fare Configuration" : "Add New Fare Configuration"}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingFare(null);
                formik.resetForm();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Category *
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Fare (₹) *
                </label>
                <input
                  type="number"
                  name="baseFare"
                  value={formik.values.baseFare}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                {formik.touched.baseFare && formik.errors.baseFare && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.baseFare}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Per KM Rate (₹) *
                </label>
                <input
                  type="number"
                  name="baseFarePerKm"
                  value={formik.values.baseFarePerKm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                {formik.touched.baseFarePerKm && formik.errors.baseFarePerKm && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.baseFarePerKm}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Rate (₹/min)
                </label>
                <input
                  type="number"
                  name="timeRatePerMinOverride"
                  value={formik.values.timeRatePerMinOverride ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cancellation Fee (%)
                </label>
                <input
                  type="number"
                  name="cancellationFeePercent"
                  value={formik.values.cancellationFeePercent ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFare(null);
                  formik.resetForm();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                {editingFare ? "Update Fare" : "Add Fare"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fare Prices List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">₹</span>
                <span>Zone Fare Prices List</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {fares.length} {fares.length === 1 ? "fare configuration" : "fare configurations"} for this zone
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFare(null);
                formik.resetForm();
                formik.setFieldValue("zoneId", zoneId);
                formik.setFieldValue("zoneName", zoneName);
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add New Fare</span>
            </button>
          </div>
        </div>

        {fares.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl text-gray-400">₹</span>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No fare configurations found for this zone</p>
            <p className="text-gray-400 text-sm mb-2">
              Zone: <span className="font-semibold text-gray-600">{zoneName || zoneId}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Get started by adding your first fare configuration for this zone. 
              Fares are matched by zone name, so make sure the zone name matches when creating fares.
            </p>
            <button
              onClick={() => {
                setEditingFare(null);
                formik.resetForm();
                formik.setFieldValue("zoneId", zoneId);
                formik.setFieldValue("zoneName", zoneName);
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add First Fare Configuration</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Vehicle Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Base Fare
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Per Km
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Per Min
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Cancellation Fee
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fares.map((fare, index) => (
                  <tr key={fare.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-teal-600 font-bold text-sm">
                            {(fare.vehicleCategory?.type || fare.vehicleCategory?.name || "N/A")[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {fare.vehicleCategory?.type || fare.vehicleCategory?.name || "N/A"}
                          </div>
                          {fare.vehicleCategory?.name && fare.vehicleCategory?.type && (
                            <div className="text-xs text-gray-500">{fare.vehicleCategory.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{fare.baseFare?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{fare.baseFarePerKm?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fare.timeRatePerMinOverride ? (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{fare.timeRatePerMinOverride.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fare.cancellationFeePercent ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          {fare.cancellationFeePercent}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(fare)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(fare.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
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
