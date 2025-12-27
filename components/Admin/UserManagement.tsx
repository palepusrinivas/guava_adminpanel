"use client";
import React, { useState } from "react";
import { useAppSelector } from "@/utils/store/store";
import { useFormik } from "formik";
import * as yup from "yup";

interface Column {
  key: string;
  title: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface UserManagementProps {
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh?: () => void;
  onCreateUser: (userData: any) => void;
  onUpdateUser: (userId: string, userData: any) => void;
  onDeleteUser: (userId: string) => void;
  currentPage: number;
  pageSize: number;
  users?: any[];
  columns: Column[];
  totalElements?: number | null;
  loading?: boolean;
  error?: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const userValidationSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
  role: yup.string().oneOf(["NORMAL_USER", "ADMIN", "SUPER_ADMIN"], "Invalid role"),
});

function UserManagement({
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  currentPage,
  pageSize,
  users = [],
  columns,
  totalElements = null,
  loading = false,
  error = null,
  searchQuery = "",
  onSearchChange,
}: UserManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const createFormik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "NORMAL_USER",
    },
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      onCreateUser(values);
      setShowCreateModal(false);
      createFormik.resetForm();
    },
  });

  const editFormik = useFormik({
    initialValues: {
      fullName: selectedUser?.fullName || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      password: "",
      role: selectedUser?.role || "NORMAL_USER",
    },
    validationSchema: userValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onUpdateUser(selectedUser.id, values);
      setShowEditModal(false);
      setSelectedUser(null);
    },
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    onDeleteUser(userId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-md p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value);
              }
            }}
            placeholder="Search by email, phone number, or name..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <svg
            className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading && (
            <div className="mb-4 text-sm text-gray-600">Loading users...</div>
          )}
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id || user._id}>
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render ? column.render(user[column.key], user) : user[column.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id || user._id)}
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
          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded border bg-white text-sm"
              >
                Prev
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={totalElements !== null && (currentPage + 1) * pageSize >= (totalElements || 0)}
                className="px-3 py-1 rounded border bg-white text-sm"
              >
                Next
              </button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Page size:</label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => (typeof onRefresh === 'function' ? onRefresh() : window.location.reload())}
                className="px-3 py-1 rounded border bg-white text-sm"
                title="Refresh users"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={createFormik.values.fullName}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.fullName && createFormik.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{String(createFormik.errors.fullName)}</p>
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
                  {createFormik.touched.email && createFormik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{String(createFormik.errors.email)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={createFormik.values.phone}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.phone && createFormik.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{String(createFormik.errors.phone)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={createFormik.values.password}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createFormik.touched.password && createFormik.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{String(createFormik.errors.password)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={createFormik.values.role}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
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
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormik.values.fullName}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.fullName && editFormik.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{String(editFormik.errors.fullName)}</p>
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
                  {editFormik.touched.email && editFormik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{String(editFormik.errors.email)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormik.values.phone}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.phone && editFormik.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{String(editFormik.errors.phone)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    value={editFormik.values.password}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editFormik.touched.password && editFormik.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{editFormik.errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={editFormik.values.role}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
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
                    Update User
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

export default UserManagement;
