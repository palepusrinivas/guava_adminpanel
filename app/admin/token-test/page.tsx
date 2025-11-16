"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/utils/store/store";
import adminAxios from "@/utils/axiosConfig";

export default function TokenTestPage() {
  const { admin, token } = useAppSelector((state) => state.admin);
  // Map test name -> result string to avoid implicit any when updating state
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const testTokenInRequest = async () => {
    try {
      // This will show us if the token is being added to requests
      const response = await adminAxios.get("https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net/api/admin/users?page=0&size=1");
    setTestResults(prev => ({ ...prev, tokenTest: "✅ Request successful with token" }));
    } catch (error: any) {
      if (error.response?.status === 401) {
  setTestResults(prev => ({ ...prev, tokenTest: "❌ 401 - Token missing or invalid" }));
      } else {
  setTestResults(prev => ({ ...prev, tokenTest: `❌ Error: ${error.message}` }));
      }
    }
  };

  const testWithoutToken = async () => {
    try {
      // This will fail without token
      const response = await adminAxios.get("https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net/api/admin/users?page=0&size=1");
  setTestResults(prev => ({ ...prev, noTokenTest: "✅ Request successful" }));
    } catch (error: any) {
      if (error.response?.status === 401) {
  setTestResults(prev => ({ ...prev, noTokenTest: "❌ 401 - No token (expected)" }));
      } else {
  setTestResults(prev => ({ ...prev, noTokenTest: `❌ Error: ${error.message}` }));
      }
    }
  };

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("adminToken");
    setTestResults(prev => ({ 
      ...prev, 
      storedToken: storedToken ? "✅ Token found in localStorage" : "❌ No token in localStorage",
      currentToken: token ? "✅ Token in Redux store" : "❌ No token in Redux store"
    }));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Bearer Token Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Admin:</strong> {admin ? `${admin.username} (${admin.role})` : "Not logged in"}</p>
              <p><strong>Token:</strong> {token ? "✅ Present" : "❌ Missing"}</p>
              <p><strong>Stored Token:</strong> {testResults.storedToken || "Checking..."}</p>
              <p><strong>Redux Token:</strong> {testResults.currentToken || "Checking..."}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">API Tests</h2>
            <div className="space-y-4">
              <button
                onClick={testTokenInRequest}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Test API with Token
              </button>
              <button
                onClick={testWithoutToken}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Test API without Token
              </button>
            </div>
          </div>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-900 capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm">{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="text-sm space-y-2">
            <p><strong>1. Login:</strong> Admin logs in and receives accessToken</p>
            <p><strong>2. Storage:</strong> Token is stored in localStorage as "adminToken"</p>
            <p><strong>3. Interceptor:</strong> adminAxios automatically adds "Authorization: Bearer {token}" to all requests</p>
            <p><strong>4. API Calls:</strong> All admin API calls now include the Bearer token</p>
            <p><strong>5. 401 Handling:</strong> If token is invalid/expired, user is redirected to login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
