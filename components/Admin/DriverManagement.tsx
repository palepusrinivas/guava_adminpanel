"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppSelector } from "@/utils/store/store";

interface Driver {
  id: string;
  name: string;
  email: string;
  mobile: string;
  rating: number;
  latitude: number;
  longitude: number;
  vehicle?: {
    serviceType?: string;
    vehicleType?: string;
  };
}

interface DriverManagementProps {
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreateDriver: (driverData: any) => void;
  onUpdateDriver: (driverId: string, driverData: any) => void;
  onDeleteDriver: (driverId: string) => void;
  onRefresh: () => void;
  currentPage: number;
  pageSize: number;
  drivers: Driver[];
  totalElements: number | null;
  loading: boolean;
  error: string | null;
}

const driverValidationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  mobile: yup.string().required("Mobile number is required"),
  latitude: yup.number().required("Latitude is required"),
  longitude: yup.number().required("Longitude is required"),
  rating: yup.number().min(0).max(5).required("Rating is required"),
  vehicleType: yup.string(),
});

function DriverManagement({
  onPageChange,
  onPageSizeChange,
  onCreateDriver,
  onUpdateDriver,
  onDeleteDriver,
  onRefresh,
  currentPage,
  pageSize,
  drivers,
  totalElements,
  loading,
  error,
}: DriverManagementProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const handleViewDriver = (driverId: string) => {
    router.push(`/admin/drivers/${driverId}`);
  };

  const createFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      latitude: 0,
      longitude: 0,
      rating: 0,
    },
    validationSchema: driverValidationSchema,
    onSubmit: (values) => {
      onCreateDriver(values);
      setShowCreateModal(false);
      createFormik.resetForm();
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: selectedDriver?.name || "",
      email: selectedDriver?.email || "",
      mobile: selectedDriver?.mobile || "",
      latitude: selectedDriver?.latitude || 0,
      longitude: selectedDriver?.longitude || 0,
      rating: selectedDriver?.rating || 0,
      vehicleType: selectedDriver?.vehicle?.serviceType || selectedDriver?.vehicle?.vehicleType || "",
    },
    validationSchema: driverValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Format the update payload to include vehicle information
      const updatePayload = {
        ...values,
        vehicle: values.vehicleType ? {
          serviceType: values.vehicleType,
        } : undefined,
      };
      onUpdateDriver(selectedDriver.id, updatePayload);
      setShowEditModal(false);
      setSelectedDriver(null);
    },
  });

  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver);
    setShowEditModal(true);
  };

  const handleDeleteDriver = (driverId: string) => {
    onDeleteDriver(driverId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage driver accounts and information</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Driver
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Drivers Table */
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
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
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {error ? "Error loading drivers. Please try again." : "Get started by creating a new driver."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {driver.name ? driver.name.split(" ").map(n => n?.[0] || "").join("") : "?"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.email || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.mobile || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-sm text-gray-900">{driver.rating ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.latitude != null && driver.longitude != null 
                          ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDriver(driver.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditDriver(driver)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalElements !== null && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{Math.min(pageSize * currentPage + 1, totalElements)}</span>
                    {' '}-{' '}
                    <span className="font-medium">{Math.min(pageSize * (currentPage + 1), totalElements)}</span>
                    {' '}of{' '}
                    <span className="font-medium">{totalElements}</span>
                    {' '}results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 ${
                      currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={pageSize * (currentPage + 1) >= totalElements}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 ${
                      pageSize * (currentPage + 1) >= totalElements ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Driver</h3>
              <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={createFormik.values.name}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.name && typeof createFormik.errors.name === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={createFormik.values.email}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.email && typeof createFormik.errors.email === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={createFormik.values.mobile}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.mobile && typeof createFormik.errors.mobile === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.mobile}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={createFormik.values.latitude}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {createFormik.touched.latitude && typeof createFormik.errors.latitude === 'string' && (
                      <p className="mt-1 text-sm text-red-600">{createFormik.errors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={createFormik.values.longitude}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {createFormik.touched.longitude && typeof createFormik.errors.longitude === 'string' && (
                      <p className="mt-1 text-sm text-red-600">{createFormik.errors.longitude}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={createFormik.values.rating}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.rating && typeof createFormik.errors.rating === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{createFormik.errors.rating}</p>
                  )}
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
                    Create Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Driver</h3>
              <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormik.values.name}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.name && typeof editFormik.errors.name === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormik.values.email}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.email && typeof editFormik.errors.email === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={editFormik.values.mobile}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.mobile && typeof editFormik.errors.mobile === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.mobile}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={editFormik.values.latitude}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {editFormik.touched.latitude && typeof editFormik.errors.latitude === 'string' && (
                      <p className="mt-1 text-sm text-red-600">{editFormik.errors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={editFormik.values.longitude}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {editFormik.touched.longitude && typeof editFormik.errors.longitude === 'string' && (
                      <p className="mt-1 text-sm text-red-600">{editFormik.errors.longitude}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={editFormik.values.rating}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.rating && typeof editFormik.errors.rating === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.rating}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={editFormik.values.vehicleType}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="BIKE">BIKE</option>
                    <option value="MEGA">MEGA (Auto Rickshaw)</option>
                    <option value="AUTO">AUTO</option>
                    <option value="SMALL_SEDAN">SMALL_SEDAN</option>
                    <option value="CAR">CAR</option>
                  </select>
                  {editFormik.touched.vehicleType && typeof editFormik.errors.vehicleType === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.vehicleType}</p>
                  )}
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
                    Update Driver
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

export default DriverManagement;
