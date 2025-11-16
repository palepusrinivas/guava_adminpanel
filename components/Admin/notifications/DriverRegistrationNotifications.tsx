"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getNotificationDriverRegistration,
  updateNotificationDriverRegistration,
} from "@/utils/reducers/adminReducers";

export default function DriverRegistrationNotifications() {
  const dispatch = useAppDispatch();
  const { driverRegistration, isLoading, error } = useAppSelector((s) => s.notification);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultDriverNotifications = {
    registrationApproved: {
      enabled: true,
      message: "Admin approved your registration. You can login now.",
    },
    vehicleRequestApproved: { enabled: true, message: "Your vehicle is approved by admin." },
    vehicleRequestDenied: { enabled: true, message: "Your vehicle request is denied." },
    identityImageRejected: {
      enabled: true,
      message: "Your identity image update request is rejected.",
    },
    identityImageApproved: {
      enabled: true,
      message: "Your identity image update request is approved.",
    },
    vehicleActive: { enabled: true, message: "Your vehicle status has been activated by admin." },
  };

  const [driverNotifications, setDriverNotifications] = useState(defaultDriverNotifications);

  useEffect(() => {
    dispatch(getNotificationDriverRegistration()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (driverRegistration?.driver) {
      setDriverNotifications({ ...defaultDriverNotifications, ...driverRegistration.driver });
    }
  }, [driverRegistration]);

  const handleNotificationChange = (key: string, field: "enabled" | "message", value: boolean | string) => {
    setDriverNotifications({
      ...driverNotifications,
      [key]: { ...driverNotifications[key as keyof typeof driverNotifications], [field]: value },
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const data = { driver: driverNotifications };
      const result = await dispatch(updateNotificationDriverRegistration(data));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Driver registration notifications saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        throw new Error((result as any).payload || "Failed to save");
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save. Ensure backend API is ready.");
    }
  };

  const NotificationCard = ({
    title,
    notification,
    onChange,
  }: {
    title: string;
    notification: { enabled: boolean; message: string };
    onChange: (field: "enabled" | "message", value: boolean | string) => void;
  }) => (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <button
          onClick={() => onChange("enabled", !notification.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notification.enabled ? "bg-teal-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notification.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <textarea
        value={notification.message}
        onChange={(e) => onChange("message", e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none resize-y"
      />
    </div>
  );

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
          Unable to load notifications from server. Displaying sample data. Error: {error}
        </div>
      )}

      {/* Driver Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Driver</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup notification for registration approved messages to drivers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Registration Approved"
            notification={driverNotifications.registrationApproved}
            onChange={(field, value) => handleNotificationChange("registrationApproved", field, value)}
          />
          <NotificationCard
            title="Vehicle Request Approved"
            notification={driverNotifications.vehicleRequestApproved}
            onChange={(field, value) => handleNotificationChange("vehicleRequestApproved", field, value)}
          />
          <NotificationCard
            title="Vehicle Request Denied"
            notification={driverNotifications.vehicleRequestDenied}
            onChange={(field, value) => handleNotificationChange("vehicleRequestDenied", field, value)}
          />
          <NotificationCard
            title="Identity Image Rejected"
            notification={driverNotifications.identityImageRejected}
            onChange={(field, value) => handleNotificationChange("identityImageRejected", field, value)}
          />
          <NotificationCard
            title="Identity Image Approved"
            notification={driverNotifications.identityImageApproved}
            onChange={(field, value) => handleNotificationChange("identityImageApproved", field, value)}
          />
          <NotificationCard
            title="Vehicle Active"
            notification={driverNotifications.vehicleActive}
            onChange={(field, value) => handleNotificationChange("vehicleActive", field, value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

