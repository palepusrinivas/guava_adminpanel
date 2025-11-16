"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getParcelCategories,
  createParcelCategory,
  updateParcelCategory,
} from "@/utils/reducers/adminReducers";
import { setCategoryFilter, setCategorySearchQuery } from "@/utils/slices/parcelSlice";

const schema = yup.object({
  categoryName: yup.string().required("Category name is required"),
  shortDescription: yup.string().max(800, "Description must be less than 800 characters"),
});

export default function ParcelCategory() {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error, categoryFilter, categorySearchQuery } = useAppSelector((s) => s.parcel);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [categoryIcon, setCategoryIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getParcelCategories()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      categoryName: "",
      shortDescription: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const categoryData = {
          categoryName: values.categoryName,
          shortDescription: values.shortDescription || undefined,
          categoryIcon: categoryIcon ? URL.createObjectURL(categoryIcon) : undefined,
          active: true,
        };
        const result = await dispatch(createParcelCategory(categoryData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Parcel category created successfully!");
          formik.resetForm();
          setCategoryIcon(null);
          setIconPreview(null);
          dispatch(getParcelCategories());
        } else {
          throw new Error((result as any).payload || "Failed to create parcel category");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create parcel category. Ensure backend API is ready.");
      }
    },
  });

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size must be less than 5 MB");
        return;
      }
      setCategoryIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = useMemo(() => {
    const base = categories.filter((c) => {
      if (categoryFilter === "active") return c.active;
      if (categoryFilter === "inactive") return !c.active;
      return true;
    });
    if (!categorySearchQuery) return base;
    const q = categorySearchQuery.toLowerCase();
    return base.filter((c) => c.categoryName.toLowerCase().includes(q));
  }, [categories, categoryFilter, categorySearchQuery]);

  const handleToggleStatus = async (category: any) => {
    await dispatch(updateParcelCategory({ categoryId: String(category.id), categoryData: { active: !category.active } }));
    dispatch(getParcelCategories());
  };

  return (
    <div className="space-y-6">
      {/* Add New Parcel Category Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="bg-teal-500 rounded-t-xl p-4">
          <h2 className="text-xl font-bold text-white">ADD NEW PARCEL CATEGORY</h2>
        </div>
        <div className="p-6">
          {submitSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
          )}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                name="categoryName"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: Category name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.categoryName && formik.errors.categoryName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.categoryName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                name="shortDescription"
                value={formik.values.shortDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={4}
                maxLength={800}
                placeholder="Ex: Description"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <div className="flex justify-between items-center mt-1">
                <div></div>
                <span className="text-xs text-gray-500">
                  {formik.values.shortDescription.length}/800
                </span>
              </div>
              {formik.touched.shortDescription && formik.errors.shortDescription && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.shortDescription}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Icon</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleIconChange}
                  className="hidden"
                  id="categoryIcon"
                />
                <label htmlFor="categoryIcon" className="cursor-pointer">
                  {iconPreview ? (
                    <div className="space-y-2">
                      <img src={iconPreview} alt="Preview" className="w-32 h-32 mx-auto rounded object-cover" />
                      <p className="text-sm text-gray-600">Click to change icon</p>
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
                      <p className="text-sm text-blue-600 font-medium">Click to upload</p>
                      <p className="text-sm text-gray-600">Or drag and drop</p>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">File Format - png | Image Size - Maximum Size 5 MB.</p>
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

      {/* Parcel Category List Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="bg-teal-500 rounded-t-xl p-4">
          <h2 className="text-xl font-bold text-white">Parcel Category List</h2>
        </div>
        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => dispatch(setCategoryFilter("all"))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  categoryFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => dispatch(setCategoryFilter("active"))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  categoryFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => dispatch(setCategoryFilter("inactive"))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  categoryFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
                }`}
              >
                Inactive
              </button>
            </div>
            <div className="text-sm text-gray-500">Total Parcel Categories : {categories.length}</div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative w-full">
                <input
                  value={categorySearchQuery}
                  onChange={(e) => dispatch(setCategorySearchQuery(e.target.value))}
                  placeholder="Search here by Parcel ("
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
              Unable to load parcel categories from server. Ensure backend endpoints are implemented. Error: {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">SL</th>
                  <th className="px-4 py-3 text-left">Parcel Category Name</th>
                  <th className="px-4 py-3 text-left">Total Delivered</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(isLoading ? [] : filtered).map((category, idx) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{category.categoryName}</td>
                    <td className="px-4 py-3">{category.totalDelivered || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(category)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          category.active ? "bg-teal-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.active ? "translate-x-6" : "translate-x-1"
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
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      No parcel categories found.
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

