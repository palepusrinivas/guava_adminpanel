"use client";
import React, { useState, useEffect } from "react";
import { getSchoolStatistics } from "@/utils/schoolAdminApi";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";

interface Statistics {
  institutions: number;
  branches: number;
  buses: {
    total: number;
    active: number;
  };
  students: number;
  parentRequests: {
    pending: number;
  };
  alerts: {
    total: number;
    last24Hours: number;
  };
}

export default function SchoolDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await getSchoolStatistics();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading statistics...</div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            Error: {error}
            <button
              onClick={loadStatistics}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Transport Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Overview of all school transport operations</p>
          </div>
          <button
            onClick={loadStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Institutions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Institutions</p>
                  <p className="text-4xl font-bold text-blue-900 mt-3">{stats.institutions}</p>
                </div>
                <div className="text-5xl opacity-80">🏢</div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a href="/admin/school/institutions" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View All →
                </a>
              </div>
            </div>

            {/* Branches */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Branches</p>
                  <p className="text-4xl font-bold text-green-900 mt-3">{stats.branches}</p>
                </div>
                <div className="text-5xl opacity-80">🏬</div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <a href="/admin/school/branches" className="text-xs text-green-600 hover:text-green-800 font-medium">
                  View All →
                </a>
              </div>
            </div>

            {/* Buses */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Buses</p>
                  <p className="text-4xl font-bold text-purple-900 mt-3">
                    {stats.buses.active} <span className="text-2xl text-purple-600">/</span> {stats.buses.total}
                  </p>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Active / Total</p>
                </div>
                <div className="text-5xl opacity-80">🚌</div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <a href="/admin/school/buses" className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  Manage Buses →
                </a>
              </div>
            </div>

            {/* Students */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">Students</p>
                  <p className="text-4xl font-bold text-orange-900 mt-3">{stats.students}</p>
                </div>
                <div className="text-5xl opacity-80">👨‍🎓</div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <a href="/admin/school/students/upload" className="text-xs text-orange-600 hover:text-orange-800 font-medium">
                  Upload Students →
                </a>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700 uppercase tracking-wide">Pending Requests</p>
                  <p className="text-4xl font-bold text-yellow-900 mt-3">{stats.parentRequests.pending}</p>
                  {stats.parentRequests.pending > 0 && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">Requires attention</p>
                  )}
                </div>
                <div className="text-5xl opacity-80">📋</div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <a href="/admin/school/parent-requests" className="text-xs text-yellow-600 hover:text-yellow-800 font-medium">
                  Review Requests →
                </a>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 uppercase tracking-wide">Alerts (24h)</p>
                  <p className="text-4xl font-bold text-red-900 mt-3">{stats.alerts.last24Hours}</p>
                  <p className="text-xs text-red-600 mt-2 font-medium">Total: {stats.alerts.total}</p>
                </div>
                <div className="text-5xl opacity-80">🔔</div>
              </div>
              <div className="mt-4 pt-4 border-t border-red-200">
                <a href="/admin/school/alerts" className="text-xs text-red-600 hover:text-red-800 font-medium">
                  View Alerts →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500 mt-1">Access frequently used features</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/school/parent-requests"
              className="group px-6 py-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
              <div className="text-sm font-semibold text-blue-900">Parent Requests</div>
              <div className="text-xs text-blue-600 mt-1">Manage requests</div>
            </a>
            <a
              href="/admin/school/tracking"
              className="group px-6 py-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl text-center hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📍</div>
              <div className="text-sm font-semibold text-green-900">Live Tracking</div>
              <div className="text-xs text-green-600 mt-1">Real-time locations</div>
            </a>
            <a
              href="/admin/school/alerts"
              className="group px-6 py-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl text-center hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔔</div>
              <div className="text-sm font-semibold text-yellow-900">Alerts</div>
              <div className="text-xs text-yellow-600 mt-1">View notifications</div>
            </a>
            <a
              href="/admin/school/buses"
              className="group px-6 py-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚌</div>
              <div className="text-sm font-semibold text-purple-900">Manage Buses</div>
              <div className="text-xs text-purple-600 mt-1">Bus operations</div>
            </a>
          </div>
        </div>
      </div>
   
  );
}

