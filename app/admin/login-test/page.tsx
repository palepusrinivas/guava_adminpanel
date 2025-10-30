"use client";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { adminLogin } from "@/utils/slices/adminSlice";

export default function LoginTestPage() {
  const dispatch = useAppDispatch();
  const { admin, token, isLoading, error } = useAppSelector((state) => state.admin);
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin123" });

  const handleLogin = async () => {
    try {
      const response = await dispatch(adminLogin(credentials));
      console.log("Login response:", response);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Login Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {token ? "✅ Present" : "❌ Missing"}</p>
            <p><strong>Admin:</strong> {admin ? `✅ ${admin.username} (${admin.role})` : "❌ Not logged in"}</p>
            <p><strong>Loading:</strong> {isLoading ? "⏳ Yes" : "✅ No"}</p>
            <p><strong>Error:</strong> {error || "✅ None"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Test Login"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">API Endpoints</h2>
          <div className="text-sm space-y-1">
            <p><strong>Login:</strong> POST http://localhost:8080/api/v1/admin/login</p>
            <p><strong>Users:</strong> GET http://localhost:8080/api/admin/users</p>
            <p><strong>Drivers:</strong> GET http://localhost:8080/api/admin/drivers</p>
            <p><strong>Fleet:</strong> GET http://localhost:8080/api/admin/fleet/locations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
