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

  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [categoryNameMode, setCategoryNameMode] = useState<"select" | "custom">("select");

  // Vehicle category type options for dropdown
  const VEHICLE_CATEGORY_TYPES = [
    { value: "AUTO", label: "Auto (Three Wheeler)" },
    { value: "CAR", label: "Car (Four Wheeler)" },
    { value: "BIKE", label: "Bike (Two Wheeler)" },
    { value: "THREE_WHEELER", label: "Three Wheeler" },
    { value: "FOUR_WHEELER", label: "Four Wheeler" },
    { value: "TWO_WHEELER", label: "Two Wheeler" },
    { value: "PREMIUM", label: "Premium" },
    { value: "LUXURY", label: "Luxury" },
    { value: "ECONOMY", label: "Economy" },
  ];

  // Category Form
  const categoryFormik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: "",
      image: "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Category name is required"),
      description: yup.string().required("Description is required"),
      type: yup.string().required("Category type is required"),
      image: yup.string().when([], {
        is: () => !categoryImage,
        then: (schema) => schema.required("Category image is required"),
        otherwise: (schema) => schema,
      }),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        
        // Validate that name is not an existing category name
        if (categoryNameMode === "select" && values.name) {
          const existingCategory = categories && Array.isArray(categories) 
            ? categories.find((cat: any) => (cat.name || cat.categoryName) === values.name)
            : null;
          if (existingCategory) {
            setSubmitError(`Category "${values.name}" already exists. Please use "Add New" mode and enter a different name.`);
            return;
          }
        }
        
        // Validate required fields
        if (!values.name || values.name.trim() === "") {
          setSubmitError("Category name is required");
          return;
        }
        if (!values.description || values.description.trim() === "") {
          setSubmitError("Category description is required");
          return;
        }
        if (!values.type || values.type.trim() === "") {
          setSubmitError("Category type is required");
          return;
        }
        if (!categoryImage) {
          setSubmitError("Category image is required");
          return;
        }
        
        const categoryData = {
          name: values.name.trim(),
          description: values.description.trim(),
          type: values.type.trim(),
          // Send the File object directly if available
          image: categoryImage || null,
          isActive: true,
        };
        const result = await dispatch(createVehicleCategory(categoryData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Category created successfully!");
          categoryFormik.resetForm();
          setCategoryImage(null);
          setCategoryImagePreview(null);
          setCategoryNameMode("select"); // Reset to select mode
          dispatch(getVehicleCategories());
        } else {
          throw new Error((result as any).payload || "Failed to create category");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create category. Ensure backend API is ready.");
      }
    },
  });

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size must be less than 5 MB");
        return;
      }
      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        <>
          {/* Add New Category Section */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {/* Mode Toggle */}
                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryNameMode("select");
                              categoryFormik.setFieldValue("name", "");
                            }}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              categoryNameMode === "select"
                                ? "bg-teal-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Select Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryNameMode("custom");
                              categoryFormik.setFieldValue("name", "");
                            }}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              categoryNameMode === "custom"
                                ? "bg-teal-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Add New
                          </button>
                        </div>
                        
                        {/* Dropdown for existing categories */}
                        {categoryNameMode === "select" ? (
                          <>
                            <select
                              name="name"
                              value={categoryFormik.values.name}
                              onChange={(e) => {
                                const selectedName = e.target.value;
                                categoryFormik.setFieldValue("name", selectedName);
                                
                                // If an existing category is selected, show warning
                                if (selectedName && categories && Array.isArray(categories)) {
                                  const existingCategory = categories.find((cat: any) => 
                                    (cat.name || cat.categoryName) === selectedName
                                  );
                                  if (existingCategory) {
                                    setSubmitError(`⚠️ Category "${selectedName}" already exists. Use "Add New" mode to create a new category with a different name.`);
                                  } else {
                                    setSubmitError(null);
                                  }
                                }
                              }}
                              onBlur={categoryFormik.handleBlur}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                              <option value="">Select Category Name (to view details)</option>
                              {categories && Array.isArray(categories) && categories.length > 0 ? (
                                categories
                                  .filter((cat: any) => {
                                    // Filter active categories
                                    const isActive = (cat.isActive !== false && cat.isActive !== null) || 
                                                   (cat.active !== false && cat.active !== null);
                                    return isActive !== false;
                                  })
                                  .map((cat: any) => {
                                    const categoryName = cat.name || cat.categoryName || '';
                                    const categoryId = cat.id || '';
                                    return (
                                      <option key={categoryId || categoryName} value={categoryName}>
                                        {categoryName} {cat.type ? `(${cat.type})` : ''}
                                      </option>
                                    );
                                  })
                              ) : (
                                <option value="" disabled>No categories available. Use "Add New" to create one.</option>
                              )}
                            </select>
                            {categoryFormik.values.name && categories && Array.isArray(categories) && 
                             categories.some((cat: any) => (cat.name || cat.categoryName) === categoryFormik.values.name) && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                ⚠️ This category already exists. Switch to "Add New" mode to create a category with a different name.
                              </div>
                            )}
                          </>
                        ) : (
                          /* Text input for custom name */
                          <input
                            name="name"
                            type="text"
                            value={categoryFormik.values.name}
                            onChange={categoryFormik.handleChange}
                            onBlur={categoryFormik.handleBlur}
                            placeholder="Ex: MEGA, SEDAN, AUTO, PREMIUM"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        )}
                      </div>
                      {categoryFormik.touched.name && categoryFormik.errors.name && (
                        <p className="text-sm text-red-600 mt-1">{categoryFormik.errors.name}</p>
                      )}
                      {categoryNameMode === "select" && categories && categories.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Select from {categories.filter((c: any) => (c.isActive !== false && c.isActive !== null) || (c.active !== false && c.active !== null)).length} existing categories
                        </p>
                      )}
                      {categoryNameMode === "custom" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a unique category name. It must not match any existing category.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={categoryFormik.values.type}
                        onChange={categoryFormik.handleChange}
                        onBlur={categoryFormik.handleBlur}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="">Select Category Type</option>
                        {VEHICLE_CATEGORY_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {categoryFormik.touched.type && categoryFormik.errors.type && (
                        <p className="text-sm text-red-600 mt-1">{categoryFormik.errors.type}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={categoryFormik.values.description}
                        onChange={categoryFormik.handleChange}
                        onBlur={categoryFormik.handleBlur}
                        rows={4}
                        placeholder="Ex: Description of the vehicle category"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      {categoryFormik.touched.description && categoryFormik.errors.description && (
                        <p className="text-sm text-red-600 mt-1">{categoryFormik.errors.description}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageChange}
                        className="hidden"
                        id="categoryImage"
                      />
                      <label htmlFor="categoryImage" className="cursor-pointer">
                        {categoryImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={categoryImagePreview}
                              alt="Preview"
                              className="w-32 h-32 mx-auto rounded object-cover"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
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
                    {categoryFormik.touched.image && categoryFormik.errors.image && (
                      <p className="text-sm text-red-600 mt-1">{categoryFormik.errors.image}</p>
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

          {/* Category List Section */}
          <div className="bg-white rounded-xl shadow">
            <div className="bg-teal-500 rounded-t-xl p-4">
              <h2 className="text-xl font-bold text-white">Category List</h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-4">Total Categories: {categories.length}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">SL</th>
                      <th className="px-4 py-3 text-left">Category Name</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(isLoading ? [] : categories).map((category, idx) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{category.categoryName || (category as any).name}</td>
                        <td className="px-4 py-3">{(category as any).type || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              category.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {category.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && categories.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                          No categories found.
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
    </div>
  );
}

