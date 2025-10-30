"use client";
import React, { useMemo } from "react";
import { GoogleMap, HeatmapLayer, useJsApiLoader } from "@react-google-maps/api";
import { config } from "@/utils/config";

interface HeatMapProps {
  data: Array<{
    lat: number;
    lng: number;
    weight?: number;
  }>;
  isLoading?: boolean;
  error?: string | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const libraries: ("visualization")[] = ["visualization"];

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
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

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  isLoading = false,
  error = null,
  center = defaultCenter,
  zoom = 12,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Convert data to Google Maps heatmap format
  const heatmapData = useMemo(() => {
    if (!isLoaded || !data || data.length === 0) return [];
    
    return data.map((point) => {
      const location = new google.maps.LatLng(point.lat, point.lng);
      
      // If weight is provided, create weighted location
      if (point.weight !== undefined) {
        return {
          location,
          weight: point.weight,
        };
      }
      
      return location;
    });
  }, [data, isLoaded]);

  const heatmapOptions = useMemo(
    () => ({
      radius: 30,
      opacity: 0.6,
      gradient: [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 1)",
        "rgba(0, 191, 255, 1)",
        "rgba(0, 127, 255, 1)",
        "rgba(0, 63, 255, 1)",
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 223, 1)",
        "rgba(0, 0, 191, 1)",
        "rgba(0, 0, 159, 1)",
        "rgba(0, 0, 127, 1)",
        "rgba(63, 0, 91, 1)",
        "rgba(127, 0, 63, 1)",
        "rgba(191, 0, 31, 1)",
        "rgba(255, 0, 0, 1)",
      ],
    }),
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[500px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
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
      <div className="w-full h-[500px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 font-medium">Error loading Google Maps</p>
          <p className="text-red-600 text-sm mt-2">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  // Not loaded yet
  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // No data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium">No heatmap data available</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different date range with ride activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        {heatmapData.length > 0 && (
          <HeatmapLayer data={heatmapData} options={heatmapOptions} />
        )}
      </GoogleMap>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <span className="text-gray-600">Ride Density:</span>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            <span className="ml-1 text-gray-600">Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="ml-1 text-gray-600">Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="ml-1 text-gray-600">High</span>
          </div>
        </div>
        <span className="text-gray-500">|</span>
        <span className="text-gray-600">{data.length} data points</span>
      </div>
    </div>
  );
};

export default HeatMap;

