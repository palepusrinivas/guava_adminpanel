"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusinessPage, updateBusinessPage, uploadPageBanner } from "@/utils/reducers/adminReducers";
import { setActivePageType } from "@/utils/slices/pagesMediaSlice";

const pageTypes = [
  { id: "about_us", label: "About Us", icon: "📄" },
  { id: "privacy_policy", label: "Privacy Policy", icon: "🔒" },
  { id: "terms_and_conditions", label: "Terms And Conditions", icon: "📋" },
  { id: "refund_policy", label: "Refund Policy", icon: "💰" },
  { id: "legal", label: "Legal", icon: "⚖️" },
];

export default function BusinessPages() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { businessPages, isLoading, error, activePageType } = useAppSelector((s) => s.pagesMedia);
  
  const [activeTab, setActiveTab] = useState<string>("about_us");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get("type") || "about_us";
    const pageType = pageTypes.find((p) => p.id === type)?.id || "about_us";
    setActiveTab(pageType);
    dispatch(setActivePageType(pageType));
    dispatch(getBusinessPage(pageType)).catch(() => {});
  }, [searchParams, dispatch]);

  // Default content for each page type
  const defaultContent: { [key: string]: { shortDescription: string; longDescription: string } } = {
    about_us: {
      shortDescription:
        "with safe, fast, and affordable auto rickshaws and bike rides, right from their mobile phone. Our mission is simple: to make local travel easy, reliable, and accessible for everyone.",
      longDescription:
        "Founded in Amalapuram, GAUVA started with a clear vision – to bring digital convenience to local transport. In many small towns, getting a ride was a challenge. We wanted to change that by using technology to provide smart, app-based bookings for autos and bikes.\n\n**What We Offer**\n• Instant Auto & Bike Booking through the app\n• Safe & Verified Drivers\n• Live Ride Tracking",
    },
    privacy_policy: {
      shortDescription:
        "Privacy Policy At GAUVA MOBILITY SERVICES, we are committed to protecting your personal data. We collect limited information like name, phone number, location, and ride history to provide safe and smooth service. Your data is never sold or misused. We use top-level security to keep your information private.",
      longDescription:
        "GAUVA MOBILITY SERVICES - Privacy Policy\n\nAt **GAUVA MOBILITY SERVICES**, your privacy and trust are important to us. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our mobile application or website.\n\n**1. Information We Collect**\n\nWe may collect the following types of personal information:",
    },
    terms_and_conditions: {
      shortDescription:
        "Terms & Conditions By using GAUVA MOBILITY SERVICES, you agree to follow our rules. Bookings must be made through the app. Cancellations, payments, and ride usage should be fair. Misuse, fake bookings, or abusive behavior may lead to account suspension. Always follow safety and legal guidelines during rides.",
      longDescription:
        "GAUVA MOBILITY SERVICES - Terms & Conditions\n\nThese Terms & Conditions (\"Terms\") govern your use of **GAUVA MOBILITY SERVICES** (\"we\", \"us\", or \"our\"), including the app, website, and services. Please read them carefully before using our platform.\n\n**1. Acceptance of Terms**\n\nBy registering, using, or accessing GAUVA, you agree to be bound by these Terms. If you do not agree, please do not use the app.",
    },
    refund_policy: {
      shortDescription:
        "GAUVA MOBILITY SERVICES provides refunds only in special cases like ride cancellation by the driver, double payment, or failed trips. Refunds are processed within 5-7 business days after review. All refund requests must be reported through the app or customer support within 24 hours.",
      longDescription:
        "**GAUVA MOBILITY SERVICES – Refund Policy**\n\nWe at **GAUVA MOBILITY SERVICES** value your time, trust, and money. This Refund Policy outlines when and how refunds are issued to customers using our platform for auto and bike ride bookings.\n\n**1. Eligibility for Refund**\n\nRefunds are issued only under the following conditions:\n• Ride Cancelled by Driver: If your driver cancels and no replacement is found.",
    },
    legal: {
      shortDescription:
        "Legal Disclaimer GAUVA MOBILITY SERVICES is a digital platform that connects passengers with local auto and bike drivers. We are not responsible for delays, driver actions, or third-party issues during the ride. All users must follow traffic and safety laws. GAUVA reserves the right to suspend accounts that misuse the platform.",
      longDescription:
        "GAUVA MOBILITY SERVICES - Legal Disclaimer\n\n**1. Platform Nature**\n\nGAUVA MOBILITY SERVICES (\"GAUVA\", \"we\", \"our\", or \"us\") is a digital platform that helps users book bike and auto rides through our mobile application. We do not own or operate vehicles directly; all transportation is provided by third-party independent drivers registered on our platform.\n\n**2. Service Limitation**",
    },
  };

  useEffect(() => {
    const currentPage = businessPages[activePageType];
    if (currentPage) {
      setShortDescription(currentPage.shortDescription || "");
      setLongDescription(currentPage.longDescription || "");
      setBannerImage(currentPage.bannerImage || null);
      setBannerPreview(currentPage.bannerImage || null);
    } else if (defaultContent[activePageType]) {
      // Use default content if no data from API
      setShortDescription(defaultContent[activePageType].shortDescription);
      setLongDescription(defaultContent[activePageType].longDescription);
    }
  }, [businessPages, activePageType]);

  const handleTabChange = (pageType: string) => {
    setActiveTab(pageType);
    dispatch(setActivePageType(pageType));
    router.push(`/admin/business/pages-media/business-page?type=${pageType}`);
    dispatch(getBusinessPage(pageType)).catch(() => {});
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please upload an image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Image size must be less than 2MB");
      return;
    }

    try {
      setSubmitError(null);
      const result = await dispatch(uploadPageBanner({ pageType: activeTab, file }));
      if ((result as any).meta.requestStatus === "fulfilled") {
        const imageUrl = (result as any).payload?.bannerImage;
        setBannerImage(imageUrl);
        setBannerPreview(imageUrl);
        setSubmitSuccess("Banner uploaded successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to upload banner");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to upload banner. Ensure backend API is ready.");
      // Preview locally for demo
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const pageData = {
        shortDescription,
        longDescription,
        bannerImage: bannerImage || bannerPreview,
      };
      const result = await dispatch(updateBusinessPage({ pageType: activeTab, pageData }));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Page saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save page");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save page. Ensure backend API is ready.");
    }
  };

  const getPageTitle = () => {
    const page = pageTypes.find((p) => p.id === activeTab);
    return page?.label || "Business Page";
  };

  const getPageIcon = () => {
    const icons: { [key: string]: string } = {
      about_us: "📄",
      privacy_policy: "🔒",
      terms_and_conditions: "📋",
      refund_policy: "💰",
      legal: "⚖️",
    };
    return icons[activeTab] || "📄";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Business Pages</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 text-sm">
          Unable to load page data from server. Displaying sample data. Ensure backend endpoints are implemented. Error: {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex items-center space-x-1 p-2 overflow-x-auto">
          {pageTypes.map((page) => {
            const isActive = activeTab === page.id;
            return (
              <button
                key={page.id}
                onClick={() => handleTabChange(page.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-2xl">{getPageIcon()}</span>
          <h3 className="text-lg font-bold text-gray-900">{getPageTitle()} Page</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Short Description & Long Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <textarea
                value={shortDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 800) {
                    setShortDescription(e.target.value);
                  }
                }}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Enter short description..."
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{shortDescription.length}/800</div>
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Simple Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center space-x-2 flex-wrap">
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("bold")}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("italic")}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("underline")}
                    title="Underline"
                  >
                    <u>U</u>
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("insertUnorderedList")}
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("insertOrderedList")}
                    title="Numbered List"
                  >
                    1. List
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("justifyLeft")}
                    title="Align Left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("justifyCenter")}
                    title="Center"
                  >
                    =
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-gray-200 rounded text-sm"
                    onClick={() => document.execCommand("justifyRight")}
                    title="Align Right"
                  >
                    →
                  </button>
                </div>
                <textarea
                  id="longDescriptionEditor"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  placeholder="Enter long description..."
                />
              </div>
            </div>
          </div>

          {/* Right Column - Page Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Banner</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <button
                    onClick={() => document.getElementById("bannerUpload")?.click()}
                    className="absolute top-2 right-2 bg-teal-600 text-white p-1.5 rounded-full hover:bg-teal-700"
                    title="Edit"
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
                <div className="py-8">
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
                  <div className="mt-4">
                    <label
                      htmlFor="bannerUpload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload File
                    </label>
                    <input
                      id="bannerUpload"
                      type="file"
                      accept="image/png"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 text-center">
                <p>Image format - png</p>
                <p>Image Size - maximum size 2 MB</p>
                <p>Image Ratio - 3:1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
          >
            {isLoading ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>
    </div>
  );
}

