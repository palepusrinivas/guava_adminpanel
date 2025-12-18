"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getVehicles, updateVehicle } from "@/utils/reducers/adminReducers";
import { setVehicleFilter, setVehicleSearchQuery } from "@/utils/slices/vehicleSlice";
import { useRouter } from "next/navigation";

// Comprehensive vehicle type icon mapping
const vehicleTypeIcons: Record<string, string> = {
  // Old format (legacy)
  Auto: "🛺",
  Mega: "🛺",
  "Small Car / Sedan": "🚗",
  "Bike.": "🏍️",
  "Mahila Ride": "🛵",
  "Car (XL SUV)-(MUV)": "🚙",
  
  // New format - Vehicle Types
  "two_wheeler": "🏍️",
  "two-wheeler": "🏍️",
  "TWO_WHEELER": "🏍️",
  "Two Wheeler": "🏍️",
  "two wheeler": "🏍️",
  
  "three_wheeler": "🛺",
  "three-wheeler": "🛺",
  "THREE_WHEELER": "🛺",
  "Three Wheeler": "🛺",
  "three wheeler": "🛺",
  
  "four_wheeler": "🚗",
  "four-wheeler": "🚗",
  "FOUR_WHEELER": "🚗",
  "Four Wheeler": "🚗",
  "four wheeler": "🚗",
  
  "four_wheeler_premium": "🚙",
  "four-wheeler-premium": "🚙",
  "FOUR_WHEELER_PREMIUM": "🚙",
  "Four Wheeler Premium": "🚙",
  "four wheeler premium": "🚙",
  
  // Service Types
  "BIKE": "🏍️",
  "bike": "🏍️",
  "Bike": "🏍️",
  
  "MEGA": "🛺",
  "mega": "🛺",
  
  "CAR": "🚗",
  "car": "🚗",
  "Car": "🚗",
  
  "SMALL_SEDAN": "🚗",
  "small_sedan": "🚗",
  "SMALL-SEDAN": "🚗",
  "small-sedan": "🚗",
  "Small Sedan": "🚗",
  "small sedan": "🚗",
  "Sedan": "🚗",
  "sedan": "🚗",
  
  // Additional variations
  "SUV": "🚙",
  "suv": "🚙",
  "XL": "🚙",
  "xl": "🚙",
  "Premium": "🚙",
  "premium": "🚙",
  "Luxury": "🚙",
  "luxury": "🚙",
};

// Helper function to get vehicle icon from multiple possible fields
const getVehicleIcon = (vehicle: any): string => {
  // Check multiple fields in order of preference
  const typeValue = 
    vehicle?.vehicleCategory || 
    vehicle?.vehicleType || 
    vehicle?.serviceType || 
    vehicle?.type || 
    "";
  
  if (!typeValue) return "🚗"; // Default to car
  
  // Normalize the value (trim, lowercase for matching)
  const normalized = typeValue.toString().trim();
  const lowerNormalized = normalized.toLowerCase();
  
  // Try exact match first
  if (vehicleTypeIcons[normalized]) {
    return vehicleTypeIcons[normalized];
  }
  
  // Try case-insensitive match
  if (vehicleTypeIcons[lowerNormalized]) {
    return vehicleTypeIcons[lowerNormalized];
  }
  
  // Try partial matching for common patterns
  if (lowerNormalized.includes("bike") || lowerNormalized.includes("two")) {
    return "🏍️";
  }
  if (lowerNormalized.includes("auto") || lowerNormalized.includes("three") || lowerNormalized.includes("mega") || lowerNormalized.includes("rickshaw")) {
    return "🛺";
  }
  if (lowerNormalized.includes("suv") || lowerNormalized.includes("xl") || lowerNormalized.includes("premium") || lowerNormalized.includes("luxury")) {
    return "🚙";
  }
  if (lowerNormalized.includes("car") || lowerNormalized.includes("four") || lowerNormalized.includes("sedan")) {
    return "🚗";
  }
  
  // Default fallback
  return "🚗";
};

export default function VehicleList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { vehicles, isLoading, error, vehicleFilter, vehicleSearchQuery } = useAppSelector((s) => s.vehicle);

  useEffect(() => {
    dispatch(getVehicles()).catch(() => {});
  }, [dispatch]);

  const filtered = useMemo(() => {
    const base = vehicles.filter((v) => {
      if (vehicleFilter === "active") return v.status === "ACTIVE";
      if (vehicleFilter === "inactive") return v.status === "INACTIVE";
      return true;
    });
    if (!vehicleSearchQuery) return base;
    const q = vehicleSearchQuery.toLowerCase();
    return base.filter(
      (v) =>
        v.vehicleId?.toLowerCase().includes(q) ||
        v.licensePlate?.toLowerCase().includes(q) ||
        v.driverName?.toLowerCase().includes(q) ||
        v.vehicleBrand?.toLowerCase().includes(q) ||
        v.vehicleModel?.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleFilter, vehicleSearchQuery]);

  const vehicleTypeSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    vehicles.forEach((v) => {
      // Get the type from multiple possible fields
      const type = v.vehicleCategory || v.vehicleType || v.serviceType || v.type || "Other";
      summary[type] = (summary[type] || 0) + 1;
    });
    return summary;
  }, [vehicles]);

  const handleToggleStatus = async (vehicle: any) => {
    await dispatch(
      updateVehicle({
        vehicleId: String(vehicle.id),
        vehicleData: { status: vehicle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
      })
    );
    dispatch(getVehicles());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Vehicle List</h2>
      </div>

      {/* Vehicle Type Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(vehicleTypeSummary).map(([type, count]) => (
          <div key={type} className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
            <div>
              <div className="text-sm text-gray-600 mb-1">{type}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
            <div className="text-4xl">{getVehicleIcon({ vehicleCategory: type, vehicleType: type, serviceType: type })}</div>
          </div>
        ))}
        {/* Fallback for empty state */}
        {Object.keys(vehicleTypeSummary).length === 0 && (
          <>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Auto</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🛺</div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Mega</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🛺</div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Small Car / Sedan</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Bike.</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🏍️</div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Mahila Ride</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🛵</div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <div className="text-sm text-gray-600 mb-1">Car (XL SUV)-(MUV)</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-4xl">🚙</div>
            </div>
          </>
        )}
      </div>

      {/* All Vehicles Section */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">All Vehicles</h3>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Total Vehicle: {vehicles.length}</div>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => dispatch(setVehicleFilter("all"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                vehicleFilter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch(setVehicleFilter("active"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                vehicleFilter === "active" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => dispatch(setVehicleFilter("inactive"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                vehicleFilter === "inactive" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-3 space-y-3 md:space-y-0 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative w-full">
                <input
                  value={vehicleSearchQuery}
                  onChange={(e) => dispatch(setVehicleSearchQuery(e.target.value))}
                  placeholder="Search here by Viin & L"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Search</button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button
                onClick={() => router.push("/admin/vehicle/create")}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                + Add New Vehicle
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
              Unable to load vehicles from server. Ensure backend endpoints are implemented. Error: {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">SL</th>
                  <th className="px-4 py-3 text-left">Vehicle ID</th>
                  <th className="px-4 py-3 text-left">Driver Name</th>
                  <th className="px-4 py-3 text-left">Vehicle Type</th>
                  <th className="px-4 py-3 text-left">Brand & Model</th>
                  <th className="px-4 py-3 text-left">License</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Vehicle Features</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(isLoading ? [] : filtered).map((vehicle, idx) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">#{vehicle.vehicleId || vehicle.id}</td>
                    <td className="px-4 py-3">{vehicle.driverName || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center">
                        {getVehicleIcon(vehicle)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.vehicleBrand} - {vehicle.vehicleModel}
                    </td>
                    <td className="px-4 py-3">{vehicle.licensePlate || "-"}</td>
                    <td className="px-4 py-3">{vehicle.owner || "Driver"}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        {vehicle.engine && <div>Engine: {vehicle.engine}</div>}
                        {vehicle.seat && <div>Seat: {vehicle.seat}</div>}
                        {vehicle.hatchBag && <div>Hatch Bag: {vehicle.hatchBag}</div>}
                        {vehicle.fuel && <div>Fuel: {vehicle.fuel}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(vehicle)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          vehicle.status === "ACTIVE" ? "bg-teal-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            vehicle.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700" title="History">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={10}>
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

