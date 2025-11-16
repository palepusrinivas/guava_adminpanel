"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getOperationZones } from "@/utils/reducers/adminReducers";
import { setSearchQuery } from "@/utils/slices/tripFareSlice";
import { useRouter } from "next/navigation";

export default function ParcelFareSetup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { operationZones, isLoading, error, searchQuery } = useAppSelector((s) => s.tripFare);

  useEffect(() => {
    dispatch(getOperationZones()).catch(() => {});
  }, [dispatch]);

  const filteredZones = useMemo(() => {
    if (!searchQuery) return operationZones;
    const q = searchQuery.toLowerCase();
    return operationZones.filter((zone) => zone.name.toLowerCase().includes(q));
  }, [operationZones, searchQuery]);

  // Sample data if API is not available - matching the image
  const sampleZones: typeof operationZones = [
    {
      id: 1,
      name: "Amalapuram",
      totalDrivers: 131,
      parcelCategories: [],
    },
    {
      id: 2,
      name: "rajamundry",
      totalDrivers: 16,
      parcelCategories: [],
    },
    {
      id: 3,
      name: "kakinada",
      totalDrivers: 26,
      parcelCategories: [],
    },
  ];

  const zonesToDisplay = isLoading || operationZones.length === 0 ? sampleZones : filteredZones;

  const handleViewFareSetup = (zoneId: string | number) => {
    // Navigate to parcel fare setup detail page or open modal
    router.push(`/admin/fare/parcel/${zoneId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Teal Background */}
      <div className="bg-teal-500 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Parcel Delivery Fare Setup</h2>
          <p className="text-white/90 mt-2">Manage your parcel fares zone wise</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
          Unable to load operation zones from server. Displaying sample data. Ensure backend endpoints are implemented.
          Error: {error}
        </div>
      )}

      {/* Main Content Card - White Background */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Operation Zone Wise Parcel Fare Setup</h3>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <input
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search"
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
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium whitespace-nowrap">
            Search
          </button>
        </div>

        {/* Zone List */}
        <div className="space-y-6">
          {zonesToDisplay.map((zone, index) => (
            <div
              key={zone.id || index}
              className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              {/* Left Side - Zone Info with Numbered Circle */}
              <div className="flex items-start space-x-4 flex-shrink-0">
                <div className="text-center">
                  {/* Numbered Circle */}
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                    {index + 1}
                  </div>
                  {/* Zone Name */}
                  <p className="font-bold text-gray-900 text-sm capitalize whitespace-nowrap">
                    {zone.name}
                  </p>
                  {/* Total Driver */}
                  <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                    Total driver: {zone.totalDrivers}
                  </p>
                </div>
              </div>

              {/* Right Side - Parcel Categories & Button */}
              <div className="flex items-center justify-end space-x-4 flex-1 ml-8">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Available Parcel Categories In This Zone
                  </p>
                </div>
                <button
                  onClick={() => handleViewFareSetup(zone.id)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2 font-medium flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>View Fare Setup</span>
                </button>
              </div>
            </div>
          ))}
          {!isLoading && zonesToDisplay.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No operation zones found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

