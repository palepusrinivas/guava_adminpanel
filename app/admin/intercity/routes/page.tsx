"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getIntercityRoutes,
  createIntercityRoute,
  updateIntercityRoute,
  deleteIntercityRoute,
} from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import type { IntercityRoute } from "@/utils/slices/intercitySlice";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { config } from "@/utils/config";
import axios from "axios";

const emptyRoute: Omit<IntercityRoute, "id"> = {
  routeCode: "",
  originName: "",
  originLatitude: 0,
  originLongitude: 0,
  destinationName: "",
  destinationLatitude: 0,
  destinationLongitude: 0,
  distanceKm: 0,
  durationMinutes: 0,
  priceMultiplier: 1.0,
  isActive: true,
  bidirectional: true,
};

export default function IntercityRoutesPage() {
  const dispatch = useAppDispatch();
  const { routes, isLoading, error } = useAppSelector((state) => state.intercity);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<IntercityRoute | null>(null);
  const [formData, setFormData] = useState<Omit<IntercityRoute, "id">>(emptyRoute);
  const [searchQuery, setSearchQuery] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Google Places Autocomplete refs
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(getIntercityRoutes());
    }
  }, [dispatch, mounted]);

  const handleOpenCreate = () => {
    setEditingRoute(null);
    setFormData(emptyRoute);
    setDurationHours(0);
    setDurationMinutes(0);
    setShowModal(true);
  };
  
  // Calculate distance and duration using Google Maps Directions API
  const calculateDistanceAndDuration = async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ) => {
    if (!originLat || !originLng || !destLat || !destLng) {
      return;
    }

    setIsCalculating(true);
    try {
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${config.GOOGLE_MAPS_API_KEY}`;
      const directionsResponse = await axios.get(directionsUrl);

      if (directionsResponse.data.status === "OK" && directionsResponse.data.routes.length > 0) {
        const route = directionsResponse.data.routes[0];
        const leg = route.legs[0];
        const distanceKm = leg.distance.value / 1000; // Convert meters to km
        const durationMin = Math.round(leg.duration.value / 60); // Convert seconds to minutes

        const hours = Math.floor(durationMin / 60);
        const minutes = durationMin % 60;

        setFormData((prev) => ({
          ...prev,
          distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal place
          durationMinutes: durationMin,
        }));
        setDurationHours(hours);
        setDurationMinutes(minutes);

        toast.success("Distance and duration calculated automatically");
      } else {
        console.error("Directions API error:", directionsResponse.data.status);
        toast.error("Could not calculate route. Please enter values manually.");
      }
    } catch (error: any) {
      console.error("Error calculating distance and duration:", error);
      toast.error("Failed to calculate route. Please enter values manually.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle origin place selection
  const onOriginPlaceChanged = () => {
    if (originAutocompleteRef.current) {
      const place = originAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const updatedFormData = {
          ...formData,
          originName: place.formatted_address || place.name || "",
          originLatitude: lat,
          originLongitude: lng,
        };
        setFormData(updatedFormData);

        // Auto-calculate if destination is also set
        if (updatedFormData.destinationLatitude && updatedFormData.destinationLongitude) {
          calculateDistanceAndDuration(
            lat,
            lng,
            updatedFormData.destinationLatitude,
            updatedFormData.destinationLongitude
          );
        }
      }
    }
  };

  // Handle destination place selection
  const onDestinationPlaceChanged = () => {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const updatedFormData = {
          ...formData,
          destinationName: place.formatted_address || place.name || "",
          destinationLatitude: lat,
          destinationLongitude: lng,
        };
        setFormData(updatedFormData);

        // Auto-calculate if origin is also set
        if (updatedFormData.originLatitude && updatedFormData.originLongitude) {
          calculateDistanceAndDuration(
            updatedFormData.originLatitude,
            updatedFormData.originLongitude,
            lat,
            lng
          );
        }
      }
    }
  };

  const handleOpenEdit = (route: IntercityRoute) => {
    setEditingRoute(route);
    const totalMinutes = route.durationMinutes;
    setDurationHours(Math.floor(totalMinutes / 60));
    setDurationMinutes(totalMinutes % 60);
    setFormData({
      routeCode: route.routeCode,
      originName: route.originName,
      originLatitude: route.originLatitude,
      originLongitude: route.originLongitude,
      destinationName: route.destinationName,
      destinationLatitude: route.destinationLatitude,
      destinationLongitude: route.destinationLongitude,
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      priceMultiplier: route.priceMultiplier,
      isActive: route.isActive,
      bidirectional: route.bidirectional,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert hours and minutes to total minutes
      const totalMinutes = durationHours * 60 + durationMinutes;
      const submitData = {
        ...formData,
        durationMinutes: totalMinutes,
      };
      
      if (editingRoute && editingRoute.id) {
        const result = await dispatch(
          updateIntercityRoute({ routeId: editingRoute.id, routeData: submitData })
        );
        if (updateIntercityRoute.fulfilled.match(result)) {
          toast.success("Route updated successfully!");
          setShowModal(false);
          dispatch(getIntercityRoutes());
        } else {
          toast.error("Failed to update route");
        }
      } else {
        const result = await dispatch(createIntercityRoute(submitData));
        if (createIntercityRoute.fulfilled.match(result)) {
          toast.success("Route created successfully!");
          setShowModal(false);
          dispatch(getIntercityRoutes());
        } else {
          toast.error("Failed to create route");
        }
      }
    } catch {
      toast.error("An error occurred while saving route");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const result = await dispatch(deleteIntercityRoute(id));
        if (deleteIntercityRoute.fulfilled.match(result)) {
          toast.success("Route deleted successfully");
        } else {
          toast.error("Failed to delete route");
        }
      } catch {
        toast.error("An error occurred while deleting route");
      }
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.originName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">Route Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure intercity travel routes with origin and destination points
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-teal-700"
          >
            + Add Route
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by route code, origin, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Routes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
            </div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🛤️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No Routes Found" : "No Routes Configured"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Get started by adding your first intercity route."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-teal-700"
              >
                + Add Route
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className={!route.isActive ? "bg-gray-50 opacity-60" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{route.routeCode}</div>
                      {route.bidirectional && (
                        <span className="text-xs text-gray-500">↔ Bidirectional</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.originName}</div>
                      <div className="text-xs text-gray-500">
                        {route.originLatitude.toFixed(4)}, {route.originLongitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.destinationName}</div>
                      <div className="text-xs text-gray-500">
                        {route.destinationLatitude.toFixed(4)}, {route.destinationLongitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.distanceKm} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.priceMultiplier}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          route.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {route.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEdit(route)}
                        className="text-teal-600 hover:text-teal-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => route.id && handleDelete(route.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRoute ? "Edit Route" : "Add Route"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Code</label>
                <input
                  type="text"
                  value={formData.routeCode}
                  onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                  placeholder="e.g., HYD-VJA"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              {/* Origin Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Origin Point</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Origin Name</label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          originAutocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={onOriginPlaceChanged}
                        options={{
                          types: ["(cities)"],
                        }}
                      >
                        <input
                          type="text"
                          value={formData.originName}
                          onChange={(e) => setFormData({ ...formData, originName: e.target.value })}
                          placeholder="e.g., Hyderabad"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        value={formData.originName}
                        onChange={(e) => setFormData({ ...formData, originName: e.target.value })}
                        placeholder="e.g., Hyderabad"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    )}
                    {loadError && (
                      <p className="mt-1 text-xs text-red-600">Failed to load Google Maps. Please check your API key.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.originLatitude}
                      onChange={(e) => setFormData({ ...formData, originLatitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.originLongitude}
                      onChange={(e) => setFormData({ ...formData, originLongitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Destination Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Destination Point</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Destination Name</label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          destinationAutocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={onDestinationPlaceChanged}
                        options={{
                          types: ["(cities)"],
                        }}
                      >
                        <input
                          type="text"
                          value={formData.destinationName}
                          onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                          placeholder="e.g., Vijayawada"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        value={formData.destinationName}
                        onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                        placeholder="e.g., Vijayawada"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    )}
                    {loadError && (
                      <p className="mt-1 text-xs text-red-600">Failed to load Google Maps. Please check your API key.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.destinationLatitude}
                      onChange={(e) => setFormData({ ...formData, destinationLatitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.destinationLongitude}
                      onChange={(e) => setFormData({ ...formData, destinationLongitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Route Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Distance (km)
                      {isCalculating && (
                        <span className="ml-2 text-xs text-teal-600">Calculating...</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      min="0"
                      disabled={isCalculating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (hours)
                      {isCalculating && (
                        <span className="ml-2 text-xs text-teal-600">Calculating...</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={durationHours}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        setDurationHours(hours);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      min="0"
                      disabled={isCalculating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                      {isCalculating && (
                        <span className="ml-2 text-xs text-teal-600">Calculating...</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value) || 0;
                        setDurationMinutes(mins >= 60 ? 59 : mins);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      min="0"
                      max="59"
                      disabled={isCalculating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMultiplier}
                      onChange={(e) => setFormData({ ...formData, priceMultiplier: parseFloat(e.target.value) || 1 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      min="0.01"
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total Duration: {durationHours}h {durationMinutes}m ({durationHours * 60 + durationMinutes} minutes)
                </div>
              </div>

              {/* Options */}
              <div className="border-t pt-4 flex space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bidirectional}
                    onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Bidirectional Route</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : editingRoute ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

