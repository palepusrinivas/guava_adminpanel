"use client";
import React, { useState } from "react";
import { useAppSelector } from "@/utils/store/store";

function FleetManagement() {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Sample fleet data - replace with actual data from Redux store
  const fleetData = [
    {
      driverId: "D001",
      title: "John Driver",
      subtitle: "Available",
      position: { lat: 12.9716, lng: 77.5946 },
      status: "available",
      rating: 4.5,
      totalRides: 125,
    },
    {
      driverId: "D002",
      title: "Jane Driver",
      subtitle: "On Ride",
      position: { lat: 12.9756, lng: 77.5996 },
      status: "on_ride",
      rating: 4.8,
      totalRides: 89,
    },
    {
      driverId: "D003",
      title: "Mike Driver",
      subtitle: "Offline",
      position: { lat: 12.9676, lng: 77.5896 },
      status: "offline",
      rating: 4.2,
      totalRides: 156,
    },
    {
      driverId: "D004",
      title: "Sarah Driver",
      subtitle: "Available",
      position: { lat: 12.9736, lng: 77.5916 },
      status: "available",
      rating: 4.7,
      totalRides: 203,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on_ride":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "on_ride":
        return "On Ride";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Monitor driver locations and status</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === "map"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fleetData.filter(driver => driver.status === "available").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🚗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">On Ride</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fleetData.filter(driver => driver.status === "on_ride").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">⏸</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Offline</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fleetData.filter(driver => driver.status === "offline").length}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Drivers</dt>
                  <dd className="text-lg font-medium text-gray-900">{fleetData.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        /* List View */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Rides
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fleetData.map((driver) => (
                    <tr key={driver.driverId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {driver.title.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.title}</div>
                            <div className="text-sm text-gray-500">ID: {driver.driverId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                          {getStatusText(driver.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-sm text-gray-900">{driver.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.totalRides}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.position.lat.toFixed(4)}, {driver.position.lng.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Map View */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Locations</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Map visualization will be displayed here</p>
                <p className="text-xs text-gray-400">Integration with mapping service required</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Driver Details</h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDriver.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDriver.driverId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDriver.status)}`}>
                    {getStatusText(selectedDriver.status)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-900">{selectedDriver.rating}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Rides</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDriver.totalRides}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDriver.position.lat.toFixed(4)}, {selectedDriver.position.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FleetManagement;
