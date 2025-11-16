"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import { getBanners, createBanner, updateBanner, deleteBanner } from "@/utils/reducers/adminReducers";
import { setFilter } from "@/utils/slices/bannerSlice";
import Image from "next/image";

const timePeriods = [
  { value: "1week", label: "1 Week" },
  { value: "2weeks", label: "2 Weeks" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months" },
  { value: "6months", label: "6 Months" },
  { value: "1year", label: "1 Year" },
  { value: "permanent", label: "Permanent" },
];

const bannerValidationSchema = yup.object({
  title: yup.string().required("Banner title is required").max(100, "Title must be less than 100 characters"),
  shortDescription: yup.string().required("Short description is required").max(800, "Description must be less than 800 characters"),
  redirectLink: yup.string().required("Redirect link is required").url("Must be a valid URL"),
  timePeriod: yup.string().required("Time period is required"),
  bannerImage: yup.mixed().required("Banner image is required"),
});

function BannerSetup() {
  const dispatch = useAppDispatch();
  const { banners, isLoading, error, filter } = useAppSelector((state) => state.banner);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch banners, but don't crash if backend isn't ready
    dispatch(getBanners()).catch((err) => {
      console.warn("Backend banner endpoints not implemented yet:", err);
    });
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      title: "",
      shortDescription: "",
      redirectLink: "",
      timePeriod: "",
      bannerImage: null as File | null,
    },
    validationSchema: bannerValidationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("shortDescription", values.shortDescription);
        formData.append("redirectLink", values.redirectLink);
        formData.append("timePeriod", values.timePeriod);
        if (values.bannerImage) {
          formData.append("bannerImage", values.bannerImage);
        }

        const result = await dispatch(createBanner(formData));
        
        if (createBanner.fulfilled.match(result)) {
          setSubmitSuccess("Banner created successfully!");
          formik.resetForm();
          setImagePreview(null);
          dispatch(getBanners());
          
          // Clear success message after 5 seconds
          setTimeout(() => setSubmitSuccess(null), 5000);
        } else {
          throw new Error(result.payload as string || "Failed to create banner");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create banner. Please ensure the backend API is running.";
        setSubmitError(errorMessage);
      }
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      formik.setFieldValue("bannerImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDeleteBanner = async (bannerId: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      await dispatch(deleteBanner(bannerId.toString()));
      dispatch(getBanners());
    }
  };

  const handleToggleStatus = async (banner: any) => {
    const formData = new FormData();
    formData.append("title", banner.title);
    formData.append("shortDescription", banner.shortDescription);
    formData.append("redirectLink", banner.redirectLink);
    formData.append("timePeriod", banner.timePeriod);
    formData.append("active", (!banner.active).toString());

    await dispatch(updateBanner({ bannerId: banner.id.toString(), bannerData: formData }));
    dispatch(getBanners());
  };

  const filteredBanners = banners.filter((banner) => {
    if (filter === "all") return true;
    if (filter === "active") return banner.active;
    if (filter === "inactive") return !banner.active;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ADD NEW BANNER Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase">Add New Banner</h2>
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 font-medium">{submitSuccess}</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{submitError}</p>
                <p className="text-xs text-red-600 mt-1">
                  💡 Make sure your backend server is running and the banner API endpoints are implemented.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: 50% Off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
              )}
            </div>

            {/* Redirect Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect Link <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="redirectLink"
                value={formik.values.redirectLink}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: www.google.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
              {formik.touched.redirectLink && formik.errors.redirectLink && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.redirectLink}</p>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortDescription"
              value={formik.values.shortDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Type Here..."
              rows={4}
              maxLength={800}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {formik.touched.shortDescription && formik.errors.shortDescription && (
                <p className="text-sm text-red-600">{formik.errors.shortDescription}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">{formik.values.shortDescription.length}/800</p>
            </div>
          </div>

          {/* Time Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period <span className="text-red-500">*</span>
            </label>
            <select
              name="timePeriod"
              value={formik.values.timePeriod}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Select Time Period</option>
              {timePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            {formik.touched.timePeriod && formik.errors.timePeriod && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.timePeriod}</p>
            )}
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive ? "border-teal-500 bg-teal-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      formik.setFieldValue("bannerImage", null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Click to upload Or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-2">.jpg, .jpeg, .png, .webp</p>
                    <p className="text-sm text-gray-500">Image Size - Maximum Size 5 MB. Image Ratio - 3:1</p>
                  </div>
                </div>
              )}
            </div>
            {formik.touched.bannerImage && formik.errors.bannerImage && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.bannerImage as string}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className="px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>

      {/* BANNER LIST Section */}
      <div className="bg-teal-500 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white uppercase">Banner List</h2>
            <p className="text-white text-sm">Total Banners: {banners.length}</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => dispatch(setFilter("all"))}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch(setFilter("active"))}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "active"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => dispatch(setFilter("inactive"))}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "inactive"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Banner Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Backend API Not Connected</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-semibold">The banner API endpoints need to be implemented on your backend.</p>
                  <p>Error: {error}</p>
                  <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Required Endpoints:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                      <li>GET /api/admin/banners</li>
                      <li>POST /api/admin/banners</li>
                      <li>PUT /api/admin/banners/:id</li>
                      <li>DELETE /api/admin/banners/:id</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                    <p className="text-sm text-blue-800">
                      <strong>📚 See Documentation:</strong> Check <code className="bg-blue-100 px-2 py-1 rounded">BANNER_SETUP_IMPLEMENTATION.md</code> for complete API specifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No banners found. Create your first banner to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {banner.imageUrl && (
                    <div className="relative w-full h-32">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{banner.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{banner.shortDescription}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">{banner.timePeriod}</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          banner.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {banner.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className="flex-1 px-3 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                      >
                        {banner.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BannerSetup;

