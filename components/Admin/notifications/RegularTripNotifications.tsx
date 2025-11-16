"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getNotificationRegularTrip,
  updateNotificationRegularTrip,
} from "@/utils/reducers/adminReducers";

export default function RegularTripNotifications() {
  const dispatch = useAppDispatch();
  const { regularTrip, isLoading, error } = useAppSelector((s) => s.notification);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Default customer notifications
  const defaultCustomerNotifications = {
    tripStarted: { enabled: true, message: "Your trip is started." },
    tripCompleted: { enabled: true, message: "Your trip is completed." },
    tripCanceled: { enabled: true, message: "Your trip is cancelled." },
    tripPaused: { enabled: true, message: "Trip request is paused." },
    driverCanceledRideRequest: { enabled: true, message: "Driver has canceled your ride." },
    paymentSuccessful: {
      enabled: true,
      message: "{paidAmount} payment successful on this trip by {methodName}.",
    },
  };

  // Default driver notifications
  const defaultDriverNotifications = {
    newRideRequest: { enabled: true, message: "You have a new ride request." },
    bidAccepted: { enabled: true, message: "Customer confirmed your bid." },
    tripRequestCanceled: { enabled: true, message: "A trip request is cancelled." },
    customerCanceledTrip: { enabled: true, message: "Customer just declined a request." },
    tripRequestCanceledByCustomer: { enabled: true, message: "A trip request is cancelled." },
    bidRequestCanceledByCustomer: {
      enabled: true,
      message: "Customer has canceled your bid request.",
    },
    receivedNewBid: { enabled: true, message: "Received a new bid request." },
    tipsFromCustomer: {
      enabled: true,
      message: "Customer has given the tips {tipsAmount} with payment.",
    },
    customerRejectedBid: {
      enabled: true,
      message: "We regret to inform you that your bid request for trip ID {tripId} has been rejected by the customer.",
    },
  };

  const [customerNotifications, setCustomerNotifications] = useState(defaultCustomerNotifications);
  const [driverNotifications, setDriverNotifications] = useState(defaultDriverNotifications);

  useEffect(() => {
    dispatch(getNotificationRegularTrip()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (regularTrip) {
      if (regularTrip.customer) {
        setCustomerNotifications({ ...defaultCustomerNotifications, ...regularTrip.customer });
      }
      if (regularTrip.driver) {
        setDriverNotifications({ ...defaultDriverNotifications, ...regularTrip.driver });
      }
    }
  }, [regularTrip]);

  const handleNotificationChange = (
    type: "customer" | "driver",
    key: string,
    field: "enabled" | "message",
    value: boolean | string
  ) => {
    if (type === "customer") {
      setCustomerNotifications({
        ...customerNotifications,
        [key]: { ...customerNotifications[key as keyof typeof customerNotifications], [field]: value },
      });
    } else {
      setDriverNotifications({
        ...driverNotifications,
        [key]: { ...driverNotifications[key as keyof typeof driverNotifications], [field]: value },
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const data = {
        customer: customerNotifications,
        driver: driverNotifications,
      };
      const result = await dispatch(updateNotificationRegularTrip(data));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Regular trip notifications saved successfully!");
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

      {/* Customer Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Customer</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup push notifications for the regular trip status updates to customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="Trip Started"
            notification={customerNotifications.tripStarted}
            onChange={(field, value) => handleNotificationChange("customer", "tripStarted", field, value)}
          />
          <NotificationCard
            title="Trip Completed"
            notification={customerNotifications.tripCompleted}
            onChange={(field, value) => handleNotificationChange("customer", "tripCompleted", field, value)}
          />
          <NotificationCard
            title="Trip Canceled"
            notification={customerNotifications.tripCanceled}
            onChange={(field, value) => handleNotificationChange("customer", "tripCanceled", field, value)}
          />
          <NotificationCard
            title="Trip Paused"
            notification={customerNotifications.tripPaused}
            onChange={(field, value) => handleNotificationChange("customer", "tripPaused", field, value)}
          />
          <NotificationCard
            title="Driver Canceled Ride Request"
            notification={customerNotifications.driverCanceledRideRequest}
            onChange={(field, value) =>
              handleNotificationChange("customer", "driverCanceledRideRequest", field, value)
            }
          />
          <NotificationCard
            title="Payment Successful"
            notification={customerNotifications.paymentSuccessful}
            onChange={(field, value) => handleNotificationChange("customer", "paymentSuccessful", field, value)}
          />
        </div>
      </div>

      {/* Driver Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Driver</h3>
          <p className="text-sm text-gray-600 mt-1">
            Setup push notifications for the regular trip status updates to drivers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            title="New Ride Request"
            notification={driverNotifications.newRideRequest}
            onChange={(field, value) => handleNotificationChange("driver", "newRideRequest", field, value)}
          />
          <NotificationCard
            title="Bid Accepted"
            notification={driverNotifications.bidAccepted}
            onChange={(field, value) => handleNotificationChange("driver", "bidAccepted", field, value)}
          />
          <NotificationCard
            title="Trip Request Canceled"
            notification={driverNotifications.tripRequestCanceled}
            onChange={(field, value) => handleNotificationChange("driver", "tripRequestCanceled", field, value)}
          />
          <NotificationCard
            title="Customer Canceled Trip"
            notification={driverNotifications.customerCanceledTrip}
            onChange={(field, value) => handleNotificationChange("driver", "customerCanceledTrip", field, value)}
          />
          <NotificationCard
            title="Trip Request Canceled By Customer"
            notification={driverNotifications.tripRequestCanceledByCustomer}
            onChange={(field, value) =>
              handleNotificationChange("driver", "tripRequestCanceledByCustomer", field, value)
            }
          />
          <NotificationCard
            title="Bid Request Canceled By Customer"
            notification={driverNotifications.bidRequestCanceledByCustomer}
            onChange={(field, value) =>
              handleNotificationChange("driver", "bidRequestCanceledByCustomer", field, value)
            }
          />
          <NotificationCard
            title="Received New Bid"
            notification={driverNotifications.receivedNewBid}
            onChange={(field, value) => handleNotificationChange("driver", "receivedNewBid", field, value)}
          />
          <NotificationCard
            title="Tips From Customer"
            notification={driverNotifications.tipsFromCustomer}
            onChange={(field, value) => handleNotificationChange("driver", "tipsFromCustomer", field, value)}
          />
          <NotificationCard
            title="Customer Rejected Bid"
            notification={driverNotifications.customerRejectedBid}
            onChange={(field, value) => handleNotificationChange("driver", "customerRejectedBid", field, value)}
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

