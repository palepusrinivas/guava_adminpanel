"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getNotificationOther, updateNotificationOther } from "@/utils/reducers/adminReducers";

export default function OtherNotifications() {
  const dispatch = useAppDispatch();
  const { other, isLoading, error } = useAppSelector((s) => s.notification);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultOtherNotifications = {
    coupon: {
      couponApplied: { enabled: true, message: "Customer got discount of." },
      couponRemoved: { enabled: false, message: "Customer removed previously applied coupon." },
    },
    review: {
      reviewFromCustomer: {
        enabled: false,
        message: "New review from a customer! See what they had to say about your service.",
      },
      reviewFromDriver: {
        enabled: true,
        message: "New review from a driver! See what he had to say about your trip.",
      },
    },
    referral: {
      someoneUsedYourCode: {
        enabled: false,
        message:
          "Your code was successfully used by a friend. You'll receive your reward after their first ride is completed.",
      },
      referralRewardReceived: {
        enabled: true,
        message:
          "You've successfully received {referralRewardAmount} reward. You can use this amount on your next ride.",
      },
    },
    safetyAlert: {
      safetyAlertSent: { enabled: false, message: "Safety Alert Sent." },
      safetyProblemResolved: { enabled: true, message: "Safety Problem Resolved." },
    },
    businessPage: {
      termsAndConditionsUpdated: {
        enabled: false,
        message: "Admin just updated system terms and conditions.",
      },
      privacyPolicyUpdated: {
        enabled: true,
        message: "Admin just updated our privacy policy.",
      },
    },
  };

  const [otherNotifications, setOtherNotifications] = useState(defaultOtherNotifications);

  useEffect(() => {
    dispatch(getNotificationOther()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (other) {
      const merged: typeof defaultOtherNotifications = {
        coupon: { ...defaultOtherNotifications.coupon, ...(other.coupon || {}) },
        review: { ...defaultOtherNotifications.review, ...(other.review || {}) },
        referral: { ...defaultOtherNotifications.referral, ...(other.referral || {}) },
        safetyAlert: { ...defaultOtherNotifications.safetyAlert, ...(other.safetyAlert || {}) },
        businessPage: { ...defaultOtherNotifications.businessPage, ...(other.businessPage || {}) },
      };
      setOtherNotifications(merged);
    }
  }, [other]);

  const handleNotificationChange = (
    section: string,
    key: string,
    field: "enabled" | "message",
    value: boolean | string
  ) => {
    setOtherNotifications({
      ...otherNotifications,
      [section]: {
        ...otherNotifications[section as keyof typeof otherNotifications],
        [key]: {
          ...(otherNotifications[section as keyof typeof otherNotifications] as any)[key],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const result = await dispatch(updateNotificationOther(otherNotifications));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Other notifications saved successfully!");
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

      {/* Coupon Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Coupon</h3>
          <p className="text-sm text-gray-600 mt-1">Setup notification applying Coupon.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Coupon Applied"
            notification={otherNotifications.coupon.couponApplied}
            onChange={(field, value) => handleNotificationChange("coupon", "couponApplied", field, value)}
          />
          <NotificationCard
            title="Coupon Removed"
            notification={otherNotifications.coupon.couponRemoved}
            onChange={(field, value) => handleNotificationChange("coupon", "couponRemoved", field, value)}
          />
        </div>
      </div>

      {/* Review Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Review</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup the review notification from customer and drivers in different cases.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Review From Customer"
            notification={otherNotifications.review.reviewFromCustomer}
            onChange={(field, value) => handleNotificationChange("review", "reviewFromCustomer", field, value)}
          />
          <NotificationCard
            title="Review From Driver"
            notification={otherNotifications.review.reviewFromDriver}
            onChange={(field, value) => handleNotificationChange("review", "reviewFromDriver", field, value)}
          />
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Referral</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup the Referral notification from your code and referral reward in different cases.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Someone Used Your Code"
            notification={otherNotifications.referral.someoneUsedYourCode}
            onChange={(field, value) => handleNotificationChange("referral", "someoneUsedYourCode", field, value)}
          />
          <NotificationCard
            title="Referral Reward Received"
            notification={otherNotifications.referral.referralRewardReceived}
            onChange={(field, value) =>
              handleNotificationChange("referral", "referralRewardReceived", field, value)
            }
          />
        </div>
      </div>

      {/* Safety Alert Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Safety Alert</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup the safety alert notification for safety alert and problem solved.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Safety Alert Sent"
            notification={otherNotifications.safetyAlert.safetyAlertSent}
            onChange={(field, value) => handleNotificationChange("safetyAlert", "safetyAlertSent", field, value)}
          />
          <NotificationCard
            title="Safety Problem Resolved"
            notification={otherNotifications.safetyAlert.safetyProblemResolved}
            onChange={(field, value) =>
              handleNotificationChange("safetyAlert", "safetyProblemResolved", field, value)
            }
          />
        </div>
      </div>

      {/* Business Page Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Business Page</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup notification to users when updating any of the business pages.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Terms And Conditions Updated"
            notification={otherNotifications.businessPage.termsAndConditionsUpdated}
            onChange={(field, value) =>
              handleNotificationChange("businessPage", "termsAndConditionsUpdated", field, value)
            }
          />
          <NotificationCard
            title="Privacy Policy Updated"
            notification={otherNotifications.businessPage.privacyPolicyUpdated}
            onChange={(field, value) =>
              handleNotificationChange("businessPage", "privacyPolicyUpdated", field, value)
            }
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

