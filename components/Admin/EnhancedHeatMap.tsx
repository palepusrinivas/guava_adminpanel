"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader, MarkerClusterer } from "@react-google-maps/api";
import { config } from "@/utils/config";

interface HeatmapDataPoint {
  lat: number;
  lng: number;
  weight?: number;
  count?: number;
}

interface EnhancedHeatMapProps {
  data: HeatmapDataPoint[];
  isLoading?: boolean;
  error?: string | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  zones?: Array<{ id: string; name: string; rideCount: number; parcelCount: number }>;
  onZoneSelect?: (zoneId: string) => void;
  showZoneList?: boolean;
  mode?: "overview" | "compare";
  compareDates?: string[];
}

const libraries: ("visualization")[] = ["visualization"];

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// Create custom marker icon with number
const createCustomMarkerIcon = (count: number, isHighDensity: boolean) => {
  const color = isHighDensity ? "#EF4444" : "#3B82F6"; // Red for high, Blue for low
  const svg = `
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="20" fill="${color}" opacity="0.7" stroke="white" stroke-width="2"/>
      <text x="25" y="31" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${count}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const EnhancedHeatMap: React.FC<EnhancedHeatMapProps> = ({
  data,
  isLoading = false,
  error = null,
  center = defaultCenter,
  zoom = 12,
  zones = [],
  onZoneSelect,
  showZoneList = true,
  mode = "overview",
  compareDates = [],
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  // Calculate threshold for high density (e.g., top 30% of counts)
  const densityThreshold = useMemo(() => {
    if (!data || data.length === 0) return 10;
    const counts = data.map(d => d.count || d.weight || 1);
    const sorted = [...counts].sort((a, b) => b - a);
    const index = Math.floor(sorted.length * 0.3);
    return sorted[index] || 10;
  }, [data]);

  // Group nearby points and calculate totals for clusters
  const clusteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Simple clustering: group points within 0.01 degrees
    const clusters: Map<string, HeatmapDataPoint & { points: HeatmapDataPoint[] }> = new Map();
    
    data.forEach(point => {
      const gridLat = Math.floor(point.lat / 0.01) * 0.01;
      const gridLng = Math.floor(point.lng / 0.01) * 0.01;
      const key = `${gridLat},${gridLng}`;
      
      if (clusters.has(key)) {
        const existing = clusters.get(key)!;
        existing.count = (existing.count || 0) + (point.count || point.weight || 1);
        existing.points.push(point);
      } else {
        clusters.set(key, {
          lat: point.lat,
          lng: point.lng,
          count: point.count || point.weight || 1,
          points: [point],
        });
      }
    });
    
    return Array.from(clusters.values());
  }, [data]);

  // Filter zones based on search
  const filteredZones = useMemo(() => {
    if (!searchTerm) return zones;
    return zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [zones, searchTerm]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    if (onZoneSelect) {
      onZoneSelect(zoneId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 font-medium">Failed to load heatmap</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Load error
  if (loadError) {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center p-6">
          <p className="text-red-700 font-medium">Error loading Google Maps</p>
          <p className="text-red-600 text-sm mt-2">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  // Not loaded yet
  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // No data - but still show the map
  const hasData = data && data.length > 0;

  return (
    <div className="flex gap-4">
      {/* Zone List Panel */}
      {showZoneList && zones.length > 0 && (
        <div className="w-80 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Zone List</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search here by zone name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
              />
              <button className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700">
                Search
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[520px]">
            {/* All Zones Option */}
            <div
              onClick={() => handleZoneSelect("all")}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedZone === "all" ? "bg-teal-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">All Zone</p>
                  <p className="text-sm text-gray-500">
                    Ride: {zones.reduce((sum, z) => sum + z.rideCount, 0)} | Parcel: {zones.reduce((sum, z) => sum + z.parcelCount, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Individual Zones */}
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => handleZoneSelect(zone.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedZone === zone.id ? "bg-teal-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <p className="text-sm text-gray-500">
                      Ride: {zone.rideCount} | Parcel: {zone.parcelCount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="Search for a location"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
            />
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Google Map */}
          <div className="relative">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={zoom}
              options={{ ...mapOptions, mapTypeId: mapType }}
            >
              {/* Render custom markers with numbers */}
              {hasData && clusteredData.map((point, index) => {
                const count = point.count || 1;
                const isHighDensity = count >= densityThreshold;
                
                return (
                  <Marker
                    key={index}
                    position={{ lat: point.lat, lng: point.lng }}
                    icon={{
                      url: createCustomMarkerIcon(count, isHighDensity),
                      scaledSize: new google.maps.Size(50, 50),
                      anchor: new google.maps.Point(25, 25),
                    }}
                    title={`${count} rides`}
                  />
                );
              })}
            </GoogleMap>
            
            {/* Show message overlay when no data */}
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center shadow-lg pointer-events-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-600 font-medium">No heatmap data available</p>
                  <p className="text-gray-500 text-sm mt-2">Try selecting a different date range with ride activity</p>
                </div>
              </div>
            )}

            {/* Map Type Toggle */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => setMapType("roadmap")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mapType === "roadmap"
                    ? "bg-white text-gray-900 shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapType("satellite")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mapType === "satellite"
                    ? "bg-white text-gray-900 shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        {hasData && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                5
              </div>
              <span className="text-gray-600">Low Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                50
              </div>
              <span className="text-gray-600">High Density</span>
            </div>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">{data.length} locations</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHeatMap;

