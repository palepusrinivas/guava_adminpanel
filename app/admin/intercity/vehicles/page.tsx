"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getIntercityVehicles,
  saveIntercityVehicle,
  deleteIntercityVehicle,
  seedIntercityVehicles,
} from "@/utils/reducers/intercityReducers";
import { toast } from "react-hot-toast";
import type { IntercityVehicleConfig, IntercityVehicleType } from "@/utils/slices/intercitySlice";

const VEHICLE_TYPES: { value: IntercityVehicleType; label: string }[] = [
  { value: "CAR_PREMIUM_EXPRESS", label: "Car Premium Express" },
  { value: "CAR_NORMAL", label: "Car Normal Share" },
  { value: "AUTO_NORMAL", label: "Auto Normal Pool" },
  { value: "TATA_MAGIC_LITE", label: "Tata Magic Lite" },
];

const emptyVehicle: Omit<IntercityVehicleConfig, "id"> = {
  vehicleType: "CAR_NORMAL",
  displayName: "",
  totalPrice: 0,
  maxSeats: 4,
  minSeats: 1,
  description: "",
  targetCustomer: "",
  recommendationTag: "",
  displayOrder: 1,
  isActive: true,
  imageUrl: "",
};

export default function IntercityVehiclesPage() {
  const dispatch = useAppDispatch();
  const { vehicles, isLoading, error } = useAppSelector((state) => state.intercity);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<IntercityVehicleConfig | null>(null);
  const [formData, setFormData] = useState<Omit<IntercityVehicleConfig, "id">>(emptyVehicle);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(getIntercityVehicles());
    }
  }, [dispatch, mounted]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData(emptyVehicle);
    setShowModal(true);
  };

  const handleOpenEdit = (vehicle: IntercityVehicleConfig) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleType: vehicle.vehicleType,
      displayName: vehicle.displayName,
      totalPrice: vehicle.totalPrice,
      maxSeats: vehicle.maxSeats,
      minSeats: vehicle.minSeats,
      description: vehicle.description || "",
      targetCustomer: vehicle.targetCustomer || "",
      recommendationTag: vehicle.recommendationTag || "",
      displayOrder: vehicle.displayOrder,
      isActive: vehicle.isActive,
      imageUrl: vehicle.imageUrl || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = editingVehicle
        ? { ...formData, id: editingVehicle.id }
        : formData;
      
      const result = await dispatch(saveIntercityVehicle(dataToSave as IntercityVehicleConfig));
      if (saveIntercityVehicle.fulfilled.match(result)) {
        toast.success(editingVehicle ? "Vehicle updated successfully!" : "Vehicle created successfully!");
        setShowModal(false);
        dispatch(getIntercityVehicles());
      } else {
        toast.error("Failed to save vehicle");
      }
    } catch {
      toast.error("An error occurred while saving vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle configuration?")) {
      try {
        const result = await dispatch(deleteIntercityVehicle(id));
        if (deleteIntercityVehicle.fulfilled.match(result)) {
          toast.success("Vehicle deleted successfully");
        } else {
          toast.error("Failed to delete vehicle");
        }
      } catch {
        toast.error("An error occurred while deleting vehicle");
      }
    }
  };

  const handleSeedVehicles = async () => {
    try {
      const result = await dispatch(seedIntercityVehicles());
      if (seedIntercityVehicles.fulfilled.match(result)) {
        toast.success("Default vehicles seeded successfully!");
        dispatch(getIntercityVehicles());
      } else {
        toast.error("Failed to seed vehicles");
      }
    } catch {
      toast.error("An error occurred while seeding vehicles");
    }
  };

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
          <h1 className="text-3xl font-bold text-teal-700">Vehicle Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure intercity vehicle types, pricing, and seat capacity
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={handleSeedVehicles}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Seed Defaults
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-teal-700"
          >
            + Add Vehicle Type
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Vehicle Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Types Configured</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding a new vehicle type or seeding default configurations.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleSeedVehicles}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Seed Defaults
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-teal-700"
            >
              + Add Vehicle Type
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((vehicle) => (
              <div
                key={vehicle.id}
                className={`bg-white shadow rounded-lg overflow-hidden ${
                  !vehicle.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">{vehicle.vehicleType}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {vehicle.recommendationTag && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded">
                      {vehicle.recommendationTag}
                    </span>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Base Price:</span>
                      <span className="font-medium text-gray-900">₹{vehicle.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Seats:</span>
                      <span className="font-medium text-gray-900">
                        {vehicle.minSeats} - {vehicle.maxSeats}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Order:</span>
                      <span className="font-medium text-gray-900">{vehicle.displayOrder}</span>
                    </div>
                  </div>

                  {vehicle.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}

                  {vehicle.targetCustomer && (
                    <p className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Target:</span> {vehicle.targetCustomer}
                    </p>
                  )}
                </div>

                <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(vehicle)}
                    className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => vehicle.id && handleDelete(vehicle.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVehicle ? "Edit Vehicle Type" : "Add Vehicle Type"}
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
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as IntercityVehicleType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price (₹)</label>
                  <input
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Seats</label>
                  <input
                    type="number"
                    value={formData.minSeats}
                    onChange={(e) => setFormData({ ...formData, minSeats: parseInt(e.target.value) || 1 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Seats</label>
                  <input
                    type="number"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 1 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Customer</label>
                <input
                  type="text"
                  value={formData.targetCustomer}
                  onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                  placeholder="e.g., Professionals, Business Travelers"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Recommendation Tag</label>
                <input
                  type="text"
                  value={formData.recommendationTag}
                  onChange={(e) => setFormData({ ...formData, recommendationTag: e.target.value })}
                  placeholder="e.g., Best Value, Fast & Comfort"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Active</label>
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
                  {isLoading ? "Saving..." : editingVehicle ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

