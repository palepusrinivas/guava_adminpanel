"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/utils/store/store";
import { setActiveTab } from "@/utils/slices/businessSlice";

interface BusinessManagementProps {
  children: React.ReactNode;
}

const tabs = [
  { id: "info", label: "Business Info", path: "/admin/business/setup/info" },
  { id: "driver", label: "Driver", path: "/admin/business/setup/driver" },
  { id: "customer", label: "Customer", path: "/admin/business/setup/customer" },
  { id: "penalty", label: "Fare & Penalty Settings", path: "/admin/business/setup/trip-fare/penalty" },
  { id: "trips", label: "Trips", path: "/admin/business/setup/trip-fare/trips" },
  { id: "settings", label: "Settings", path: "/admin/business/setup/info/settings" },
  { id: "parcel", label: "Parcel", path: "/admin/business/setup/parcel" },
  { id: "refund", label: "Refund", path: "/admin/business/setup/refund" },
  { id: "safety", label: "Safety & Precautions", path: "/admin/business/setup/safety" },
  { id: "referral", label: "Referral earning", path: "/admin/business/setup/referral" },
];

export default function BusinessManagement({ children }: BusinessManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Determine active tab based on pathname
    const activeTab = tabs.find((tab) => pathname.includes(tab.path)) || tabs[0];
    dispatch(setActiveTab(activeTab.id));
  }, [pathname, dispatch]);

  const getActiveTab = () => {
    const tab = tabs.find((tab) => pathname.includes(tab.path));
    return tab?.id || "info";
  };

  const handleTabClick = (tabPath: string) => {
    router.push(tabPath);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Business Management</h2>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex items-center space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = getActiveTab() === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Chatting setup link */}
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => router.push("/admin/business/setup/chatting")}
            className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
          >
            Chatting setup
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

