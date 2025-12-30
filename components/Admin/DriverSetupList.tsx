"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { getDrivers } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthToken } from "@/utils/config";

interface Driver {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  shortCode?: string;
  rating?: number;
  active?: boolean;
  vehicle?: {
    id: string | number;
    licensePlate?: string;
    vehicleCategory?: string;
    vehicleType?: string;
    serviceType?: string;
    model?: string;
    company?: string;
    year?: number;
  };
  kyc?: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    aadhaarNumber?: string;
    licenseNumber?: string;
    rcNumber?: string;
  };
  totalTrips?: number;
  totalEarnings?: number;
  driverLevel?: string;
}

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
  
  "AUTO": "🛺",
  "auto": "🛺",
  
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
};

// Helper function to get vehicle icon from multiple possible fields
const getVehicleIcon = (vehicle: any): string => {
  if (!vehicle) return "🚗"; // Default to car
  
  // Check multiple fields in order of preference
  const typeValue = 
    vehicle?.serviceType || 
    vehicle?.vehicleType || 
    vehicle?.vehicleCategory || 
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

// Helper function to check if vehicle is a car
const isCar = (vehicle: any): boolean => {
  if (!vehicle) return false;
  const typeValue = (vehicle?.serviceType || vehicle?.vehicleType || vehicle?.vehicleCategory || "").toString().toLowerCase();
  return typeValue.includes("car") || 
         typeValue.includes("four") || 
         typeValue.includes("sedan") ||
         typeValue.includes("suv") ||
         typeValue === "car" ||
         typeValue === "small_sedan" ||
         typeValue === "four_wheeler" ||
         typeValue === "four-wheeler";
};

// Helper function to check if vehicle is a motorbike
const isMotorbike = (vehicle: any): boolean => {
  if (!vehicle) return false;
  const typeValue = (vehicle?.serviceType || vehicle?.vehicleType || vehicle?.vehicleCategory || "").toString().toLowerCase();
  return typeValue.includes("bike") || 
         typeValue.includes("two") ||
         typeValue === "bike" ||
         typeValue === "two_wheeler" ||
         typeValue === "two-wheeler";
};

export default function DriverSetupList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"All" | "Active" | "Inactive">("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dispatch(getDrivers({ page: 0, size: 100 }));
      if (getDrivers.fulfilled.match(response)) {
        const payload: any = response.payload;
        let list: any[] = [];
        
        if (Array.isArray(payload)) {
          list = payload;
        } else if (Array.isArray(payload?.content)) {
          list = payload.content;
        } else if (payload?.data) {
          list = Array.isArray(payload.data) ? payload.data : [];
        }

        // Use the driver data as-is, it should already include vehicle and basic info
        // If we need full KYC details, we can fetch them on-demand when viewing
        const driversWithDetails = list.map((driver: any) => {
          const vehicle = driver.vehicle || (driver.vehicles && driver.vehicles[0]) || null;
          return {
            id: driver.id,
            name: driver.name || driver.username,
            username: driver.username,
            email: driver.email,
            mobile: driver.mobile || driver.phone,
            phone: driver.phone || driver.mobile,
            shortCode: driver.shortCode,
            rating: driver.rating,
            active: driver.active !== false,
            vehicle: vehicle ? {
              id: vehicle.id,
              licensePlate: vehicle.licensePlate || vehicle.licencePlateNumber,
              vehicleCategory: vehicle.vehicleCategory,
              vehicleType: vehicle.vehicleType,
              serviceType: vehicle.serviceType,
              model: vehicle.model,
              company: vehicle.company,
              year: vehicle.year,
            } : undefined,
            kyc: driver.kyc || (driver.kycStatus ? { status: driver.kycStatus } : null),
            totalTrips: driver.totalTrips || driver.totalRides || 0,
            totalEarnings: driver.totalEarnings || 0,
            driverLevel: driver.driverLevel || driver.level,
          };
        });

        setDrivers(driversWithDetails);
      } else {
        setError(typeof response.payload === "string" ? response.payload : "Failed to fetch drivers");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = drivers;
    
    // Filter by status
    if (filterTab === "Active") {
      result = result.filter((d) => d.active !== false);
    } else if (filterTab === "Inactive") {
      result = result.filter((d) => d.active === false);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(query) ||
          d.username?.toLowerCase().includes(query) ||
          d.email?.toLowerCase().includes(query) ||
          d.mobile?.toLowerCase().includes(query) ||
          d.phone?.toLowerCase().includes(query) ||
          d.shortCode?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [drivers, filterTab, searchQuery]);

  const total = drivers.length;
  const active = drivers.filter((d) => d.active !== false).length;
  const inactive = total - active;
  const carDriver = drivers.filter((d) => isCar(d.vehicle)).length;
  const motorbikeDriver = drivers.filter((d) => isMotorbike(d.vehicle)).length;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={fetchDrivers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics header */}
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Driver Analytical Data</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[{
            label: "Total Driver", value: total, icon: "🧑‍🤝‍🧑"
          }, {
            label: "Active Driver", value: active, icon: "🟢"
          }, {
            label: "Inactive Driver", value: inactive, icon: "🔴"
          }, {
            label: "Car Driver", value: carDriver, icon: "🚗"
          }, {
            label: "Motorbike Driver", value: motorbikeDriver, icon: "🏍️"
          }].map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-700 grid place-items-center text-lg">{c.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                <div className="text-sm text-gray-600">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver List */}
      <div>
        <h3 className="text-2xl font-extrabold text-gray-900">Driver List</h3>
        <div className="mt-3 inline-flex bg-teal-600/10 rounded-lg overflow-hidden ring-1 ring-teal-600/20">
          {(["All", "Active", "Inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition ${filterTab === tab ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-600/20"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-lg">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here by name"
                className="w-full border border-gray-200 rounded-lg pl-11 pr-3 py-2 focus:ring-2 focus:ring-teal-500 shadow-sm hover:shadow-md transition"
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDrivers} className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Refresh">⟳</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Settings">⚙</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition" title="Download">⬇</button>
            <a href="/admin/driver-setup/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700">+ Add Driver</a>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Contact Info</th>
                <th className="px-4 py-2 text-left">Vehicle</th>
                <th className="px-4 py-2 text-left">KYC Status</th>
                <th className="px-4 py-2 text-left">Level</th>
                <th className="px-4 py-2 text-left">Total Trip</th>
                <th className="px-4 py-2 text-left">Earning</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 10 }).map((__, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>))}
                </tr>
              ))}
              {!isLoading && filtered.map((d: Driver, idx: number) => {
                const kycStatus = d.kyc?.status || "PENDING";
                const kycStatusColors = {
                  APPROVED: "bg-green-100 text-green-700",
                  PENDING: "bg-yellow-100 text-yellow-700",
                  REJECTED: "bg-red-100 text-red-700",
                };
                
                return (
                  <tr key={d.id || idx} className="hover:bg-gray-50 hover:shadow-sm transition rounded">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {(d.name || d.username || "?").split(" ").map(n => n?.[0] || "").join("").substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{d.name || d.username || "Driver Name"}</div>
                        <div className="text-xs text-gray-500">{d.email || "N/A"}</div>
                        {d.shortCode && (
                          <div className="text-xs text-gray-400">Code: {d.shortCode}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-700 leading-tight">
                        <div>{d.mobile || d.phone || "N/A"}</div>
                        <div>{d.email || "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {d.vehicle ? (
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <span className="text-lg" title={d.vehicle.serviceType || d.vehicle.vehicleType || d.vehicle.vehicleCategory || "Vehicle"}>
                            {getVehicleIcon(d.vehicle)}
                          </span>
                          <div>
                            <div className="font-medium">{d.vehicle.licensePlate || "N/A"}</div>
                            <div className="text-gray-500">
                              {d.vehicle.serviceType || d.vehicle.vehicleType || d.vehicle.vehicleCategory || d.vehicle.model || "N/A"}
                              {d.vehicle.company && d.vehicle.model && ` - ${d.vehicle.company} ${d.vehicle.model}`}
                              {d.vehicle.year && ` (${d.vehicle.year})`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No vehicle</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${kycStatusColors[kycStatus] || kycStatusColors.PENDING}`}>
                        {kycStatus}
                      </span>
                      {d.kyc?.licenseNumber && (
                        <div className="text-xs text-gray-500 mt-1">License: {d.kyc.licenseNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{d.driverLevel || "N/A"}</td>
                    <td className="px-4 py-3">{d.totalTrips || 0}</td>
                    <td className="px-4 py-3">₹{d.totalEarnings?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${d.active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {d.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => router.push(`/admin/drivers/${d.id}`)}
                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                        title="View Details"
                      >
                        👁
                      </button>
                      <button
                        onClick={() => router.push(`/admin/drivers/${d.id}`)}
                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                        title="Edit"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10" colSpan={10}>
                    <div className="mx-auto max-w-md text-center">
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"><span className="text-gray-400 text-2xl">📁</span></div>
                      <p className="mt-3 text-gray-700 font-medium">No data available</p>
                      <p className="mt-1 text-sm text-gray-500">Add a driver to see them here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





