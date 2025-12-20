"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getDashboardStats, getRecentActivities, getLeaderboardData } from "@/utils/reducers/adminReducers";
import Link from "next/link";
import type { Driver, Transaction, Trip } from "@/types/dashboard";

interface DashboardState {
  stats: {
    data: {
      totalUsers: number;
      activeDrivers: number;
      totalRides: number;
      totalRevenue: number;
      percentageChanges: {
        users: number;
        drivers: number;
        rides: number;
        revenue: number;
      };
    } | null;
    isLoading: boolean;
    error: string | null;
  };
  recentActivities: {
    items: any[];
    isLoading: boolean;
    error: string | null;
  };
  leaderboard: {
    drivers: Driver[];
    isLoading: boolean;
    error: string | null;
  };
  transactions: {
    items: Transaction[];
    isLoading: boolean;
    error: string | null;
  };
  trips: {
    items: Trip[];
    isLoading: boolean;
    error: string | null;
  };
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const { admin } = useAppSelector((state) => state.admin);
  const dashboardData = useAppSelector(
    (state) => state.adminDashboard as DashboardState | undefined
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const { stats, recentActivities, leaderboard, transactions, trips } =
    dashboardData || {};

  const token = useAppSelector((state) => state.admin.token);

  useEffect(() => {
    // Only fetch data if we have a token
    if (token) {
      dispatch(getDashboardStats());
      dispatch(getRecentActivities({ limit: 5 }));
      dispatch(getLeaderboardData({ timeframe: 'week' }));
    }
  }, [dispatch, token]);

  const renderError = (error: string, title: string) => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h2 className="text-lg font-medium text-yellow-800 mb-2">{title}</h2>
      <p className="text-sm text-yellow-700">
        {error === "Server error (500)" || 
         error === "This feature is not available on the server (501)" ||
         error.includes("500") ||
         error.includes("501") ||
         error.includes("404")
          ? "This feature requires backend API implementation. The dashboard will display data once the backend endpoints are ready."
          : error === "Failed to fetch dashboard stats" ||
            error === "Failed to calculate dashboard stats" ||
            error === "Failed to fetch recent activities"
          ? "This feature is currently unavailable. Please try again later."
          : error}
      </p>
    </div>
  );

  const statCards =
    stats && stats.data
      ? [
          {
            name: "Total Users",
            value: stats.data.totalUsers ?? 0,
            change: `${stats.data.percentageChanges.users ?? 0}%`,
            changeType:
              (stats.data.percentageChanges.users ?? 0) >= 0
                ? "positive"
                : "negative",
            icon: "👥",
          },
          {
            name: "Active Drivers",
            value: stats.data.activeDrivers ?? 0,
            change: `${stats.data.percentageChanges.drivers ?? 0}%`,
            changeType:
              (stats.data.percentageChanges.drivers ?? 0) >= 0
                ? "positive"
                : "negative",
            icon: "🚗",
          },
          {
            name: "Total Rides",
            value: stats.data.totalRides ?? 0,
            change: `${stats.data.percentageChanges.rides ?? 0}%`,
            changeType:
              (stats.data.percentageChanges.rides ?? 0) >= 0
                ? "positive"
                : "negative",
            icon: "🚀",
          },
          {
            name: "Revenue",
            value: `₹${(stats.data.totalRevenue ?? 0).toLocaleString()}`,
            change: `${stats.data.percentageChanges.revenue ?? 0}%`,
            changeType:
              (stats.data.percentageChanges.revenue ?? 0) >= 0
                ? "positive"
                : "negative",
            icon: "💰",
          },
        ]
      : [];

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Welcome back, {admin?.username}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your ride-sharing platform today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {!stats ? (
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
      ) : stats.error ? (
        renderError(stats.error, "Dashboard Stats Unavailable")
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.isLoading
            ? Array(4)
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
                ))
            : statCards.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                            <div
                              className={`ml-2 flex items-baseline text-sm font-semibold ${
                                stat.changeType === "positive"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Leader Boards and Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Drivers</h3>
              {leaderboard && !leaderboard.isLoading && !leaderboard.error && (
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  onChange={(e) =>
                    dispatch(
                      getLeaderboardData({
                        timeframe: e.target.value as 'today' | 'week' | 'month' | 'all',
                      })
                    )
                  }
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              )}
            </div>
            {!leaderboard ? (
              <div className="animate-pulse space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
              </div>
            ) : leaderboard.error ? (
              renderError(leaderboard.error, "Leaderboard Unavailable")
            ) : leaderboard.isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.drivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.rides || 0} rides • ₹{(driver.earnings || 0).toLocaleString()}{" "}
                        earned
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {driver.rating} ⭐
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md lg:col-span-2">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activities
            </h3>
            {!recentActivities ? (
              <div className="animate-pulse space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
              </div>
            ) : recentActivities.error ? (
              renderError(recentActivities.error, "Recent Activities Unavailable")
            ) : recentActivities.isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.items.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "RIDE"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "USER"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "DRIVER"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {activity.type === "RIDE"
                        ? "🚗"
                        : activity.type === "USER"
                        ? "👤"
                        : activity.type === "DRIVER"
                        ? "🚘"
                        : "📝"}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toUTCString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              👥
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-500">
              View and manage user accounts
            </p>
          </div>
        </Link>

        <Link
          href="/admin/drivers"
          className="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              🚗
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Manage Drivers
            </h3>
            <p className="text-sm text-gray-500">
              View and manage driver accounts
            </p>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Payment Gateway</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Tracking System</span>
          </div>
        </div>
      </div>
    </div>
  );
}