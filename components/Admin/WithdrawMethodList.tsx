"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getWithdrawMethods, updateWithdrawMethod } from "@/utils/reducers/adminReducers";
import { setMethodFilter, setMethodSearchQuery } from "@/utils/slices/withdrawSlice";
import { useRouter } from "next/navigation";

export default function WithdrawMethodList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { methods, isLoading, error, methodFilter, methodSearchQuery } = useAppSelector((s) => s.withdraw);

  useEffect(() => {
    dispatch(getWithdrawMethods()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = methods.filter((m) => {
      if (methodFilter === "active") return m.active;
      if (methodFilter === "inactive") return !m.active;
      return true;
    });
    if (!methodSearchQuery) return base;
    const q = methodSearchQuery.toLowerCase();
    return base.filter((m) =>
      [m.methodName, ...(m.methodFields?.map((f) => f.fieldName) || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [methods, methodFilter, methodSearchQuery]);

  const handleToggleStatus = async (method: any) => {
    await dispatch(updateWithdrawMethod({ methodId: String(method.id), methodData: { active: !method.active } }));
    dispatch(getWithdrawMethods());
  };

  const handleToggleDefault = async (method: any) => {
    await dispatch(updateWithdrawMethod({ methodId: String(method.id), methodData: { defaultMethod: !method.defaultMethod } }));
    dispatch(getWithdrawMethods());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Withdraw Method List</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(setMethodFilter("all"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            methodFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => dispatch(setMethodFilter("active"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            methodFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => dispatch(setMethodFilter("inactive"))}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            methodFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                value={methodSearchQuery}
                onChange={(e) => dispatch(setMethodSearchQuery(e.target.value))}
                placeholder="Search here by Method"
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
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Search
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Total Methods: {methods.length}</div>
            <button
              onClick={() => router.push("/admin/withdraw/methods/new")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              + Add Method
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            Unable to load withdraw methods from server. Ensure backend endpoints are implemented. Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Method Name</th>
                <th className="px-4 py-3 text-left">Method Fields</th>
                <th className="px-4 py-3 text-left">Default Method</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(isLoading ? [] : filtered).map((method, idx) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{method.methodName}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {method.methodFields?.slice(0, 4).map((field, fIdx) => (
                        <div key={fIdx} className="text-xs text-gray-600">
                          <span className="font-medium">Field Name:</span> {field.fieldName} |{" "}
                          <span className="font-medium">Type:</span> {field.inputType} |{" "}
                          <span className="font-medium">Placeholder:</span> {field.placeholder} |{" "}
                          <span className="font-medium">Is Required:</span> {field.isRequired ? "Yes" : "No"}
                        </div>
                      ))}
                      {method.methodFields && method.methodFields.length > 4 && (
                        <div className="text-teal-600 cursor-pointer hover:underline text-xs">
                          See All →
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleDefault(method)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        method.defaultMethod ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          method.defaultMethod ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(method)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        method.active ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          method.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/withdraw/methods/${method.id}/edit`)}
                      className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    No withdraw methods found.
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

