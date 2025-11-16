"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getLandingPageSetup, updateLandingPageSetup } from "@/utils/reducers/adminReducers";

interface StatItem {
  id: string;
  icon?: string;
  count: string;
  content: string;
}

export default function BusinessStatistics() {
  const dispatch = useAppDispatch();
  const { landingPageSetup, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatItem[]>([
    { id: "1", count: "", content: "" },
    { id: "2", count: "", content: "" },
    { id: "3", count: "", content: "" },
    { id: "4", count: "", content: "" },
  ]);

  useEffect(() => {
    dispatch(getLandingPageSetup()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (landingPageSetup?.businessStatistics) {
      setStats(landingPageSetup.businessStatistics);
    }
  }, [landingPageSetup]);

  const handleIconUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setStats(stats.map((s) => (s.id === id ? { ...s, icon: reader.result as string } : s)));
    };
    reader.readAsDataURL(file);
  };

  const handleStatChange = (id: string, field: "count" | "content", value: string) => {
    setStats(stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const updateData = {
        ...landingPageSetup,
        businessStatistics: stats,
      };
      const result = await dispatch(updateLandingPageSetup(updateData));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Business statistics saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save. Ensure backend API is ready.");
    }
  };

  const statLabels = [
    "Total Download",
    "Complete Ride",
    "Happy Customer",
    "24/7 Support",
  ];

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">BUSINESS STATISTIC</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <div key={stat.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">{statLabels[index]}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon / Image (1:1)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {stat.icon ? (
                      <div className="relative">
                        <img src={stat.icon} alt="Icon" className="w-24 h-24 mx-auto object-contain rounded-lg mb-2" />
                        <button
                          onClick={() => document.getElementById(`iconUpload-${stat.id}`)?.click()}
                          className="absolute top-0 right-0 bg-teal-600 text-white p-1 rounded-full hover:bg-teal-700"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <label
                          htmlFor={`iconUpload-${stat.id}`}
                          className="cursor-pointer mt-2 inline-block text-sm text-gray-600"
                        >
                          Upload Image
                        </label>
                        <input
                          id={`iconUpload-${stat.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleIconUpload(stat.id, e)}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {statLabels[index]} Count
                  </label>
                  <input
                    type="text"
                    value={stat.count}
                    onChange={(e) => handleStatChange(stat.id, "count", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ex: 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {statLabels[index]} Content
                  </label>
                  <input
                    type="text"
                    value={stat.content}
                    onChange={(e) => handleStatChange(stat.id, "content", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder={`Ex: ${statLabels[index]}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? "Saving..." : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}

