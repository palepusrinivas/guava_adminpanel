"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getIntercityDashboard, getCommissionSetting, updateCommissionSetting } from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function IntercityDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, isLoading, error } = useAppSelector((state) => state.intercity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(getIntercityDashboard());
    }
  }, [dispatch, mounted]);

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

  const bookingStats = dashboard?.bookingsByStatus || {};
  const tripStats = dashboard?.tripsByStatus || {};

  const statCards = [
    {
      name: "Active Vehicle Types",
      value: dashboard?.activeVehicleTypes || 0,
      icon: "🚗",
      color: "bg-blue-100 text-blue-600",
      href: "/admin/intercity/vehicles",
    },
    {
      name: "Active Routes",
      value: dashboard?.activeRoutes || 0,
      icon: "🛤️",
      color: "bg-green-100 text-green-600",
      href: "/admin/intercity/routes",
    },
    {
      name: "Driver-Published Trips",
      value: dashboard?.driverPublishedTripsCount || 0,
      icon: "🚌",
      color: "bg-purple-100 text-purple-600",
      href: "/admin/intercity/trips?filter=driver-published",
    },
    {
      name: "Pending Bookings",
      value: bookingStats["PENDING"] || 0,
      icon: "📋",
      color: "bg-yellow-100 text-yellow-600",
      href: "/admin/intercity/bookings",
    },
    {
      name: "Confirmed Bookings",
      value: bookingStats["CONFIRMED"] || 0,
      icon: "✅",
      color: "bg-teal-100 text-teal-600",
      href: "/admin/intercity/bookings",
    },
  ];

  const tripStatusCards = [
    { status: "SCHEDULED", label: "Scheduled", color: "bg-indigo-100 text-indigo-700" },
    { status: "FILLING", label: "Filling", color: "bg-amber-100 text-amber-700" },
    { status: "DISPATCHED", label: "Dispatched", color: "bg-cyan-100 text-cyan-700" },
    { status: "IN_TRANSIT", label: "In Transit", color: "bg-purple-100 text-purple-700" },
    { status: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
    { status: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">Intercity Transport</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage intercity vehicle configurations, routes, trips, and bookings
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
              >
                <div className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-full ${stat.color}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Trip Status Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tripStatusCards.map((item) => (
            <div
              key={item.status}
              className={`p-4 rounded-lg ${item.color}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                {item.label}
              </p>
              <p className="text-2xl font-bold mt-1">
                {tripStats[item.status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/intercity/vehicles"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                🚗
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Vehicle Setup</h3>
              <p className="text-xs text-gray-500">Configure vehicle types & pricing</p>
            </div>
          </Link>

          <Link
            href="/admin/intercity/routes"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                🛤️
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Route Management</h3>
              <p className="text-xs text-gray-500">Create & manage travel routes</p>
            </div>
          </Link>

          <Link
            href="/admin/intercity/pricing"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                💰
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Pricing & Commission</h3>
              <p className="text-xs text-gray-500">Configure pricing & commission rates</p>
            </div>
          </Link>

          <Link
            href="/admin/intercity/trips"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                🚌
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Trip Management</h3>
              <p className="text-xs text-gray-500">View & dispatch trips</p>
            </div>
          </Link>

          <Link
            href="/admin/intercity/bookings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                📋
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Bookings</h3>
              <p className="text-xs text-gray-500">Manage customer bookings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Booking Status Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
            { status: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
            { status: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
            { status: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
            { status: "REFUNDED", label: "Refunded", color: "bg-gray-100 text-gray-700" },
          ].map((item) => (
            <div
              key={item.status}
              className={`p-4 rounded-lg ${item.color}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                {item.label}
              </p>
              <p className="text-2xl font-bold mt-1">
                {bookingStats[item.status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver-Published Trips Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Driver-Published Trips</h2>
          <Link
            href="/admin/intercity/trips?filter=driver-published"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View All →
          </Link>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex-1">
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                Total Driver-Published Trips
              </p>
              <p className="text-3xl font-bold text-indigo-900">
                {dashboard?.driverPublishedTripsCount || 0}
              </p>
            </div>
          </div>
        </div>

        {dashboard?.driverPublishedTripsByStatus && Object.keys(dashboard.driverPublishedTripsByStatus).length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">By Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {tripStatusCards.map((item) => {
                const count = dashboard.driverPublishedTripsByStatus?.[item.status] || 0;
                return (
                  <div
                    key={item.status}
                    className={`p-3 rounded-lg ${item.color} ${count === 0 ? "opacity-50" : ""}`}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No driver-published trips found</p>
            <p className="text-xs mt-1">Drivers can publish trips from their app</p>
          </div>
        )}
      </div>
    </div>
  );
}

