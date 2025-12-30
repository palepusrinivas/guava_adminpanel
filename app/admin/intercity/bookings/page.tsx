"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getIntercityBookings,
  getIntercityBookingById,
  cancelIntercityBooking,
  confirmIntercityBooking,
  assignDriverToBooking,
  getAvailableDrivers,
  updateBookingCommission,
} from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import type { IntercityBookingStatus, IntercityBooking } from "@/utils/slices/intercitySlice";
import { formatDateTimeIST } from "@/utils/dateUtils";

const BOOKING_STATUSES: { value: IntercityBookingStatus | "ALL"; label: string; color: string }[] = [
  { value: "ALL", label: "All Bookings", color: "bg-gray-100 text-gray-700" },
  { value: "HOLD", label: "Hold", color: "bg-orange-100 text-orange-700" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "REFUNDED", label: "Refunded", color: "bg-gray-100 text-gray-700" },
];

export default function IntercityBookingsPage() {
  const dispatch = useAppDispatch();
  const { bookings, bookingsPage, selectedBooking, isLoading, error } = useAppSelector(
    (state) => state.intercity
  );
  const [mounted, setMounted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IntercityBookingStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [confirmingBookingId, setConfirmingBookingId] = useState<number | null>(null);
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [editingCommissionBookingId, setEditingCommissionBookingId] = useState<number | null>(null);
  const [commissionPercentage, setCommissionPercentage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const params: { status?: IntercityBookingStatus; page: number; size: number } = {
        page: currentPage,
        size: 10,
      };
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      dispatch(getIntercityBookings(params));
    }
  }, [dispatch, mounted, selectedStatus, currentPage]);

  const handleViewDetails = async (bookingId: number) => {
    try {
      await dispatch(getIntercityBookingById(bookingId));
      setShowDetailModal(true);
    } catch {
      toast.error("Failed to load booking details");
    }
  };

  const handleOpenCancelModal = (bookingId: number) => {
    setCancellingBookingId(bookingId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;

    try {
      const result = await dispatch(
        cancelIntercityBooking({
          bookingId: cancellingBookingId,
          reason: cancelReason || "Admin cancelled",
        })
      );
      if (cancelIntercityBooking.fulfilled.match(result)) {
        toast.success("Booking cancelled successfully!");
        setShowCancelModal(false);
        setCancellingBookingId(null);
        dispatch(getIntercityBookings({ page: currentPage, size: 10 }));
      } else {
        toast.error("Failed to cancel booking");
      }
    } catch {
      toast.error("An error occurred while cancelling booking");
    }
  };

  const handleOpenConfirmModal = (bookingId: number) => {
    setConfirmingBookingId(bookingId);
    setPaymentMethod("ONLINE");
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!confirmingBookingId) return;

    try {
      const result = await dispatch(
        confirmIntercityBooking({
          bookingId: confirmingBookingId,
          paymentMethod: paymentMethod,
        })
      );
      if (confirmIntercityBooking.fulfilled.match(result)) {
        toast.success("Booking confirmed successfully! Driver phone number is now visible.");
        setShowConfirmModal(false);
        setConfirmingBookingId(null);
        dispatch(getIntercityBookings({ page: currentPage, size: 10 }));
      } else {
        toast.error("Failed to confirm booking");
      }
    } catch {
      toast.error("An error occurred while confirming booking");
    }
  };

  const handleOpenAssignDriverModal = async (bookingId: number) => {
    setAssigningBookingId(bookingId);
    setSelectedDriverId(null);
    setShowAssignDriverModal(true);
    setLoadingDrivers(true);
    
    try {
      const result = await dispatch(getAvailableDrivers());
      if (getAvailableDrivers.fulfilled.match(result)) {
        setAvailableDrivers(result.payload as any[]);
      } else {
        toast.error("Failed to load drivers");
      }
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleUpdateCommission = async () => {
    if (!editingCommissionBookingId) return;

    try {
      const result = await dispatch(
        updateBookingCommission({
          bookingId: editingCommissionBookingId,
          commissionPercentage: parseFloat(commissionPercentage),
        })
      );
      if (updateBookingCommission.fulfilled.match(result)) {
        toast.success("Commission updated successfully!");
        setShowCommissionModal(false);
        setEditingCommissionBookingId(null);
        dispatch(getIntercityBookings({ page: currentPage, size: 10 }));
      } else {
        toast.error("Failed to update commission");
      }
    } catch {
      toast.error("An error occurred while updating commission");
    }
  };

  const handleAssignDriver = async () => {
    if (!assigningBookingId || !selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    try {
      const result = await dispatch(
        assignDriverToBooking({
          bookingId: assigningBookingId,
          driverId: selectedDriverId,
        })
      );
      if (assignDriverToBooking.fulfilled.match(result)) {
        toast.success("Driver assigned successfully!");
        setShowAssignDriverModal(false);
        setAssigningBookingId(null);
        setSelectedDriverId(null);
        dispatch(getIntercityBookings({ page: currentPage, size: 10 }));
      } else {
        toast.error("Failed to assign driver");
      }
    } catch {
      toast.error("An error occurred while assigning driver");
    }
  };

  const getStatusBadge = (status: IntercityBookingStatus) => {
    const statusConfig = BOOKING_STATUSES.find((s) => s.value === status);
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusConfig?.color || "bg-gray-100 text-gray-700"
        }`}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return formatDateTimeIST(dateString, {
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
          <h1 className="text-3xl font-bold text-teal-700">Booking Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage intercity booking requests from customers
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {BOOKING_STATUSES.map((status) => (
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

      {/* Bookings Table */}
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
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">
              {selectedStatus !== "ALL"
                ? `No ${selectedStatus.toLowerCase()} bookings at the moment.`
                : "No intercity bookings have been made yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.id}
                      </div>
                      {booking.bookingCode && (
                        <div className="text-xs text-gray-500">{booking.bookingCode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.userName || `User #${booking.userId}`}
                      </div>
                      {booking.userPhone && (
                        <div className="text-xs text-gray-500">{booking.userPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Trip #{booking.tripId}</div>
                      {booking.pickupPoint && (
                        <div className="text-xs text-gray-500">
                          {booking.pickupPoint} → {booking.dropPoint || "N/A"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.seatCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.totalAmount}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{booking.pricePerSeat}/seat
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.paymentMethod && (
                        <div className="text-xs text-gray-500 mb-1">
                          {booking.paymentMethod}
                        </div>
                      )}
                      {booking.paymentStatus && (
                        <div className={`text-xs font-medium ${
                          booking.paymentStatus === 'COMPLETED' ? 'text-green-600' : 
                          booking.paymentStatus === 'PENDING' ? 'text-yellow-600' : 
                          'text-gray-600'
                        }`}>
                          {booking.paymentStatus}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{booking.commissionAmount || "0.00"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.commissionAmount && booking.totalAmount
                          ? `${((booking.commissionAmount / booking.totalAmount) * 100).toFixed(1)}%`
                          : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status || booking.bookingStatus || "PENDING")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(booking.id)}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          View
                        </button>
                        {(booking.status === "HOLD" || booking.status === "PENDING") && (
                          <>
                            <button
                              onClick={() => handleOpenConfirmModal(booking.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleOpenAssignDriverModal(booking.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Assign Driver
                            </button>
                          </>
                        )}
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <button
                            onClick={() => handleOpenCancelModal(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCommissionBookingId(booking.id);
                            setCommissionPercentage(
                              booking.commissionAmount && booking.totalAmount
                                ? ((booking.commissionAmount / booking.totalAmount) * 100).toFixed(2)
                                : "5.00"
                            );
                            setShowCommissionModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit Commission"
                        >
                          💰
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {bookingsPage && bookingsPage.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {bookingsPage.number + 1} of {bookingsPage.totalPages} (
              {bookingsPage.totalElements} total bookings)
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
                onClick={() =>
                  setCurrentPage(Math.min(bookingsPage.totalPages - 1, currentPage + 1))
                }
                disabled={currentPage >= bookingsPage.totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Booking Details #{selectedBooking.id}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Booking Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Booking Status</span>
                  {getStatusBadge(selectedBooking.status || selectedBooking.bookingStatus || "PENDING")}
                </div>
                {selectedBooking.bookingCode && (
                  <div className="text-xs text-gray-600 mt-1">
                    Code: <span className="font-mono font-semibold">{selectedBooking.bookingCode}</span>
                  </div>
                )}
                {selectedBooking.bookingType && (
                  <div className="text-xs text-gray-600 mt-1">
                    Type: <span className="font-semibold">{selectedBooking.bookingType}</span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  👤 User Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">Name</span>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedBooking.user?.name || selectedBooking.userName || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Phone</span>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedBooking.user?.phone || selectedBooking.userPhone || "N/A"}
                    </div>
                  </div>
                  {(selectedBooking.user?.email || selectedBooking.userEmail) && (
                    <div>
                      <span className="text-xs text-gray-500">Email</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.user?.email || selectedBooking.userEmail}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500">User ID</span>
                    <div className="text-sm font-medium text-gray-900">
                      #{selectedBooking.user?.userId || selectedBooking.userId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              {(selectedBooking.trip?.route || (selectedBooking.pickupPoint && selectedBooking.dropPoint)) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🛤️ Route Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.trip?.route?.routeCode && (
                      <div>
                        <span className="text-xs text-gray-500">Route Code</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.route.routeCode}
                        </div>
                      </div>
                    )}
                    {(selectedBooking.trip?.route?.originName || selectedBooking.pickupPoint) && (
                      <div>
                        <span className="text-xs text-gray-500">Origin</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip?.route?.originName || selectedBooking.pickupPoint}
                        </div>
                      </div>
                    )}
                    {(selectedBooking.trip?.route?.destinationName || selectedBooking.dropPoint) && (
                      <div>
                        <span className="text-xs text-gray-500">Destination</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip?.route?.destinationName || selectedBooking.dropPoint}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip?.route?.distanceKm && (
                      <div>
                        <span className="text-xs text-gray-500">Distance</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.route.distanceKm} km
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip?.route?.estimatedDurationMinutes && (
                      <div>
                        <span className="text-xs text-gray-500">Duration</span>
                        <div className="text-sm font-medium text-gray-900">
                          {Math.floor(selectedBooking.trip.route.estimatedDurationMinutes / 60)}h {selectedBooking.trip.route.estimatedDurationMinutes % 60}m
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🚗 Trip Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">Trip ID</span>
                    <div className="text-sm font-medium text-gray-900">
                      #{selectedBooking.tripId}
                    </div>
                  </div>
                  {selectedBooking.trip?.tripCode && (
                    <div>
                      <span className="text-xs text-gray-500">Trip Code</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip.tripCode}
                      </div>
                    </div>
                  )}
                  {selectedBooking.trip?.tripStatus && (
                    <div>
                      <span className="text-xs text-gray-500">Trip Status</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip.tripStatus}
                      </div>
                    </div>
                  )}
                  {(selectedBooking.trip?.pickupAddress || selectedBooking.pickupPoint) && (
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">📍 Pickup Address</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip?.pickupAddress || selectedBooking.pickupPoint}
                      </div>
                      {selectedBooking.trip?.pickupLatitude && selectedBooking.trip?.pickupLongitude && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedBooking.trip.pickupLatitude}, {selectedBooking.trip.pickupLongitude}
                        </div>
                      )}
                    </div>
                  )}
                  {(selectedBooking.trip?.dropAddress || selectedBooking.dropPoint) && (
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">📍 Drop Address</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip?.dropAddress || selectedBooking.dropPoint}
                      </div>
                      {selectedBooking.trip?.dropLatitude && selectedBooking.trip?.dropLongitude && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedBooking.trip.dropLatitude}, {selectedBooking.trip.dropLongitude}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedBooking.trip?.scheduledDeparture && (
                    <div>
                      <span className="text-xs text-gray-500">🚀 Scheduled Departure</span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(selectedBooking.trip.scheduledDeparture)}
                      </div>
                    </div>
                  )}
                  {selectedBooking.trip?.totalSeats && (
                    <div>
                      <span className="text-xs text-gray-500">Seats</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip.seatsBooked || 0} / {selectedBooking.trip.totalSeats}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver Details */}
              {selectedBooking.trip?.driver && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    👨‍✈️ Driver Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.trip.driver.name && (
                      <div>
                        <span className="text-xs text-gray-500">Name</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.driver.name}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.phone && (
                      <div>
                        <span className="text-xs text-gray-500">Phone</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.driver.phone}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.vehicleNumber && (
                      <div>
                        <span className="text-xs text-gray-500">Vehicle Number</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.driver.vehicleNumber}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.vehicleModel && (
                      <div>
                        <span className="text-xs text-gray-500">Vehicle Model</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.driver.vehicleModel}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.rating && (
                      <div>
                        <span className="text-xs text-gray-500">Rating</span>
                        <div className="text-sm font-medium text-gray-900">
                          ⭐ {selectedBooking.trip.driver.rating.toFixed(1)}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.totalTrips !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500">Total Trips</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.driver.totalTrips}
                        </div>
                      </div>
                    )}
                    {selectedBooking.trip.driver.driverId && (
                      <div>
                        <span className="text-xs text-gray-500">Driver ID</span>
                        <div className="text-sm font-medium text-gray-900">
                          #{selectedBooking.trip.driver.driverId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              {selectedBooking.trip?.vehicleType && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🚙 Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Vehicle Type</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.trip.vehicleType}
                      </div>
                    </div>
                    {selectedBooking.trip.vehicleDisplayName && (
                      <div>
                        <span className="text-xs text-gray-500">Display Name</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.trip.vehicleDisplayName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  💳 Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">Seats Booked</span>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedBooking.seatsBooked || selectedBooking.seatCount || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Price per Seat</span>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{selectedBooking.perSeatAmount || selectedBooking.pricePerSeat || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Amount</span>
                    <div className="text-sm font-semibold text-gray-900 text-lg">
                      ₹{selectedBooking.totalAmount || 0}
                    </div>
                  </div>
                  {selectedBooking.commissionAmount && (
                    <div>
                      <span className="text-xs text-gray-500">Commission</span>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{selectedBooking.commissionAmount}
                        {selectedBooking.totalAmount && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({((selectedBooking.commissionAmount / selectedBooking.totalAmount) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedBooking.paymentMethod && (
                    <div>
                      <span className="text-xs text-gray-500">Payment Method</span>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.paymentMethod}
                      </div>
                    </div>
                  )}
                  {selectedBooking.paymentStatus && (
                    <div>
                      <span className="text-xs text-gray-500">Payment Status</span>
                      <div className={`text-sm font-medium ${
                        selectedBooking.paymentStatus === 'COMPLETED' ? 'text-green-600' : 
                        selectedBooking.paymentStatus === 'PENDING' ? 'text-yellow-600' : 
                        'text-gray-900'
                      }`}>
                        {selectedBooking.paymentStatus}
                      </div>
                    </div>
                  )}
                  {selectedBooking.razorpayOrderId && (
                    <div>
                      <span className="text-xs text-gray-500">Razorpay Order ID</span>
                      <div className="text-sm font-mono text-gray-900">
                        {selectedBooking.razorpayOrderId}
                      </div>
                    </div>
                  )}
                  {selectedBooking.razorpayPaymentId && (
                    <div>
                      <span className="text-xs text-gray-500">Razorpay Payment ID</span>
                      <div className="text-sm font-mono text-gray-900">
                        {selectedBooking.razorpayPaymentId}
                      </div>
                    </div>
                  )}
                  {selectedBooking.commissionAmount && (
                    <div>
                      <span className="text-xs text-gray-500">Commission Amount</span>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{selectedBooking.commissionAmount}
                        {selectedBooking.totalAmount && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({((selectedBooking.commissionAmount / selectedBooking.totalAmount) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* OTP & Onboarding */}
              {(selectedBooking.otp || selectedBooking.otpVerified !== undefined || selectedBooking.passengersOnboarded) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🔐 OTP & Onboarding
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.otp && (
                      <div>
                        <span className="text-xs text-gray-500">OTP</span>
                        <div className="text-sm font-mono font-semibold text-gray-900">
                          {selectedBooking.otp}
                        </div>
                      </div>
                    )}
                    {selectedBooking.otpVerified !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500">OTP Verified</span>
                        <div className={`text-sm font-medium ${
                          selectedBooking.otpVerified ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {selectedBooking.otpVerified ? '✅ Yes' : '⏳ No'}
                        </div>
                      </div>
                    )}
                    {selectedBooking.otpVerifiedAt && (
                      <div>
                        <span className="text-xs text-gray-500">Verified At</span>
                        <div className="text-sm text-gray-900">
                          {formatDateTime(selectedBooking.otpVerifiedAt)}
                        </div>
                      </div>
                    )}
                    {selectedBooking.passengersOnboarded !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500">Passengers Onboarded</span>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBooking.passengersOnboarded}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seat Details */}
              {selectedBooking.seats && selectedBooking.seats.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🪑 Seat Details
                  </h4>
                  <div className="space-y-2">
                    {selectedBooking.seats.map((seat, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">Seat {seat.seatNumber}</span>
                          <span className={`px-2 py-1 rounded ${
                            seat.status === 'BOOKED' ? 'bg-green-100 text-green-700' :
                            seat.status === 'LOCKED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {seat.status}
                          </span>
                        </div>
                        <div className="mt-1 text-gray-600">
                          {seat.passengerName} ({seat.passengerPhone}) - ₹{seat.pricePaid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {selectedBooking.status === 'CANCELLED' && selectedBooking.cancelledAt && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                    ❌ Cancellation Details
                  </h4>
                  <div className="text-sm text-gray-900">
                    Cancelled at: {formatDateTime(selectedBooking.cancelledAt)}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  ⏰ Timestamps
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <span className="block mb-1">Created</span>
                    <span className="font-medium text-gray-700">{formatDateTime(selectedBooking.createdAt)}</span>
                  </div>
                  <div>
                    <span className="block mb-1">Updated</span>
                    <span className="font-medium text-gray-700">{formatDateTime(selectedBooking.updatedAt)}</span>
                  </div>
                  {selectedBooking.confirmedAt && (
                    <div>
                      <span className="block mb-1">Confirmed</span>
                      <span className="font-medium text-green-700">{formatDateTime(selectedBooking.confirmedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.cancelledAt && (
                    <div>
                      <span className="block mb-1">Cancelled</span>
                      <span className="font-medium text-red-700">{formatDateTime(selectedBooking.cancelledAt)}</span>
                    </div>
                  )}
                  {selectedBooking.otpVerifiedAt && (
                    <div>
                      <span className="block mb-1">OTP Verified</span>
                      <span className="font-medium text-blue-700">{formatDateTime(selectedBooking.otpVerifiedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.confirmedAt && (
                    <div>
                      <span className="block mb-1">Confirmed</span>
                      <span className="font-medium text-gray-700">{formatDateTime(selectedBooking.confirmedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Booking Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Booking</h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmingBookingId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Confirm this booking? This will move it from HOLD to CONFIRMED status and unlock the driver phone number.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="ONLINE">Online</option>
                  <option value="UPI">UPI</option>
                  <option value="WALLET">Wallet</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmingBookingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Driver</h3>
              <button
                onClick={() => {
                  setShowAssignDriverModal(false);
                  setAssigningBookingId(null);
                  setSelectedDriverId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a driver to assign to this booking/trip.
              </p>

              {loadingDrivers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading drivers...</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver
                  </label>
                  <select
                    value={selectedDriverId || ""}
                    onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.mobile}) {driver.isOnline ? "🟢 Online" : "⚫ Offline"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAssignDriverModal(false);
                    setAssigningBookingId(null);
                    setSelectedDriverId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={isLoading || !selectedDriverId || loadingDrivers}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Assigning..." : "Assign Driver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel booking #{cancellingBookingId}? The customer will
                be notified.
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
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Edit Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Commission</h3>
              <button
                onClick={() => {
                  setShowCommissionModal(false);
                  setEditingCommissionBookingId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Update commission percentage for booking #{editingCommissionBookingId}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  placeholder="Enter commission percentage"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter percentage (e.g., 5.0 for 5%)</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommissionModal(false);
                    setEditingCommissionBookingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCommission}
                  disabled={isLoading || !commissionPercentage}
                  className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Commission"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

