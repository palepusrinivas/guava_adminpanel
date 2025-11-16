"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getEmployeeRoles,
  createEmployeeRole,
  updateEmployeeRole,
  getEmployees,
} from "@/utils/reducers/adminReducers";
import { setRoleFilter, setRoleSearchQuery } from "@/utils/slices/employeeSlice";

const modules = [
  "Parcel Management",
  "User Management",
  "Dashboard",
  "Promotion Management",
  "Transaction Management",
  "Zone Management",
  "Vehicle Management",
  "Business Management",
  "Trip Management",
  "Fare Management",
  "Help And Support",
];

const schema = yup.object({
  roleName: yup.string().required("Role name is required"),
  modules: yup.array().min(1, "At least one module must be selected"),
});

export default function EmployeeAttributeSetup() {
  const dispatch = useAppDispatch();
  const { roles, isLoading, error, roleFilter, roleSearchQuery } = useAppSelector((s) => s.employee);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    dispatch(getEmployeeRoles()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      roleName: "",
      modules: [] as string[],
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const roleData = {
          roleName: values.roleName,
          modules: values.modules,
          active: true,
        };
        const result = await dispatch(createEmployeeRole(roleData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Employee role created successfully!");
          formik.resetForm();
          setSelectedModules([]);
          setSelectAll(false);
          dispatch(getEmployeeRoles());
        } else {
          throw new Error((result as any).payload || "Failed to create employee role");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create employee role. Ensure backend API is ready.");
      }
    },
  });

  const handleModuleToggle = (module: string) => {
    const newModules = selectedModules.includes(module)
      ? selectedModules.filter((m) => m !== module)
      : [...selectedModules, module];
    setSelectedModules(newModules);
    formik.setFieldValue("modules", newModules);
    setSelectAll(newModules.length === modules.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedModules([]);
      formik.setFieldValue("modules", []);
    } else {
      setSelectedModules(modules);
      formik.setFieldValue("modules", modules);
    }
    setSelectAll(!selectAll);
  };

  const filtered = useMemo(() => {
    const base = roles.filter((r) => {
      if (roleFilter === "active") return r.active;
      if (roleFilter === "inactive") return !r.active;
      return true;
    });
    if (!roleSearchQuery) return base;
    const q = roleSearchQuery.toLowerCase();
    return base.filter((r) => r.roleName.toLowerCase().includes(q));
  }, [roles, roleFilter, roleSearchQuery]);

  const handleToggleStatus = async (role: any) => {
    await dispatch(updateEmployeeRole({ roleId: String(role.id), roleData: { active: !role.active } }));
    dispatch(getEmployeeRoles());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Employee Attributes</h2>
      </div>

      {/* Employee Role & Access Permissions Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Employee Role & Access Permissions</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              name="roleName"
              value={formik.values.roleName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ex: Business Analyst"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {formik.touched.roleName && formik.errors.roleName && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.roleName as string}</p>
            )}
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">Select Modules For Access</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
              </div>
              {modules.map((module) => (
                <label
                  key={module}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{module}</span>
                </label>
              ))}
            </div>
            {formik.touched.modules && formik.errors.modules && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.modules as string}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setSelectedModules([]);
                setSelectAll(false);
              }}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              RESET
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "SAVE"}
            </button>
          </div>
        </form>
      </div>

      {/* Employee Role List Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="bg-teal-500 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-bold text-white">Employee Role List</h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(setRoleFilter("all"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                roleFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch(setRoleFilter("active"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                roleFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => dispatch(setRoleFilter("inactive"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                roleFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Inactive
            </button>
          </div>
          <div className="text-sm text-gray-500">Total Designation: {roles.length}</div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <input
              value={roleSearchQuery}
              onChange={(e) => dispatch(setRoleSearchQuery(e.target.value))}
              placeholder="Search here by Role Na"
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
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load employee roles from server. Ensure backend endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Role Name</th>
                <th className="px-4 py-3 text-left">Modules</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((role, idx) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{role.roleName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {role.modules?.slice(0, 3).map((m, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {m}
                        </span>
                      ))}
                      {role.modules && role.modules.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{role.modules.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(role)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        role.active ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          role.active ? "translate-x-6" : "translate-x-1"
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
                    No employee roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

