"use client";
import React, { useState } from "react";
import { Trip, TripStatistics, TripStatus } from "@/utils/slices/tripManagementSlice";

interface TripManagementProps {
  trips: Trip[];
  statistics: TripStatistics;
  isLoading: boolean;
  error: string | null;
  onStatusChange: (status: TripStatus) => void;
  onSearch: (searchTerm: string) => void;
  onDateFilterChange: (filter: string) => void;
  currentStatus: TripStatus;
}

const TripManagement: React.FC<TripManagementProps> = ({
  trips,
  statistics,
  isLoading,
  error,
  onStatusChange,
  onSearch,
  onDateFilterChange,
  currentStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-teal-100 text-teal-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returning":
        return "bg-purple-100 text-purple-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: TripStatus): string => {
    switch (status) {
      case "pending":
        return "🕒";
      case "accepted":
        return "💰";
      case "ongoing":
        return "📡";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      case "returning":
        return "↩️";
      case "returned":
        return "✓";
      default:
        return "🚗";
    }
  };

  const statusTabs: { label: string; value: TripStatus }[] = [
    { label: "All Trips", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Returning", value: "returning" },
    { label: "Returned", value: "returned" },
  ];

  const statisticsCards = [
    { label: "Pending", value: statistics.pending, icon: "🕒", status: "pending" as TripStatus },
    { label: "Accepted", value: statistics.accepted, icon: "💰", status: "accepted" as TripStatus },
    { label: "Ongoing", value: statistics.ongoing, icon: "📡", status: "ongoing" as TripStatus },
    { label: "Completed", value: statistics.completed, icon: "✅", status: "completed" as TripStatus },
    { label: "Cancelled", value: statistics.cancelled, icon: "❌", status: "cancelled" as TripStatus },
    { label: "Returning", value: statistics.returning, icon: "↩️", status: "returning" as TripStatus },
    { label: "Returned", value: statistics.returned, icon: "✓", status: "returned" as TripStatus },
  ];

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="bg-teal-600 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        <div className="flex flex-wrap gap-2 p-4">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentStatus === tab.value
                  ? "bg-white text-teal-700 shadow-md"
                  : "bg-teal-700 text-white hover:bg-teal-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">TRIPS STATISTICS</h2>
          <select
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statisticsCards.map((card) => (
            <button
              key={card.status}
              onClick={() => onStatusChange(card.status)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{card.icon}</div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-gray-700">
            Total Trips: <span className="text-teal-600">{statistics.total}</span>
          </p>
        </div>
      </div>

      {/* All Trips Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {currentStatus === "all" ? "All Trips" : `${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)} Trips`}
          </h3>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search here by Trip ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                🔍 Search
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                🔄
              </button>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Time filter"
              >
                🕒
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
              >
                Download ▼
              </button>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔧 Filter
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="ml-4 text-gray-600">Loading trips...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 font-medium mb-2">⚠️ Error loading trips</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">📭 No trips found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Cost (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Discount (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Fee (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Trip Cost (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Commission (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip, index) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.tripId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(trip.date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trip.driverName || (
                        <span className="text-red-600 italic">No Driver Assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trip.tripType === "ride_request"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {trip.tripType === "ride_request" ? "Ride request" : "Parcel"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trip.tripCost)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trip.couponDiscount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delay Fee:</span>
                          <span>{formatCurrency(trip.delayFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Idle Fee:</span>
                          <span>{formatCurrency(trip.idleFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cancellation Fee:</span>
                          <span>{formatCurrency(trip.cancellationFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vat/Tax:</span>
                          <span>{formatCurrency(trip.vatTax)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(trip.totalTripCost)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trip.adminCommission)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.tripPayment)}`}>
                        {trip.tripPayment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripManagement;


