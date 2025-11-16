"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getLandingPageSetup, updateLandingPageSetup } from "@/utils/reducers/adminReducers";

export default function IntroSection() {
  const dispatch = useAppDispatch();
  const { landingPageSetup, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [introData, setIntroData] = useState({
    title: "",
    subTitle: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: null as string | null,
  });

  useEffect(() => {
    dispatch(getLandingPageSetup()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (landingPageSetup?.introSection) {
      setIntroData(landingPageSetup.introSection);
    }
  }, [landingPageSetup]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setIntroData({ ...introData, backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const updateData = {
        ...landingPageSetup,
        introSection: introData,
      };
      const result = await dispatch(updateLandingPageSetup(updateData));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Intro section saved successfully!");
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
          Unable to load data. Displaying sample form. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Intro Section</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={introData.title}
              onChange={(e) => setIntroData({ ...introData, title: e.target.value })}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter title..."
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{introData.title.length}/100</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={introData.subTitle}
              onChange={(e) => setIntroData({ ...introData, subTitle: e.target.value })}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter sub title..."
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{introData.subTitle.length}/200</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={introData.buttonText}
              onChange={(e) => setIntroData({ ...introData, buttonText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Ex: Get Started"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
            <input
              type="url"
              value={introData.buttonLink}
              onChange={(e) => setIntroData({ ...introData, buttonLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              * Generate The Link For The Intro Section Button From The CTA Tab.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {introData.backgroundImage ? (
                <div className="relative">
                  <img
                    src={introData.backgroundImage}
                    alt="Background preview"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <button
                    onClick={() => document.getElementById("bgUpload")?.click()}
                    className="absolute top-2 right-2 bg-teal-600 text-white p-1.5 rounded-full hover:bg-teal-700"
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
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <label
                    htmlFor="bgUpload"
                    className="cursor-pointer mt-4 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Upload Image
                  </label>
                  <input
                    id="bgUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIntroData({ title: "", subTitle: "", buttonText: "", buttonLink: "", backgroundImage: null })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              RESET
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Saving..." : "SAVE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

