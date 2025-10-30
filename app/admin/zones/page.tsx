"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getZones, createZone, updateZone, deleteZone } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import ZoneSetup from "@/components/Admin/ZoneSetup";
import ZoneList from "@/components/Admin/ZoneList";
import { Zone } from "@/utils/slices/zoneSlice";
import ZoneManagement from "@/components/Admin/ZoneManagement";

export default function AdminZonesPage() {
  const dispatch = useAppDispatch();
  const { zones, isLoading } = useAppSelector((state) => state.zone);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    dispatch(getZones());
  }, [dispatch]);

  const handleCreateZone = async (zoneData: any) => {
    try {
      const response = await dispatch(createZone(zoneData));
      if (createZone.fulfilled.match(response)) {
        toast.success("Zone created successfully! 🎉");
        dispatch(getZones());
      } else {
        toast.error("Failed to create zone");
      }
    } catch (error) {
      toast.error("An error occurred while creating zone");
    }
  };

  const handleUpdateZone = async (zoneId: string | number, zoneData: any) => {
    try {
      const response = await dispatch(updateZone({ zoneId: String(zoneId), zoneData }));
      if (updateZone.fulfilled.match(response)) {
        toast.success("Zone updated successfully! ✓");
        dispatch(getZones());
        setShowEditModal(false);
        setSelectedZone(null);
      } else {
        toast.error("Failed to update zone");
      }
    } catch (error) {
      toast.error("An error occurred while updating zone");
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        const response = await dispatch(deleteZone(String(zoneId)));
        if (deleteZone.fulfilled.match(response)) {
          toast.success("Zone deleted successfully");
          dispatch(getZones());
        } else {
          toast.error("Failed to delete zone");
        }
      } catch (error) {
        toast.error("An error occurred while deleting zone");
      }
    }
  };

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(zone);
    setShowEditModal(true);
  };

  const handleViewZone = (zone: Zone) => {
    setSelectedZone(zone);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-teal-700">Zone Setup</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create and manage service zones for your ride-sharing platform
        </p>
      </div>

      {/* Zone Setup Component */}
      <ZoneSetup onCreateZone={handleCreateZone} />

      {/* Zone List Component */}
      <ZoneList
        zones={zones}
        isLoading={isLoading}
        onEdit={handleEditZone}
        onDelete={handleDeleteZone}
        onView={handleViewZone}
      />

      {/* Edit Modal - Reusing existing ZoneManagement modal */}
      {showEditModal && selectedZone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Zone</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedZone(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateZone(selectedZone.id, {
                    readableId: formData.get("readableId"),
                    name: formData.get("name"),
                    polygonWkt: formData.get("polygonWkt"),
                    active: formData.get("active") === "on",
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone ID</label>
                  <input
                    type="text"
                    name="readableId"
                    defaultValue={selectedZone.readableId}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedZone.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Polygon Coordinates (WKT)</label>
                  <textarea
                    name="polygonWkt"
                    rows={4}
                    defaultValue={selectedZone.polygonWkt}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedZone.active}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Zone</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedZone(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedZone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Zone Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedZone(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedZone.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Zone ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedZone.readableId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedZone.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedZone.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedZone.active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Polygon Coordinates (WKT)</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <pre className="text-xs font-mono text-gray-900 whitespace-pre-wrap break-all">
                      {selectedZone.polygonWkt}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedZone(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditZone(selectedZone);
                  }}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Edit Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
