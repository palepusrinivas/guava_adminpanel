"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppSelector } from "@/utils/store/store";
import { Zone } from "@/utils/slices/zoneSlice";

interface ZoneManagementProps {
  // Handlers may be async (return Promise) or sync (void)
  onCreateZone: (zoneData: any) => void | Promise<void>;
  // Zone IDs can be strings or numbers depending on backend; accept both
  onUpdateZone: (zoneId: string | number, zoneData: any) => void | Promise<void>;
  onDeleteZone: (zoneId: string | number) => void | Promise<void>;
}

const zoneValidationSchema = yup.object({
  readableId: yup.string().required("Zone ID is required"),
  name: yup.string().required("Zone name is required"),
  polygonWkt: yup.string().required("Polygon coordinates are required"),
  active: yup.boolean(),
});

function ZoneManagement({ onCreateZone, onUpdateZone, onDeleteZone }: ZoneManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  const createFormik = useFormik({
    initialValues: {
      readableId: "",
      name: "",
      polygonWkt: "",
      active: true,
    },
    validationSchema: zoneValidationSchema,
    onSubmit: (values) => {
      onCreateZone(values);
      setShowCreateModal(false);
      createFormik.resetForm();
    },
  });

  const editFormik = useFormik({
    initialValues: {
      readableId: selectedZone?.readableId || "",
      name: selectedZone?.name || "",
      polygonWkt: selectedZone?.polygonWkt || "",
      active: selectedZone?.active || true,
    },
    validationSchema: zoneValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
        // selectedZone.id may be number|string depending on the data source
        onUpdateZone(selectedZone.id, values);
      setShowEditModal(false);
      setSelectedZone(null);
    },
  });

  const handleEditZone = (zone: any) => {
    setSelectedZone(zone);
    setShowEditModal(true);
  };

  const handleViewZone = (zone: any) => {
    setSelectedZone(zone);
    setShowViewModal(true);
  };

  const handleDeleteZone = (zoneId: string | number) => {
    onDeleteZone(zoneId);
  };

  // Get zones data from Redux store
  const { zones, isLoading, error } = useAppSelector((state) => state.zone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zone Management</h1>
          <p className="text-gray-600">Manage service zones and coverage areas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Zone
        </button>
      </div>

      {/* Zones Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No zones found. Create your first zone to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {zones.map((zone) => (
                    <tr key={zone.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{zone.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.readableId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          zone.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {zone.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewZone(zone)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Zone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Zone</h3>
              <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone ID</label>
                  <input
                    type="text"
                    name="readableId"
                    value={createFormik.values.readableId}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ZONE_001"
                  />
                  {createFormik.touched.readableId && createFormik.errors.readableId && typeof createFormik.errors.readableId === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.readableId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                  <input
                    type="text"
                    name="name"
                    value={createFormik.values.name}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Downtown"
                  />
                  {createFormik.touched.name && createFormik.errors.name && typeof createFormik.errors.name === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Polygon Coordinates (WKT)</label>
                  <textarea
                    name="polygonWkt"
                    rows={4}
                    value={createFormik.values.polygonWkt}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                    placeholder="POLYGON((lng1 lat1, lng2 lat2, lng3 lat3, lng1 lat1))"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: POLYGON((77.5946 12.9716, 77.6208 12.9716, 77.6208 12.9946, 77.5946 12.9946, 77.5946 12.9716))
                  </p>
                  {createFormik.touched.polygonWkt && createFormik.errors.polygonWkt && typeof createFormik.errors.polygonWkt === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.polygonWkt}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={createFormik.values.active}
                    onChange={createFormik.handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Zone</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Zone Modal */}
      {showViewModal && selectedZone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Zone Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedZone.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
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
                  onClick={() => setShowViewModal(false)}
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

      {/* Edit Zone Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Zone</h3>
              <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone ID</label>
                  <input
                    type="text"
                    name="readableId"
                    value={editFormik.values.readableId}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.readableId && editFormik.errors.readableId && typeof editFormik.errors.readableId === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.readableId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormik.values.name}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.name && editFormik.errors.name && typeof editFormik.errors.name === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Polygon Coordinates (WKT)</label>
                  <textarea
                    name="polygonWkt"
                    rows={4}
                    value={editFormik.values.polygonWkt}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: POLYGON((77.5946 12.9716, 77.6208 12.9716, 77.6208 12.9946, 77.5946 12.9946, 77.5946 12.9716))
                  </p>
                  {editFormik.touched.polygonWkt && editFormik.errors.polygonWkt && typeof editFormik.errors.polygonWkt === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.polygonWkt}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={editFormik.values.active}
                    onChange={editFormik.handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Zone</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
    </div>
  );
}

export default ZoneManagement;
