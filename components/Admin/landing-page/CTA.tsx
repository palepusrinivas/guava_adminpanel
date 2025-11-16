"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getLandingPageSetup, updateLandingPageSetup } from "@/utils/reducers/adminReducers";

export default function CTA() {
  const dispatch = useAppDispatch();
  const { landingPageSetup, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ctaData, setCtaData] = useState({
    title: "",
    subTitle: "",
    playstoreUserLink: "",
    playstoreDriverLink: "",
    appstoreUserLink: "",
    appstoreDriverLink: "",
    logo: null as string | null,
    backgroundImage: null as string | null,
  });

  useEffect(() => {
    dispatch(getLandingPageSetup()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (landingPageSetup?.cta) {
      setCtaData(landingPageSetup.cta);
    }
  }, [landingPageSetup]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCtaData({ ...ctaData, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCtaData({ ...ctaData, backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const updateData = {
        ...landingPageSetup,
        cta: ctaData,
      };
      const result = await dispatch(updateLandingPageSetup(updateData));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("CTA section saved successfully!");
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

      {/* CTA Text Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">CTA</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={ctaData.title}
              onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Gauva App Download Now"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{ctaData.title.length}/100</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Title</label>
            <input
              type="text"
              value={ctaData.subTitle}
              onChange={(e) => setCtaData({ ...ctaData, subTitle: e.target.value })}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Gauva App Download Now"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{ctaData.subTitle.length}/200</div>
          </div>
        </div>
      </div>

      {/* Playstore Button Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Playstore Button</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">User Download Link</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="url"
              value={ctaData.playstoreUserLink}
              onChange={(e) => setCtaData({ ...ctaData, playstoreUserLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://play.google.com/store/apps/details?id=com.gauva.userapp"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">Driver Download Link</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="url"
              value={ctaData.playstoreDriverLink}
              onChange={(e) => setCtaData({ ...ctaData, playstoreDriverLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://play.google.com/store/apps/details?id=com.gauva.driverapp"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={() =>
              setCtaData({
                ...ctaData,
                playstoreUserLink: "",
                playstoreDriverLink: "",
              })
            }
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            RESET
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            SAVE
          </button>
        </div>
      </div>

      {/* App Store Button Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">App Store Button</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">User Download Link</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="url"
              value={ctaData.appstoreUserLink}
              onChange={(e) => setCtaData({ ...ctaData, appstoreUserLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://apps.apple.com/app/id..."
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">Driver Download Link</label>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                i
              </div>
            </div>
            <input
              type="url"
              value={ctaData.appstoreDriverLink}
              onChange={(e) => setCtaData({ ...ctaData, appstoreDriverLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://apps.apple.com/app/id..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={() =>
              setCtaData({
                ...ctaData,
                appstoreUserLink: "",
                appstoreDriverLink: "",
              })
            }
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            RESET
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            SAVE
          </button>
        </div>
      </div>

      {/* Image Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">IMAGE SECTION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image 1:1</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {ctaData.logo ? (
                <div className="relative">
                  <img src={ctaData.logo} alt="Logo preview" className="w-full h-auto rounded-lg mb-2" />
                  <button
                    onClick={() => document.getElementById("logoUpload")?.click()}
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
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <label
                    htmlFor="logoUpload"
                    className="cursor-pointer mt-4 inline-block text-sm text-gray-600"
                  >
                    Upload Image
                  </label>
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/jpg,image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
                <p>Min Size for Better Resolution 408x408 px</p>
                <p>Image format : jpg png jpeg webp | Maximum size : 5MB</p>
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image 3:1</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {ctaData.backgroundImage ? (
                <div className="relative">
                  <img
                    src={ctaData.backgroundImage}
                    alt="Background preview"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <button
                    onClick={() => document.getElementById("bgImageUpload")?.click()}
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
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <label
                    htmlFor="bgImageUpload"
                    className="cursor-pointer mt-4 inline-block text-sm text-gray-600"
                  >
                    Upload Image
                  </label>
                  <input
                    id="bgImageUpload"
                    type="file"
                    accept="image/jpg,image/png,image/jpeg,image/webp"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setCtaData({ ...ctaData, logo: null, backgroundImage: null })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            RESET
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

