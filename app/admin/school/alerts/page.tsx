"use client";
import React, { useState, useEffect } from "react";
import { getAllAlerts, getRecentAlerts } from "@/utils/schoolAdminApi";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";

interface AlertLog {
  id: number;
  type: string;
  payload: string;
  sentAt: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"recent" | "all">("recent");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadAlerts();
  }, [viewMode, page]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      let data;
      if (viewMode === "recent") {
        data = await getRecentAlerts(24);
        setAlerts(Array.isArray(data) ? data : []);
      } else {
        const response = await getAllAlerts(page, 20);
        data = response.content || [];
        setTotalPages(response.totalPages || 0);
        setAlerts(Array.isArray(data) ? data : []);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const parsePayload = (payload: string) => {
    try {
      const params = new URLSearchParams(payload);
      const obj: Record<string, string> = {};
      params.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    } catch {
      return { raw: payload };
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Alert Logs</h1>
          <div className="flex gap-2">
            <select
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value as "recent" | "all");
                setPage(0);
              }}
              className="border rounded px-3 py-2"
            >
              <option value="recent">Last 24 Hours</option>
              <option value="all">All Alerts</option>
            </select>
            <button
              onClick={loadAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading alerts...</div>
        ) : (
          <>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alerts.map((alert) => {
                    const payload = parsePayload(alert.payload);
                    return (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{alert.id}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {alert.type || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {alert.user ? (
                            <div>
                              <div className="font-medium">{alert.user.fullName}</div>
                              <div className="text-gray-500 text-xs">{alert.user.email}</div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            {Object.entries(payload).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {alert.sentAt
                            ? new Date(alert.sentAt).toLocaleString()
                            : new Date(alert.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No alerts found</div>
              )}
            </div>

            {viewMode === "all" && totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

