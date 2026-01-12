"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getFleetLocations } from "@/utils/reducers/adminReducers";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { config } from "@/utils/config";

type DriverStatus = "all" | "on-trip" | "idle" | "customer";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  model: string;
  status: string;
  isNew: boolean;
  position?: { lat: number; lng: number };
}

const libraries: ("visualization")[] = ["visualization"];

const containerStyle = {
  width: "100%",
  height: "650px",
};

const defaultCenter = {
  lat: 16.9902,
  lng: 82.2475,
};

export default function FleetMapPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DriverStatus>("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { zones } = useAppSelector((state) => state.zone);
  const { locations: fleetLocations, isLoading: fleetLoading, error: fleetError } = useAppSelector((state) => state.fleet);

  // Transform API data to match our Driver interface
  // Filter out drivers with invalid coordinates
  const apiDrivers: Driver[] = Array.isArray(fleetLocations)
    ? fleetLocations
        .map((driver) => {
          // Get coordinates from various possible fields
          const lat = driver.lat || driver.latitude;
          const lng = driver.lng || driver.longitude;
          
          // Skip drivers with invalid coordinates (null, undefined, 0, 0)
          if (!lat || !lng || lat === 0 || lng === 0) {
            return null;
          }
          
          return {
            id: driver.id?.toString() || driver.driverId?.toString() || "",
            name: driver.name || "Unknown Driver",
            phone: driver.phone || driver.mobile || "N/A",
            vehicleNo: driver.vehicleNo || driver.vehicleNumber || "N/A",
            model: driver.model || driver.vehicleModel || "N/A",
            status: driver.status || "available",
            isNew: driver.isNew || false,
            position: {
              lat: lat,
              lng: lng,
            },
          } as Driver;
        })
        .filter((driver): driver is Driver => driver !== null)
    : [];

  // Use only API data (no mock/fallback)
  const allDrivers = apiDrivers;

  // Filter drivers based on active tab
  // Backend returns: "on_ride", "available", "offline"
  // Frontend tabs: "on-trip" (maps to "on_ride"), "idle" (maps to "available"), "customer" (not used)
  const filteredDrivers = allDrivers.filter((driver) => {
    if (activeTab === "all") return true;
    if (activeTab === "on-trip") {
      // Backend returns "on_ride" for drivers on trip (drivers with currentRide)
      return driver.status === "on_ride" || driver.status === "on-trip";
    }
    if (activeTab === "idle") {
      // Backend returns "available" for idle/available drivers
      return driver.status === "available" || driver.status === "idle";
    }
    if (activeTab === "customer") return driver.status === "customer";
    return true;
  }).filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create clustered markers
  const getMarkerIcon = (count: number) => {
    let color = "#4B5563"; // grey
    if (count > 20) color = "#EF4444"; // red
    else if (count > 10) color = "#3B82F6"; // blue

    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="${color}" opacity="0.8" stroke="white" stroke-width="2"/>
        <text x="20" y="26" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${count}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  // Group drivers by location for clustering
  interface Cluster {
    position: { lat: number; lng: number };
    count: number;
    drivers: Driver[];
  }
  
  const clusterDrivers = (): Cluster[] => {
    const clusters: Map<string, Cluster> = new Map();
    
    filteredDrivers.forEach((driver) => {
      if (!driver.position || !driver.position.lat || !driver.position.lng) return;
      
      // Use a smaller grid size (0.01 degrees ≈ 1km) for better clustering
      const gridLat = Math.floor(driver.position.lat / 0.01) * 0.01;
      const gridLng = Math.floor(driver.position.lng / 0.01) * 0.01;
      const key = `${gridLat.toFixed(4)},${gridLng.toFixed(4)}`;
      
      if (clusters.has(key)) {
        const existing = clusters.get(key)!;
        existing.count++;
        existing.drivers.push(driver);
        // Update position to average of all drivers in cluster
        existing.position.lat = (existing.position.lat * (existing.count - 1) + driver.position.lat) / existing.count;
        existing.position.lng = (existing.position.lng * (existing.count - 1) + driver.position.lng) / existing.count;
      } else {
        clusters.set(key, {
          position: { lat: driver.position.lat, lng: driver.position.lng },
          count: 1,
          drivers: [driver],
        });
      }
    });
    
    return Array.from(clusters.values());
  };

  const clusters = clusterDrivers();
  
  // Calculate map center based on driver positions
  const calculateMapCenter = () => {
    if (filteredDrivers.length === 0) return defaultCenter;
    
    const validDrivers = filteredDrivers.filter(d => d.position && d.position.lat && d.position.lng);
    if (validDrivers.length === 0) return defaultCenter;
    
    const avgLat = validDrivers.reduce((sum, d) => sum + d.position!.lat, 0) / validDrivers.length;
    const avgLng = validDrivers.reduce((sum, d) => sum + d.position!.lng, 0) / validDrivers.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const mapCenter = calculateMapCenter();

  useEffect(() => {
    dispatch(getFleetLocations());
  }, [dispatch]);

  // Debug: Log driver data when it changes
  useEffect(() => {
    if (fleetLocations.length > 0) {
      console.log('[FleetMap] Fetched drivers:', fleetLocations.length);
      console.log('[FleetMap] Valid drivers with positions:', allDrivers.length);
      if (allDrivers.length > 0) {
        console.log('[FleetMap] Sample driver:', allDrivers[0]);
      }
    }
  }, [fleetLocations, allDrivers.length]);

  // Update map center when drivers are loaded
  useEffect(() => {
    if (mapInstance && allDrivers.length > 0) {
      const center = calculateMapCenter();
      mapInstance.setCenter(center);
      // Auto-zoom to fit all drivers
      if (allDrivers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        allDrivers.forEach(driver => {
          if (driver.position) {
            bounds.extend(new google.maps.LatLng(driver.position.lat, driver.position.lng));
          }
        });
        mapInstance.fitBounds(bounds);
      } else if (allDrivers.length === 1 && allDrivers[0].position) {
        mapInstance.setCenter(allDrivers[0].position);
        mapInstance.setZoom(14);
      }
    }
  }, [mapInstance, allDrivers.length]);

  const tabs = [
    { id: "all", label: "All Drivers", count: allDrivers.length },
    { id: "on-trip", label: "On-Trip", count: allDrivers.filter(d => d.status === "on_ride" || d.status === "on-trip").length },
    { id: "idle", label: "Idle", count: allDrivers.filter(d => d.status === "available" || d.status === "idle").length },
    { id: "customer", label: "Customers", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Live View</h1>
        <p className="text-gray-600">Monitor your users from here</p>
        {fleetLoading && (
          <div className="mt-2 flex items-center text-sm text-teal-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
            Loading fleet data...
          </div>
        )}
        {fleetError && !fleetLoading && (
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
            ⚠️ {fleetError}
          </div>
        )}
        {!fleetLoading && !fleetError && allDrivers.length === 0 && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            ℹ️ No drivers with valid locations found. Drivers need to have latitude and longitude set.
          </div>
        )}
        {!fleetLoading && !fleetError && allDrivers.length > 0 && (
          <div className="mt-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-md">
            ✅ Found {allDrivers.length} driver(s) with valid locations
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DriverStatus)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-white bg-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-teal-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Driver List Panel */}
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver List</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search driver"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700">
                      Search
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[550px]">
                  {filteredDrivers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No drivers found</p>
                    </div>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className="p-4 border-b border-gray-100 hover:bg-teal-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-white font-semibold">
                            {driver.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                              {driver.isNew && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{driver.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Vehicle No: {driver.vehicleNo}
                            </p>
                            <p className="text-xs text-gray-500">
                              Model: {driver.model}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Map Panel */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Map Controls */}
                <div className="p-4 border-b border-gray-200 flex gap-3">
                  <input
                    type="text"
                    placeholder="Search for a location"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500 min-w-[150px]"
                  >
                    <option value="all">All Zones</option>
                    {/* FIX: Ensure zones is an array before calling .map() */}
                    {(Array.isArray(zones) ? zones : []).map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google Map */}
                <div className="relative">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={mapCenter}
                      zoom={filteredDrivers.length > 0 ? 12 : 11}
                      onLoad={(map) => setMapInstance(map)}
                      options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: true,
                      }}
                    >
                      {clusters.map((cluster, index) => {
                        // For single drivers, show individual marker with driver icon
                        if (cluster.count === 1 && cluster.drivers.length > 0) {
                          const driver = cluster.drivers[0];
                          // Determine marker color based on status
                          let markerColor = "#4B5563"; // grey (offline/default)
                          if (driver.status === "available" || driver.status === "idle") {
                            markerColor = "#10B981"; // green (available)
                          } else if (driver.status === "on-trip" || driver.status === "on_ride") {
                            markerColor = "#3B82F6"; // blue (on trip)
                          }
                          
                          const singleMarkerIcon = `
                            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="14" fill="${markerColor}" opacity="0.9" stroke="white" stroke-width="2"/>
                              <text x="16" y="21" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">🚗</text>
                            </svg>
                          `;
                          
                          return (
                            <Marker
                              key={`driver-${driver.id}-${index}`}
                              position={driver.position!}
                              icon={{
                                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(singleMarkerIcon)}`,
                                scaledSize: new google.maps.Size(32, 32),
                                anchor: new google.maps.Point(16, 16),
                              }}
                              title={`${driver.name} - ${driver.status}`}
                              onClick={() => setSelectedDriver(driver)}
                            />
                          );
                        }
                        
                        // For clusters with multiple drivers, show cluster marker
                        return (
                          <Marker
                            key={`cluster-${index}`}
                            position={cluster.position}
                            icon={{
                              url: getMarkerIcon(cluster.count),
                              scaledSize: new google.maps.Size(40, 40),
                              anchor: new google.maps.Point(20, 20),
                            }}
                            title={`${cluster.count} driver(s) at this location`}
                            onClick={() => {
                              // If clicked on cluster, select the first driver or show list
                              if (cluster.drivers.length > 0) {
                                setSelectedDriver(cluster.drivers[0]);
                              }
                            }}
                          />
                        );
                      })}
                    </GoogleMap>
                  ) : (
                    <div className="flex items-center justify-center h-[650px] bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <span className="text-gray-600">Low Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    15
                  </div>
                  <span className="text-gray-600">Medium Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                    37
                  </div>
                  <span className="text-gray-600">High Activity</span>
                </div>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">{filteredDrivers.length} active driver(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDriver(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold text-2xl shadow-md">
                  {selectedDriver.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedDriver.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedDriver.status === "on_ride" || selectedDriver.status === "on-trip"
                        ? "bg-green-500 text-white"
                        : selectedDriver.status === "available" || selectedDriver.status === "idle"
                        ? "bg-yellow-500 text-white"
                        : selectedDriver.status === "customer"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}>
                      {(selectedDriver.status === "on_ride" || selectedDriver.status === "on-trip") ? "ON TRIP" :
                       (selectedDriver.status === "available" || selectedDriver.status === "idle") ? "IDLE" :
                       selectedDriver.status === "customer" ? "CUSTOMER" :
                       "OFFLINE"}
                    </span>
                    {selectedDriver.isNew && (
                      <span className="px-3 py-1 bg-white text-teal-700 text-xs font-semibold rounded-full">
                        NEW DRIVER
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-800 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-teal-600">📞</span> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                      {selectedDriver.phone}
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedDriver.phone)}
                        className="text-teal-600 hover:text-teal-700 text-xs"
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</label>
                    <p className="text-gray-900 font-medium mt-1">{selectedDriver.id}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-teal-600">🚗</span> Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</label>
                    <p className="text-gray-900 font-bold text-lg mt-1 tracking-wider">{selectedDriver.vehicleNo}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Model</label>
                    <p className="text-gray-900 font-medium mt-1">{selectedDriver.model}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {selectedDriver.position && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-teal-600">📍</span> Current Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</label>
                      <p className="text-gray-900 font-mono mt-1">{selectedDriver.position.lat.toFixed(6)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</label>
                      <p className="text-gray-900 font-mono mt-1">{selectedDriver.position.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedDriver.position.lat},${selectedDriver.position.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    <span>View on Google Maps</span>
                    <span>→</span>
                  </a>
                </div>
              )}

              {/* Status Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-teal-600">ℹ️</span> Status Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedDriver.status === "on_ride" || selectedDriver.status === "on-trip"
                        ? "bg-green-100 text-green-700"
                        : selectedDriver.status === "available" || selectedDriver.status === "idle"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedDriver.status === "customer"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {(selectedDriver.status === "on_ride" || selectedDriver.status === "on-trip") ? "ON TRIP" :
                       (selectedDriver.status === "available" || selectedDriver.status === "idle") ? "IDLE" :
                       selectedDriver.status === "customer" ? "CUSTOMER" :
                       "OFFLINE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedDriver.isNew ? "New Driver (Under Review)" : "Verified Driver"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span>📞</span>
                  <span>Call Driver</span>
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span>📧</span>
                  <span>Send Message</span>
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span>📊</span>
                  <span>View History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

