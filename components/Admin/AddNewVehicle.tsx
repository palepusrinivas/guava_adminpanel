"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createVehicle } from "@/utils/reducers/adminReducers";
import { getVehicleBrands, getVehicleCategories } from "@/utils/reducers/adminReducers";
import { clearVehicleError } from "@/utils/slices/vehicleSlice";
import { useRouter } from "next/navigation";

const vehicleSchema = yup.object({
  vehicleBrand: yup.string().required("Vehicle Brand is required"),
  vehicleModel: yup.string().required("Vehicle Model is required"),
  vehicleCategory: yup.string().required("Vehicle Category is required"),
  licensePlate: yup.string().required("License Plate Number is required"),
  licenseExpireDate: yup.string().required("License Expire Date is required"),
  fuelType: yup.string().required("Fuel Type is required"),
  ownership: yup.string().required("Ownership is required"),
  driverId: yup.string().required("Driver is required"),
});

export default function AddNewVehicle() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((s) => s.vehicle);
  const { brands, categories } = useAppSelector((s) => s.vehicle);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setDataFetchError(null);
      // Clear any previous errors
      dispatch(clearVehicleError());
      
      try {
        await dispatch(getVehicleBrands()).unwrap();
      } catch (error: any) {
        // Silently handle error - brands dropdown will just be empty
        console.warn("Failed to fetch vehicle brands:", error?.message || error);
        setDataFetchError("Failed to load vehicle brands. Please refresh the page.");
        // Clear Redux error state
        dispatch(clearVehicleError());
      }
      try {
        await dispatch(getVehicleCategories()).unwrap();
      } catch (error: any) {
        // Silently handle error - categories dropdown will just be empty
        console.warn("Failed to fetch vehicle categories:", error?.message || error);
        if (!dataFetchError) {
          setDataFetchError("Failed to load vehicle categories. Please refresh the page.");
        }
        // Clear Redux error state
        dispatch(clearVehicleError());
      }
    };
    fetchData();
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      vehicleBrand: "",
      vehicleModel: "",
      vehicleCategory: "",
      licensePlate: "",
      licenseExpireDate: "",
      vinNumber: "",
      transmission: "",
      parcelWeightCapacity: "",
      fuelType: "",
      ownership: "",
      driverId: "",
    },
    validationSchema: vehicleSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const vehicleData = {
          vehicleBrand: values.vehicleBrand,
          vehicleModel: values.vehicleModel,
          vehicleCategory: values.vehicleCategory,
          licensePlate: values.licensePlate,
          licenseExpireDate: values.licenseExpireDate,
          vinNumber: values.vinNumber || undefined,
          transmission: values.transmission || undefined,
          parcelWeightCapacity: values.parcelWeightCapacity ? parseFloat(values.parcelWeightCapacity) : undefined,
          fuelType: values.fuelType,
          ownership: values.ownership,
          driverId: values.driverId,
          documents: documents.length > 0 ? documents.map((f) => URL.createObjectURL(f)) : undefined,
          status: "ACTIVE",
        };
        const result = await dispatch(createVehicle(vehicleData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Vehicle created successfully!");
          setTimeout(() => {
            router.push("/admin/vehicle");
          }, 1500);
        } else {
          throw new Error((result as any).payload || "Failed to create vehicle");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create vehicle. Ensure backend API is ready.");
      }
    },
  });

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {/* Only show data fetching errors as a warning, not blocking */}
      {dataFetchError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          ⚠️ {dataFetchError} You can still fill the form manually.
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Vehicle Information Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">VEHICLE INFORMATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleBrand"
                value={formik.values.vehicleBrand}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.brandName}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
              {formik.touched.vehicleBrand && formik.errors.vehicleBrand && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.vehicleBrand}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={formik.values.vehicleModel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: Model"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.vehicleModel && formik.errors.vehicleModel && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.vehicleModel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Category <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleCategory"
                value={formik.values.vehicleCategory}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Vehicle Category</option>
                {categories.map((category) => {
                  // Handle both categoryName and name fields for compatibility
                  const categoryName = (category as any).categoryName || (category as any).name || "Unknown";
                  const categoryId = category.id || (category as any)._id;
                  return (
                    <option key={categoryId} value={categoryName}>
                      {categoryName}
                    </option>
                  );
                })}
              </select>
              {formik.touched.vehicleCategory && formik.errors.vehicleCategory && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.vehicleCategory}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Licence Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formik.values.licensePlate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: DB-3212"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.licensePlate && formik.errors.licensePlate && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.licensePlate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Licence Expire Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="licenseExpireDate"
                  value={formik.values.licenseExpireDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="dd-mm-yyyy"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute right-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {formik.touched.licenseExpireDate && formik.errors.licenseExpireDate && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.licenseExpireDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number</label>
              <input
                type="text"
                name="vinNumber"
                value={formik.values.vinNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: 1HGBH41JXMN109186"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <input
                type="text"
                name="transmission"
                value={formik.values.transmission}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: AMT"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Weight Capacity (Kg)</label>
              <input
                type="number"
                name="parcelWeightCapacity"
                value={formik.values.parcelWeightCapacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: 10"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fuelType"
                value={formik.values.fuelType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
              {formik.touched.fuelType && formik.errors.fuelType && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.fuelType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership <span className="text-red-500">*</span>
              </label>
              <select
                name="ownership"
                value={formik.values.ownership}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Owner</option>
                <option value="Driver">Driver</option>
                <option value="Company">Company</option>
              </select>
              {formik.touched.ownership && formik.errors.ownership && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.ownership}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver <span className="text-red-500">*</span>
              </label>
              <select
                name="driverId"
                value={formik.values.driverId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Driver</option>
                {/* Drivers would come from a drivers API - placeholder for now */}
                <option value="driver1">Driver 1</option>
                <option value="driver2">Driver 2</option>
              </select>
              {formik.touched.driverId && formik.errors.driverId && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.driverId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Upload Documents Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Upload Documents</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleDocumentChange}
              className="hidden"
              id="vehicleDocuments"
            />
            <label htmlFor="vehicleDocuments" className="cursor-pointer">
              <svg
                className="w-12 h-12 mx-auto text-blue-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-blue-600 font-medium">Upload</p>
            </label>
            {documents.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                {documents.length} file(s) selected
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

