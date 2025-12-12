"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getAnalyticsHeatmap, getZones } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import EnhancedHeatMap from "@/components/Admin/EnhancedHeatMap";

export default function HeatMapPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<"overview">("overview");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const { heatmap } = useAppSelector((state) => state.adminAnalytics);
  const { zones } = useAppSelector((state) => state.zone);

  // Zone list for UI only; counts are not mocked
  const zoneData = zones.map(zone => ({
    id: zone.id.toString(),
    name: zone.name,
    rideCount: 0,
    parcelCount: 0,
  }));

  // Calculate total trips
  const totalTrips = heatmap.data.reduce((sum, point) => sum + (point.weight || 1), 0);

  // Compare view and daily sample data removed

  const fetchHeatmapData = async () => {
    try {
      await dispatch(getAnalyticsHeatmap({
        from: `${dateRange.from}T00:00:00`,
        to: `${dateRange.to}T23:59:59`,
      }));
    } catch (error) {
      console.error("Failed to fetch heatmap:", error);
      toast.error("Failed to fetch heatmap data");
    }
  };

  // Fetch zones on component mount
  useEffect(() => {
    dispatch(getZones());
  }, [dispatch]);

  // Fetch heatmap data when date range changes
  useEffect(() => {
    fetchHeatmapData();
  }, [dateRange]);

  const handleSubmit = () => {
    setDateRange(tempDateRange);
  };

  const handleReset = () => {
    const defaultRange = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    };
    setTempDateRange(defaultRange);
    setDateRange(defaultRange);
    setSelectedZone("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trip Heat Map</h1>
        <p className="text-gray-600">Monitor your trips from here</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Zone Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Zones</option>
              {zoneData.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={tempDateRange.from}
              onChange={(e) => setTempDateRange({ ...tempDateRange, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={tempDateRange.to}
              onChange={(e) => setTempDateRange({ ...tempDateRange, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              RESET
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </div>

        {/* View mode toggle removed (no sample compare view) */}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Trips</div>
          <div className="text-2xl font-bold text-teal-600">{totalTrips}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Rides</div>
          <div className="text-2xl font-bold text-blue-600">{totalTrips}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Parcels</div>
          <div className="text-2xl font-bold text-purple-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Zones</div>
          <div className="text-2xl font-bold text-green-600">{zones.length}</div>
        </div>
      </div>

      {/* Main Content - Overview Mode */}
      {viewMode === "overview" && (
        <div>
          <EnhancedHeatMap
            data={heatmap.data}
            isLoading={heatmap.isLoading}
            error={heatmap.error}
            zones={zoneData}
            onZoneSelect={setSelectedZone}
            showZoneList={true}
            mode="overview"
          />
        </div>
      )}

      {/* Compare view and sample statistics removed */}
    </div>
  );
}

