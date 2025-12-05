"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getIntercityTrips,
  dispatchIntercityTrip,
  cancelIntercityTrip,
} from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import type { IntercityTripStatus } from "@/utils/slices/intercitySlice";

const TRIP_STATUSES: { value: IntercityTripStatus | "ALL"; label: string; color: string }[] = [
  { value: "ALL", label: "All Trips", color: "bg-gray-100 text-gray-700" },
  { value: "SCHEDULED", label: "Scheduled", color: "bg-indigo-100 text-indigo-700" },
  { value: "FILLING", label: "Filling", color: "bg-amber-100 text-amber-700" },
  { value: "DISPATCHED", label: "Dispatched", color: "bg-cyan-100 text-cyan-700" },
  { value: "IN_TRANSIT", label: "In Transit", color: "bg-purple-100 text-purple-700" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function IntercityTripsPage() {
  const dispatch = useAppDispatch();
  const { trips, tripsPage, isLoading, error } = useAppSelector((state) => state.intercity);
  const [mounted, setMounted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IntercityTripStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingTripId, setCancellingTripId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const params: { status?: IntercityTripStatus; page: number; size: number } = {
        page: currentPage,
        size: 10,
      };
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      dispatch(getIntercityTrips(params));
    }
  }, [dispatch, mounted, selectedStatus, currentPage]);

  const handleDispatch = async (tripId: number) => {
    if (window.confirm("Are you sure you want to dispatch this trip?")) {
      try {
        const result = await dispatch(dispatchIntercityTrip(tripId));
        if (dispatchIntercityTrip.fulfilled.match(result)) {
          toast.success("Trip dispatched successfully!");
          dispatch(getIntercityTrips({ page: currentPage, size: 10 }));
        } else {
          toast.error("Failed to dispatch trip");
        }
      } catch {
        toast.error("An error occurred while dispatching trip");
      }
    }
  };

  const handleOpenCancelModal = (tripId: number) => {
    setCancellingTripId(tripId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelTrip = async () => {
    if (!cancellingTripId) return;
    
    try {
      const result = await dispatch(
        cancelIntercityTrip({ tripId: cancellingTripId, reason: cancelReason || "Admin cancelled" })
      );
      if (cancelIntercityTrip.fulfilled.match(result)) {
        toast.success("Trip cancelled successfully!");
        setShowCancelModal(false);
        dispatch(getIntercityTrips({ page: currentPage, size: 10 }));
      } else {
        toast.error("Failed to cancel trip");
      }
    } catch {
      toast.error("An error occurred while cancelling trip");
    }
  };

  const getStatusBadge = (status: IntercityTripStatus) => {
    const statusConfig = TRIP_STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig?.color || "bg-gray-100 text-gray-700"}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">Trip Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage intercity trips - dispatch or cancel as needed
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {TRIP_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setSelectedStatus(status.value);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === status.value
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Trips Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trips Found</h3>
            <p className="text-gray-500">
              {selectedStatus !== "ALL"
                ? `No ${selectedStatus.toLowerCase().replace("_", " ")} trips at the moment.`
                : "No intercity trips have been created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{trip.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.vehicleType.replace(/_/g, " ")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trip.route ? (
                        <div>
                          <div className="text-sm text-gray-900">{trip.route.routeCode}</div>
                          <div className="text-xs text-gray-500">
                            {trip.route.originName} → {trip.route.destinationName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(trip.scheduledDeparture)}</div>
                      {trip.actualDeparture && (
                        <div className="text-xs text-green-600">
                          Actual: {formatDateTime(trip.actualDeparture)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trip.bookedSeats} / {trip.totalSeats}
                      </div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-teal-500 rounded-full"
                          style={{ width: `${(trip.bookedSeats / trip.totalSeats) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trip.driverName ? (
                        <div>
                          <div className="text-sm text-gray-900">{trip.driverName}</div>
                          {trip.vehicleNumber && (
                            <div className="text-xs text-gray-500">{trip.vehicleNumber}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trip.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {trip.status === "FILLING" && (
                        <button
                          onClick={() => handleDispatch(trip.id)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          Dispatch
                        </button>
                      )}
                      {(trip.status === "SCHEDULED" || trip.status === "FILLING") && (
                        <button
                          onClick={() => handleOpenCancelModal(trip.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {(trip.status === "DISPATCHED" || trip.status === "IN_TRANSIT") && (
                        <span className="text-gray-400">In progress</span>
                      )}
                      {(trip.status === "COMPLETED" || trip.status === "CANCELLED") && (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {tripsPage && tripsPage.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {tripsPage.number + 1} of {tripsPage.totalPages} ({tripsPage.totalElements} total trips)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(tripsPage.totalPages - 1, currentPage + 1))}
                disabled={currentPage >= tripsPage.totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cancel Trip</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel trip #{cancellingTripId}? This action cannot be undone.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cancellation Reason (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Keep Trip
                </button>
                <button
                  onClick={handleCancelTrip}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Cancelling..." : "Cancel Trip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

