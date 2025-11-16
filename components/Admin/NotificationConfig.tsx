"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/utils/store/store";
import { setActiveTab, setActiveNotificationType } from "@/utils/slices/notificationSlice";
import RegularTripNotifications from "./notifications/RegularTripNotifications";
import ParcelNotifications from "./notifications/ParcelNotifications";
import DriverRegistrationNotifications from "./notifications/DriverRegistrationNotifications";
import OtherNotifications from "./notifications/OtherNotifications";
import FirebaseConfiguration from "./notifications/FirebaseConfiguration";

const notificationTypes = [
  { id: "regular-trip", label: "Regular Trip", component: RegularTripNotifications },
  { id: "parcel", label: "Parcel", component: ParcelNotifications },
  { id: "driver-registration", label: "Driver Registration", component: DriverRegistrationNotifications },
  { id: "other", label: "Other", component: OtherNotifications },
];

export default function NotificationConfig() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Determine active tab and notification type from pathname
  const isFirebaseConfig = pathname.includes("/firebase-configuration");
  const activeNotificationType = notificationTypes.find((type) => pathname.includes(type.id))?.id || "regular-trip";

  useEffect(() => {
    dispatch(setActiveTab(isFirebaseConfig ? "firebase-configuration" : "notification-message"));
    dispatch(setActiveNotificationType(activeNotificationType as any));
  }, [pathname, dispatch, isFirebaseConfig, activeNotificationType]);

  const handleMainTabClick = (tab: "notification-message" | "firebase-configuration") => {
    if (tab === "notification-message") {
      router.push("/admin/business/configuration/notification/regular-trip");
    } else {
      router.push("/admin/business/configuration/notification/firebase-configuration");
    }
  };

  const handleNotificationTypeClick = (typeId: string) => {
    router.push(`/admin/business/configuration/notification/${typeId}`);
  };

  const ActiveNotificationComponent = isFirebaseConfig
    ? FirebaseConfiguration
    : notificationTypes.find((t) => t.id === activeNotificationType)?.component || RegularTripNotifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex items-center space-x-1 p-2 border-b border-gray-200">
          <button
            onClick={() => handleMainTabClick("notification-message")}
            className={`px-4 py-2 font-medium transition-all ${
              !isFirebaseConfig
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Notification Message
          </button>
          <button
            onClick={() => handleMainTabClick("firebase-configuration")}
            className={`px-4 py-2 font-medium transition-all ${
              isFirebaseConfig
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Firebase Configuration
          </button>
        </div>

        {/* Sub-navigation for Notification Message */}
        {!isFirebaseConfig && (
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-1">
              {notificationTypes.map((type) => {
                const isActive = activeNotificationType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleNotificationTypeClick(type.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-teal-600 transition-colors">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                i
              </div>
              <span>Read Instruction</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <ActiveNotificationComponent />
    </div>
  );
}

