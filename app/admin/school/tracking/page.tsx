"use client";
import React, { useState, useEffect } from "react";
import { getActiveTracking, getBusTracking } from "@/utils/schoolAdminApi";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";

interface BusLocation {
  busId: number;
  busNumber: string;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: string;
  };
}

export default function TrackingPage() {
  const [activeBuses, setActiveBuses] = useState<Record<string, BusLocation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [busHistory, setBusHistory] = useState<any[]>([]);

  useEffect(() => {
    loadActiveTracking();
    const interval = setInterval(loadActiveTracking, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedBusId) {
      loadBusHistory(selectedBusId);
    }
  }, [selectedBusId]);

  const loadActiveTracking = async () => {
    try {
      const data = await getActiveTracking();
      setActiveBuses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  };

  const loadBusHistory = async (busId: number) => {
    try {
      const data = await getBusTracking(busId, 20);
      setBusHistory(data.trackingPings || []);
    } catch (err: any) {
      console.error("Failed to load bus history:", err);
    }
  };

  const buses = Object.values(activeBuses);

  return (
   
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Live Bus Tracking</h1>
          <button
            onClick={loadActiveTracking}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading tracking data...</div>
        ) : (
          <>
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">
                Active Buses ({buses.length})
              </h2>
              {buses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active buses</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buses.map((bus) => (
                    <div
                      key={bus.busId}
                      className="border rounded p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => setSelectedBusId(bus.busId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Bus {bus.busNumber}</div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      {bus.location && (
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>
                            📍 {bus.location.latitude.toFixed(6)}, {bus.location.longitude.toFixed(6)}
                          </div>
                          <div>🚗 Speed: {bus.location.speed?.toFixed(1) || 0} km/h</div>
                          <div>🧭 Heading: {bus.location.heading?.toFixed(0) || 0}°</div>
                          <div className="text-xs text-gray-500">
                            {new Date(bus.location.timestamp).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bus History Modal */}
            {selectedBusId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      Bus {activeBuses[selectedBusId]?.busNumber || selectedBusId} - Tracking History
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedBusId(null);
                        setBusHistory([]);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  {busHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No tracking history</div>
                  ) : (
                    <div className="space-y-2">
                      {busHistory.map((ping: any, index: number) => (
                        <div key={index} className="border rounded p-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Location:</span> {ping.latitude?.toFixed(6)}, {ping.longitude?.toFixed(6)}
                            </div>
                            <div>
                              <span className="font-medium">Speed:</span> {ping.speed?.toFixed(1) || 0} km/h
                            </div>
                            <div>
                              <span className="font-medium">Heading:</span> {ping.heading?.toFixed(0) || 0}°
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {new Date(ping.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
  
  );
}

