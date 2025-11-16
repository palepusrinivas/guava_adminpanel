"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getOperationZones } from "@/utils/reducers/adminReducers";
import { setSearchQuery } from "@/utils/slices/tripFareSlice";
import { useRouter } from "next/navigation";

const vehicleCategories = [
  { name: "Auto", key: "auto" },
  { name: "Mega", key: "mega" },
  { name: "Small Car / Sedan", key: "sedan" },
  { name: "Bike.", key: "bike" },
  { name: "Mahila Ride", key: "mahila" },
  { name: "Car (XL SUV)-(MUV)", key: "suv" },
];

export default function TripFareSetup() {
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

  // Sample data if API is not available
  const sampleZones: typeof operationZones = [
    {
      id: 1,
      name: "Amalapuram",
      totalDrivers: 131,
      vehicleCategories: [
        { name: "Auto", checked: false },
        { name: "Mega", checked: true },
        { name: "Small Car / Sedan", checked: true },
        { name: "Bike.", checked: true },
        { name: "Mahila Ride", checked: false },
        { name: "Car (XL SUV)-(MUV)", checked: true },
      ],
    },
    {
      id: 2,
      name: "Rajamundry",
      totalDrivers: 16,
      vehicleCategories: [
        { name: "Auto", checked: false },
        { name: "Mega", checked: true },
        { name: "Small Car / Sedan", checked: true },
        { name: "Bike.", checked: true },
        { name: "Mahila Ride", checked: false },
        { name: "Car (XL SUV)-(MUV)", checked: true },
      ],
    },
    {
      id: 3,
      name: "Kakinada",
      totalDrivers: 26,
      vehicleCategories: [
        { name: "Auto", checked: false },
        { name: "Mega", checked: true },
        { name: "Small Car / Sedan", checked: true },
        { name: "Bike.", checked: true },
        { name: "Mahila Ride", checked: false },
        { name: "Car (XL SUV)-(MUV)", checked: true },
      ],
    },
  ];

  const zonesToDisplay = isLoading || operationZones.length === 0 ? sampleZones : filteredZones;

  const handleViewFareSetup = (zoneId: string | number) => {
    // Navigate to fare setup detail page or open modal
    router.push(`/admin/fare/trip/${zoneId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Trip Fare Setup</h2>
            <p className="text-white/90 mt-1">Manage your ride sharing fares zone wise</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search zones..."
                className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-white outline-none bg-white/90 text-gray-900"
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
            <button className="px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-white/90 font-medium">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
          Unable to load operation zones from server. Displaying sample data. Ensure backend endpoints are implemented.
          Error: {error}
        </div>
      )}

      {/* Operation Zone List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 px-2">Operation Zone List</h3>
        {zonesToDisplay.map((zone, index) => (
          <div key={zone.id || index} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Zone Number Circle */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Zone Info */}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{zone.name}</h4>
                  <p className="text-gray-600 mb-4">Total Driver : {zone.totalDrivers}</p>

                  {/* Available Vehicle Categories */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Vehicle Category In This Zone</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {vehicleCategories.map((category) => {
                        const zoneCategory = (zone as any).vehicleCategories?.find(
                          (vc: any) => vc.name === category.name || vc.name?.toLowerCase() === category.key
                        );
                        const isChecked = zoneCategory?.checked ?? false;
                        return (
                          <label
                            key={category.key}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled
                              readOnly
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Fare Setup Button */}
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => handleViewFareSetup(zone.id)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2 font-medium"
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
          </div>
        ))}
        {!isLoading && zonesToDisplay.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500">No operation zones found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

