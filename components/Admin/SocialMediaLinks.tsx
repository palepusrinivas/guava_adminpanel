"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getSocialMediaLinks, updateSocialMediaLinks } from "@/utils/reducers/adminReducers";

export default function SocialMediaLinks() {
  const dispatch = useAppDispatch();
  const { socialMediaLinks, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [links, setLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });

  useEffect(() => {
    dispatch(getSocialMediaLinks()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (socialMediaLinks) {
      setLinks({
        facebook: socialMediaLinks.facebook || "",
        twitter: socialMediaLinks.twitter || "",
        instagram: socialMediaLinks.instagram || "",
        linkedin: socialMediaLinks.linkedin || "",
        youtube: socialMediaLinks.youtube || "",
      });
    }
  }, [socialMediaLinks]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const result = await dispatch(updateSocialMediaLinks(links));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Social media links saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save social media links");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save social media links. Ensure backend API is ready.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Social Media Links</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load social media links from server. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Social Media Links</h3>
        <p className="text-sm text-gray-600 mb-6">
          Add your social media profile links to display on your website and app.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="url"
              value={links.facebook}
              onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="url"
              value={links.twitter}
              onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="url"
              value={links.instagram}
              onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={links.linkedin}
              onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
            <input
              type="url"
              value={links.youtube}
              onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Saving..." : "Save Links"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

