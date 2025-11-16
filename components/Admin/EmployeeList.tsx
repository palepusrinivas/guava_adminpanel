"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getEmployees, updateEmployee } from "@/utils/reducers/adminReducers";
import { setEmployeeFilter, setEmployeeSearchQuery } from "@/utils/slices/employeeSlice";
import { useRouter } from "next/navigation";

export default function EmployeeList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { employees, isLoading, error, employeeFilter, employeeSearchQuery } = useAppSelector((s) => s.employee);

  useEffect(() => {
    dispatch(getEmployees()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = employees.filter((e) => {
      if (employeeFilter === "active") return e.status === "ACTIVE";
      if (employeeFilter === "inactive") return e.status === "INACTIVE";
      return true;
    });
    if (!employeeSearchQuery) return base;
    const q = employeeSearchQuery.toLowerCase();
    return base.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.employeePosition?.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q)
    );
  }, [employees, employeeFilter, employeeSearchQuery]);

  const handleToggleStatus = async (employee: any) => {
    await dispatch(
      updateEmployee({
        employeeId: String(employee.id),
        employeeData: { status: employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
      })
    );
    dispatch(getEmployees());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Employee List</h2>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(setEmployeeFilter("all"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                employeeFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch(setEmployeeFilter("active"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                employeeFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => dispatch(setEmployeeFilter("inactive"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                employeeFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Inactive
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Total Employees: {employees.length}</div>
          </div>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 mb-4">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={employeeSearchQuery}
                onChange={(e) => dispatch(setEmployeeSearchQuery(e.target.value))}
                placeholder="Search Here by Employ"
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
            <button
              onClick={() => router.push("/admin/employee/create")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              + Add Employee
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load employees from server. Ensure backend endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Employee Name</th>
                <th className="px-4 py-3 text-left">Employee Position</th>
                <th className="px-4 py-3 text-left">Module Access</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((employee, idx) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-4 py-3">{employee.employeePosition || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {employee.moduleAccess?.slice(0, 2).map((m, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {m}
                        </span>
                      ))}
                      {employee.moduleAccess && employee.moduleAccess.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{employee.moduleAccess.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(employee)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        employee.status === "ACTIVE" ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          employee.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-12 text-center" colSpan={6}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">No data available</p>
                    </div>
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

