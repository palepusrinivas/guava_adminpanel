"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/utils/store/store";
import HeatMap from "./HeatMap";

interface ErrorResponse {
  status?: number;
  error?: string;
  message: string;
  path?: string;
  timestamp?: string;
}

type ApiError = string | ErrorResponse | null;

const getErrorMessage = (error: ApiError): string => {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;
  return error.message || 'An unknown error occurred';
};

interface AnalyticsDashboardProps {
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  stats: {
    totalRides: number;
    totalRevenue: number;
    activeUsers: number;
    activeDrivers: number;
    averageRating: number;
    completionRate: number;
    isLoading: boolean;
    error: ErrorResponse | string | null;
  };
  summary: {
    periodStats: {
      today: { rides: number; revenue: number };
      yesterday: { rides: number; revenue: number };
      thisWeek: { rides: number; revenue: number };
      thisMonth: { rides: number; revenue: number };
    };
    topZones: Array<{ name: string; rides: number; revenue: number }>;
    isLoading: boolean;
    error: ErrorResponse | string | null;
  };
  recentActivities: {
    items: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
    isLoading: boolean;
    error: ErrorResponse | string | null;
  };
  heatmap: {
    data: Array<{
      lat: number;
      lng: number;
      weight?: number;
    }>;
    isLoading: boolean;
    error: ErrorResponse | string | null;
  };
}

function AnalyticsDashboard({ dateRange, onDateRangeChange, stats, summary, recentActivities, heatmap }: AnalyticsDashboardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [selectedMetric, setSelectedMetric] = useState("rides");
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // Loading state handlers
  if (stats.isLoading || summary.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state handlers
  if (stats.error || summary.error) {
    let errorMessage = "Failed to load analytics data";
    const error = stats.error || summary.error;
    
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{errorMessage}</p>
      </div>
    );
  }

  const rideStats = [
    { period: "Today", ...summary.periodStats.today },
    { period: "Yesterday", ...summary.periodStats.yesterday },
    { period: "This Week", ...summary.periodStats.thisWeek },
    { period: "This Month", ...summary.periodStats.thisMonth },
  ];

  const topZones = summary.topZones;

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    onDateRangeChange({
      ...dateRange,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="datetime-local"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="datetime-local"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🚀</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Rides</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalRides.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🚗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Drivers</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeDrivers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">⭐</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.averageRating}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completionRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ride Statistics */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ride Statistics</h3>
            <div className="space-y-4">
              {rideStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stat.period}</div>
                    <div className="text-sm text-gray-500">{stat.rides} rides</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">₹{stat.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Zones */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Zones</h3>
            <div className="space-y-4">
              {topZones.map((zone, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                    <div className="text-sm text-gray-500">{zone.rides} rides</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">₹{zone.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ride Heatmap */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ride Heatmap</h3>
              <p className="text-sm text-gray-500">Geographic distribution of ride requests and pickups</p>
            </div>
            {!heatmap.isLoading && !heatmap.error && heatmap.data.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing {heatmap.data.length} locations
              </div>
            )}
          </div>
          <HeatMap
            data={heatmap.data}
            isLoading={heatmap.isLoading}
            error={heatmap.error ? getErrorMessage(heatmap.error) : null}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          {(() => {
            if (recentActivities.isLoading) {
              return (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              );
            }

            if (recentActivities.error) {
              return (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {getErrorMessage(recentActivities.error)}
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {recentActivities.items.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'RIDE' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'USER' ? 'bg-green-100 text-green-600' :
                      activity.type === 'DRIVER' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'RIDE' ? '🚗' :
                       activity.type === 'USER' ? '👤' :
                       activity.type === 'DRIVER' ? '🚘' : '📝'}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
