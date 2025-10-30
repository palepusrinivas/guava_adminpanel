"use client";
import React from "react";

export default function AdminDebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Debug Page</h1>
        <p className="text-gray-600 mb-4">This page is working correctly!</p>
        <div className="space-y-2">
          <p><strong>Current URL:</strong> /admin/debug</p>
          <p><strong>Status:</strong> ✅ Admin routing is working</p>
          <p><strong>Next Step:</strong> Try accessing /admin/login</p>
        </div>
        <div className="mt-6">
          <a 
            href="/admin/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
