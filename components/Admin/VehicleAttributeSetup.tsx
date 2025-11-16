"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getVehicleBrands,
  createVehicleBrand,
  updateVehicleBrand,
  getVehicleModels,
  createVehicleModel,
  getVehicleCategories,
  createVehicleCategory,
} from "@/utils/reducers/adminReducers";
import { setActiveTab, setBrandFilter, setBrandSearchQuery } from "@/utils/slices/vehicleSlice";

const brandSchema = yup.object({
  brandName: yup.string().required("Brand name is required"),
  shortDescription: yup.string().max(800, "Description must be less than 800 characters"),
});

export default function VehicleAttributeSetup() {
  const dispatch = useAppDispatch();
  const { brands, models, categories, isLoading, error, activeTab, brandFilter, brandSearchQuery } = useAppSelector(
    (s) => s.vehicle
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getVehicleBrands()).catch(() => {});
    dispatch(getVehicleModels()).catch(() => {});
    dispatch(getVehicleCategories()).catch(() => {});
  }, [dispatch]);

  // Brand Form
  const brandFormik = useFormik({
    initialValues: {
      brandName: "",
      shortDescription: "",
    },
    validationSchema: brandSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const brandData = {
          brandName: values.brandName,
          shortDescription: values.shortDescription || undefined,
          brandLogo: brandLogo ? URL.createObjectURL(brandLogo) : undefined,
          active: true,
        };
        const result = await dispatch(createVehicleBrand(brandData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Brand created successfully!");
          brandFormik.resetForm();
          setBrandLogo(null);
          setLogoPreview(null);
          dispatch(getVehicleBrands());
        } else {
          throw new Error((result as any).payload || "Failed to create brand");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create brand. Ensure backend API is ready.");
      }
    },
  });

  // Model Form
  const modelFormik = useFormik({
    initialValues: {
      modelName: "",
      brandId: "",
    },
    validationSchema: yup.object({
      modelName: yup.string().required("Model name is required"),
      brandId: yup.string().required("Brand is required"),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(createVehicleModel(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Model created successfully!");
          modelFormik.resetForm();
          dispatch(getVehicleModels());
        } else {
          throw new Error((result as any).payload || "Failed to create model");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create model. Ensure backend API is ready.");
      }
    },
  });

  // Category Form
  const categoryFormik = useFormik({
    initialValues: {
      categoryName: "",
    },
    validationSchema: yup.object({
      categoryName: yup.string().required("Category name is required"),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const result = await dispatch(createVehicleCategory(values));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Category created successfully!");
          categoryFormik.resetForm();
          dispatch(getVehicleCategories());
        } else {
          throw new Error((result as any).payload || "Failed to create category");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create category. Ensure backend API is ready.");
      }
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size must be less than 5 MB");
        return;
      }
      setBrandLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBrands = useMemo(() => {
    const base = brands.filter((b) => {
      if (brandFilter === "active") return b.active;
      if (brandFilter === "inactive") return !b.active;
      return true;
    });
    if (!brandSearchQuery) return base;
    const q = brandSearchQuery.toLowerCase();
    return base.filter((b) => b.brandName.toLowerCase().includes(q));
  }, [brands, brandFilter, brandSearchQuery]);

  const handleToggleBrandStatus = async (brand: any) => {
    await dispatch(updateVehicleBrand({ brandId: String(brand.id), brandData: { active: !brand.active } }));
    dispatch(getVehicleBrands());
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-teal-500 rounded-xl p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(setActiveTab("brand"))}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "brand" ? "bg-teal-600 text-white" : "bg-white/20 text-white"
            }`}
          >
            Vehicle Brand
          </button>
          <button
            onClick={() => dispatch(setActiveTab("model"))}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "model" ? "bg-teal-600 text-white" : "bg-white/20 text-white"
            }`}
          >
            Vehicle Model
          </button>
          <button
            onClick={() => dispatch(setActiveTab("category"))}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "category" ? "bg-teal-600 text-white" : "bg-white/20 text-white"
            }`}
          >
            Vehicle Category
          </button>
        </div>
      </div>

      {/* Brand Tab */}
      {activeTab === "brand" && (
        <>
          {/* Add New Brand Section */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ADD NEW BRAND</h2>
              {submitSuccess && (
                <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
                  {submitSuccess}
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
              )}
              <form onSubmit={brandFormik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <input
                        name="brandName"
                        value={brandFormik.values.brandName}
                        onChange={brandFormik.handleChange}
                        onBlur={brandFormik.handleBlur}
                        placeholder="Ex: Brand"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      {brandFormik.touched.brandName && brandFormik.errors.brandName && (
                        <p className="text-sm text-red-600 mt-1">{brandFormik.errors.brandName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                      <textarea
                        name="shortDescription"
                        value={brandFormik.values.shortDescription}
                        onChange={brandFormik.handleChange}
                        onBlur={brandFormik.handleBlur}
                        rows={4}
                        maxLength={800}
                        placeholder="Ex: Description"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div></div>
                        <span className="text-xs text-gray-500">{brandFormik.values.shortDescription.length}/800</span>
                      </div>
                      {brandFormik.touched.shortDescription && brandFormik.errors.shortDescription && (
                        <p className="text-sm text-red-600 mt-1">{brandFormik.errors.shortDescription}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                      <input type="file" accept="image/png" onChange={handleLogoChange} className="hidden" id="brandLogo" />
                      <label htmlFor="brandLogo" className="cursor-pointer">
                        {logoPreview ? (
                          <div className="space-y-2">
                            <img src={logoPreview} alt="Preview" className="w-32 h-32 mx-auto rounded object-cover" />
                            <p className="text-sm text-gray-600">Click to change logo</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg
                              className="w-12 h-12 mx-auto text-blue-500"
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
                            <p className="text-sm text-blue-600 font-medium">Click to upload Or drag and drop</p>
                          </div>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">5MB image note</p>
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

          {/* Brand List Section */}
          <div className="bg-white rounded-xl shadow">
            <div className="bg-teal-500 rounded-t-xl p-4">
              <h2 className="text-xl font-bold text-white">Brand List</h2>
            </div>
            <div className="p-6">
              {/* Filters */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => dispatch(setBrandFilter("all"))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      brandFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => dispatch(setBrandFilter("active"))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      brandFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => dispatch(setBrandFilter("inactive"))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      brandFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                <div className="text-sm text-gray-500">Total Brands: {brands.length}</div>
              </div>

              {/* Search */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <input
                    value={brandSearchQuery}
                    onChange={(e) => dispatch(setBrandSearchQuery(e.target.value))}
                    placeholder="Search here by Brand"
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">SL</th>
                      <th className="px-4 py-3 text-left">Brand Name</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(isLoading ? [] : filteredBrands).map((brand, idx) => (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{brand.brandName}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleBrandStatus(brand)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              brand.active ? "bg-teal-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                brand.active ? "translate-x-6" : "translate-x-1"
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
                    {!isLoading && filteredBrands.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                          No brands found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Model Tab */}
      {activeTab === "model" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ADD NEW MODEL</h2>
          {submitSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
          )}
          <form onSubmit={modelFormik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <input
                name="modelName"
                value={modelFormik.values.modelName}
                onChange={modelFormik.handleChange}
                onBlur={modelFormik.handleBlur}
                placeholder="Ex: Model name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {modelFormik.touched.modelName && modelFormik.errors.modelName && (
                <p className="text-sm text-red-600 mt-1">{modelFormik.errors.modelName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                name="brandId"
                value={modelFormik.values.brandId}
                onChange={modelFormik.handleChange}
                onBlur={modelFormik.handleBlur}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
              {modelFormik.touched.brandId && modelFormik.errors.brandId && (
                <p className="text-sm text-red-600 mt-1">{modelFormik.errors.brandId}</p>
              )}
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
      )}

      {/* Category Tab */}
      {activeTab === "category" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ADD NEW CATEGORY</h2>
          {submitSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
          )}
          <form onSubmit={categoryFormik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                name="categoryName"
                value={categoryFormik.values.categoryName}
                onChange={categoryFormik.handleChange}
                onBlur={categoryFormik.handleBlur}
                placeholder="Ex: Category name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {categoryFormik.touched.categoryName && categoryFormik.errors.categoryName && (
                <p className="text-sm text-red-600 mt-1">{categoryFormik.errors.categoryName}</p>
              )}
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
      )}
    </div>
  );
}

