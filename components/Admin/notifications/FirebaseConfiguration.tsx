"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getFirebaseConfiguration,
  updateFirebaseConfiguration,
} from "@/utils/reducers/adminReducers";

export default function FirebaseConfiguration() {
  const dispatch = useAppDispatch();
  const { firebaseConfiguration, isLoading, error } = useAppSelector((s) => s.notification);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });

  useEffect(() => {
    dispatch(getFirebaseConfiguration()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (firebaseConfiguration) {
      setConfig(firebaseConfiguration);
    }
  }, [firebaseConfiguration]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const result = await dispatch(updateFirebaseConfiguration(config));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Firebase configuration saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save. Ensure backend API is ready.");
    }
  };

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load Firebase configuration from server. Displaying sample form. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Firebase Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter Firebase API Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auth Domain</label>
            <input
              type="text"
              value={config.authDomain}
              onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter Auth Domain"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter Project ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
            <input
              type="text"
              value={config.storageBucket}
              onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter Storage Bucket"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Sender ID</label>
            <input
              type="text"
              value={config.messagingSenderId}
              onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter Messaging Sender ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter App ID"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

