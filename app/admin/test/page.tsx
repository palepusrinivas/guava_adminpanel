"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { adminLogin } from "@/utils/slices/adminSlice";
import { getUsers, getDrivers, getPricing } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";

export default function AdminTestPage() {
  const dispatch = useAppDispatch();
  const { admin, token, isLoading, error } = useAppSelector((state) => state.admin);
  // Map of test name -> result string (keeps typing strict and avoids implicit any)
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const testAdminLogin = async () => {
    try {
      const response = await dispatch(adminLogin({ username: "admin", password: "admin123" }));
      if (adminLogin.fulfilled.match(response)) {
        toast.success("Admin login test successful");
  setTestResults(prev => ({ ...prev, login: "✅ Success" }));
      } else {
        toast.error("Admin login test failed");
  setTestResults(prev => ({ ...prev, login: "❌ Failed" }));
      }
    } catch (error) {
      toast.error("Admin login test error");
  setTestResults(prev => ({ ...prev, login: "❌ Error" }));
    }
  };

  const testGetUsers = async () => {
    try {
      const response = await dispatch(getUsers({ page: 0, size: 5 }));
      if (getUsers.fulfilled.match(response)) {
        toast.success("Get users test successful");
  setTestResults(prev => ({ ...prev, users: "✅ Success" }));
      } else {
        toast.error("Get users test failed");
  setTestResults(prev => ({ ...prev, users: "❌ Failed" }));
      }
    } catch (error) {
      toast.error("Get users test error");
  setTestResults(prev => ({ ...prev, users: "❌ Error" }));
    }
  };

  const testGetDrivers = async () => {
    try {
      const response = await dispatch(getDrivers({ page: 0, size: 5 }));
      if (getDrivers.fulfilled.match(response)) {
        toast.success("Get drivers test successful");
  setTestResults(prev => ({ ...prev, drivers: "✅ Success" }));
      } else {
        toast.error("Get drivers test failed");
  setTestResults(prev => ({ ...prev, drivers: "❌ Failed" }));
      }
    } catch (error) {
      toast.error("Get drivers test error");
  setTestResults(prev => ({ ...prev, drivers: "❌ Error" }));
    }
  };

  const testGetPricing = async () => {
    try {
      const response = await dispatch(getPricing());
      if (getPricing.fulfilled.match(response)) {
        toast.success("Get pricing test successful");
  setTestResults(prev => ({ ...prev, pricing: "✅ Success" }));
      } else {
        toast.error("Get pricing test failed");
  setTestResults(prev => ({ ...prev, pricing: "❌ Failed" }));
      }
    } catch (error) {
      toast.error("Get pricing test error");
  setTestResults(prev => ({ ...prev, pricing: "❌ Error" }));
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testAdminLogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetUsers();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetDrivers();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetPricing();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel API Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Authentication</h3>
              <p className="text-sm text-gray-600">
                {isLoading ? "Loading..." : token ? "✅ Authenticated" : "❌ Not authenticated"}
              </p>
              {admin && (
                <p className="text-sm text-gray-600">User: {admin.username} ({admin.role})</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Backend Connection</h3>
              <p className="text-sm text-gray-600">Base URL: http://localhost:8080</p>
              <p className="text-sm text-gray-600">Status: {error ? "❌ Error" : "✅ Ready"}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">API Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testAdminLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Test Admin Login
            </button>
            <button
              onClick={testGetUsers}
              disabled={!token}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Test Get Users
            </button>
            <button
              onClick={testGetDrivers}
              disabled={!token}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Test Get Drivers
            </button>
            <button
              onClick={testGetPricing}
              disabled={!token}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Test Get Pricing
            </button>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Run All Tests
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Test Results</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-900 capitalize">{test}</span>
                  <span className="text-sm">{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">API Endpoints</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div><strong>Admin Login:</strong> POST http://localhost:8080/api/v1/admin/login</div>
              <div><strong>Get Users:</strong> GET http://localhost:8080/api/admin/users</div>
              <div><strong>Get Drivers:</strong> GET http://localhost:8080/api/admin/drivers</div>
              <div><strong>Get Pricing:</strong> GET http://localhost:8080/api/v1/admin/pricing</div>
              <div><strong>Get Zones:</strong> GET http://localhost:8080/api/admin/zones</div>
              <div><strong>Fleet Locations:</strong> GET http://localhost:8080/api/admin/fleet/locations</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This test page helps verify that the admin panel can connect to your backend API.</p>
          <p>Make sure your backend is running on http://localhost:8080 before running tests.</p>
        </div>
      </div>
    </div>
  );
}
