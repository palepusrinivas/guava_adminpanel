"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getOperationZones } from "@/utils/reducers/adminReducers";
import { setSearchQuery } from "@/utils/slices/tripFareSlice";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
  LocalShipping as LocalShippingIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const vehicleCategories = [
  { name: "Auto", key: "auto", icon: "🚗" },
  { name: "Mega", key: "mega", icon: "🛺" },
  { name: "Small Car / Sedan", key: "sedan", icon: "🚙" },
  { name: "Bike", key: "bike", icon: "🏍️" },
  { name: "Mahila Ride", key: "mahila", icon: "🚕" },
  { name: "Car (XL SUV)-(MUV)", key: "suv", icon: "🚐" },
];

export default function TripFareSetup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { operationZones, isLoading, error, searchQuery } = useAppSelector((s) => s.tripFare);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    dispatch(getOperationZones()).catch(() => {});
  }, [dispatch]);

  const filteredZones = useMemo(() => {
    if (!searchQuery) return operationZones;
    const q = searchQuery.toLowerCase();
    return operationZones.filter((zone) => zone.name.toLowerCase().includes(q));
  }, [operationZones, searchQuery]);

  // Sample data if API is not available
  const sampleZones: typeof operationZones = [
    {
      id: 1,
      name: "AMALAPURAM",
      totalDrivers: 4,
      vehicleCategories: [
        { name: "Auto", checked: false },
        { name: "Mega", checked: true },
        { name: "Small Car / Sedan", checked: true },
        { name: "Bike", checked: true },
        { name: "Mahila Ride", checked: false },
        { name: "Car (XL SUV)-(MUV)", checked: true },
      ],
    },
    {
      id: 2,
      name: "hyd",
      totalDrivers: 4,
      vehicleCategories: [
        { name: "Auto", checked: false },
        { name: "Mega", checked: true },
        { name: "Small Car / Sedan", checked: true },
        { name: "Bike", checked: true },
        { name: "Mahila Ride", checked: false },
        { name: "Car (XL SUV)-(MUV)", checked: true },
      ],
    },
  ];

  const zonesToDisplay = isLoading || operationZones.length === 0 ? sampleZones : filteredZones;

  const handleViewFareSetup = (zoneId: string | number) => {
    router.push(`/admin/fare/trip/${zoneId}`);
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8" />
                Trip Fare Setup
              </h1>
              <p className="text-teal-50 text-lg">Manage your ride sharing fares zone wise</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  placeholder="Search zones..."
                  className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-200"
                />
              </div>
              {/* View Toggle */}
              <div className="hidden md:flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-teal-600 shadow-md"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-teal-600 shadow-md"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Unable to load operation zones from server. Displaying sample data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{zonesToDisplay.length}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <LocationOnIcon className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {zonesToDisplay.reduce((sum, zone) => sum + (zone.totalDrivers || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <LocalShippingIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{vehicleCategories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <SettingsIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Operation Zone List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Operation Zones</h2>
          <div className="text-sm text-gray-500">
            {zonesToDisplay.length} {zonesToDisplay.length === 1 ? "zone" : "zones"} found
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {zonesToDisplay.map((zone, index) => (
              <ZoneCard
                key={zone.id || index}
                zone={zone}
                index={index}
                onViewFareSetup={handleViewFareSetup}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {zonesToDisplay.map((zone, index) => (
              <ZoneListItem
                key={zone.id || index}
                zone={zone}
                index={index}
                onViewFareSetup={handleViewFareSetup}
              />
            ))}
          </div>
        )}

        {!isLoading && zonesToDisplay.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <LocationOnIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No operation zones found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery ? "Try adjusting your search query" : "Zones will appear here once they are added"}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Modern Zone Card Component
function ZoneCard({
  zone,
  index,
  onViewFareSetup,
}: {
  zone: any;
  index: number;
  onViewFareSetup: (zoneId: string | number) => void;
}) {
  const activeCategories = (zone.vehicleCategories || []).filter((vc: any) => vc.checked);
  
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {index + 1}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{zone.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <LocalShippingIcon className="w-4 h-4" />
                <span className="font-medium">{zone.totalDrivers || 0} Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Categories */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Available Vehicle Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {vehicleCategories.map((category) => {
              const zoneCategory = (zone.vehicleCategories || []).find(
                (vc: any) => vc.name === category.name || vc.name?.toLowerCase() === category.key
              );
              const isChecked = zoneCategory?.checked ?? false;
              
              if (!isChecked) return null;
              
              return (
                <span
                  key={category.key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg text-sm font-medium text-teal-700"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              );
            })}
          </div>
          {activeCategories.length === 0 && (
            <p className="text-sm text-gray-400 italic">No categories configured</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewFareSetup(zone.id)}
          className="w-full group/btn flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span>View Fare Setup</span>
          <ArrowForwardIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// List View Component
function ZoneListItem({
  zone,
  index,
  onViewFareSetup,
}: {
  zone: any;
  index: number;
  onViewFareSetup: (zoneId: string | number) => void;
}) {
  const activeCategories = (zone.vehicleCategories || []).filter((vc: any) => vc.checked);
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            {/* Zone Number */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {index + 1}
            </div>
            
            {/* Zone Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                  <LocalShippingIcon className="w-4 h-4" />
                  <span className="font-medium">{zone.totalDrivers || 0} Drivers</span>
                </div>
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {vehicleCategories.map((category) => {
                  const zoneCategory = (zone.vehicleCategories || []).find(
                    (vc: any) => vc.name === category.name || vc.name?.toLowerCase() === category.key
                  );
                  const isChecked = zoneCategory?.checked ?? false;
                  
                  if (!isChecked) return null;
                  
                  return (
                    <span
                      key={category.key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md text-xs font-medium text-teal-700"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={() => onViewFareSetup(zone.id)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span>View Fare Setup</span>
              <ArrowForwardIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
