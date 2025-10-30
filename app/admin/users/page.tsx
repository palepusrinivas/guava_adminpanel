"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getUsers, createUser, updateUser, deleteUser } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import UserManagement from "@/components/Admin/UserManagement";

interface ErrorResponse {
  status?: number;
  error?: string;
  message: string;
  path?: string;
  timestamp?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error) {
      return (error as ErrorResponse).message;
    }
    if ('error' in error && typeof (error as ErrorResponse).error === 'string') {
      return (error as ErrorResponse).error as string;
    }
  }
  return "An unexpected error occurred";
};

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [users, setUsers] = useState<any[]>([]);
  const [columns, setColumns] = useState<Array<{key: string; title: string; render?: (value: any, row: any) => React.ReactNode}>>([]);
  const [totalElements, setTotalElements] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
  // UI is 0-based, backend expects 1-based page index — send page = currentPage + 1
  console.log("Fetching users (UI page):", currentPage, "pageSize:", pageSize);
  const res = await dispatch(getUsers({ page: currentPage + 1, size: pageSize }));
      console.log("Users API Response full:", res);
      if (getUsers.fulfilled.match(res)) {
        const payload = res.payload;
        console.log("Response payload type:", typeof payload);
        console.log("Response payload:", payload);
        console.log("Payload content:", payload?.content);
        
        // Extract users from content array
        let list = [];
        if (Array.isArray(payload)) {
          console.log("Payload is an array");
          list = payload;
        } else if (Array.isArray(payload?.content)) {
          console.log("Found users in payload.content");
          list = payload.content;
        } else if (typeof payload === 'object' && payload !== null) {
          console.log("Payload is an object, keys:", Object.keys(payload));
          list = payload?.data || payload?.users || [];
        }
        
        console.log("Extracted user list:", list);
        
        // Clean up user objects to include only necessary fields
        const cleanedUsers = list.map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }));
        
        console.log("Cleaned users:", cleanedUsers);
        setUsers(cleanedUsers);
        
        // Extract columns from first item if available
        if (list.length > 0) {
          const firstItem = list[0];
          console.log("First item for columns:", firstItem); // Debug log
          // Define default columns with proper rendering
          const defaultColumns = [
            {
              key: 'fullName',
              title: 'User',
              render: (value: any, row: any) => (
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {String(value || "").split(" ").map((n:string) => n[0] || "").join("")}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{value}</div>
                  </div>
                </div>
              )
            },
            {
              key: 'email',
              title: 'Email',
              render: (value: string) => value || '-'
            },
            {
              key: 'phone',
              title: 'Phone',
              render: (value: string) => value || '-'
            },
            {
              key: 'role',
              title: 'Role',
              render: (value: string) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  (value === "ADMIN" || value === "SUPER_ADMIN")
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {value}
                </span>
              )
            },
            {
              key: 'isActive',
              title: 'Status',
              render: (value: boolean) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {value ? 'Active' : 'Inactive'}
                </span>
              )
            },
            {
              key: 'createdAt',
              title: 'Created',
              render: (value: string) => new Date(value).toLocaleDateString()
            }
          ];
          
          // Update state with default columns
          setColumns(defaultColumns);
          console.log("Final state - users:", list, "columns:", defaultColumns); // Debug log
        }
        // pagination total
        const total = payload?.totalElements || payload?.total || payload?.count || null;
        setTotalElements(typeof total === "number" ? total : null);
      } else {
        setErrorMsg(getErrorMessage(res.payload));
        setUsers([]);
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch, currentPage, pageSize]);



const handleCreateUser = async (userData: any) => {
    try {
      const response = await dispatch(createUser(userData));
      if (createUser.fulfilled.match(response)) {
        toast.success("User created successfully");
        await fetchUsers();
      } else {
        toast.error(getErrorMessage(response.payload));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      const response = await dispatch(updateUser({ userId, userData }));
      if (updateUser.fulfilled.match(response)) {
        toast.success("User updated successfully");
        await fetchUsers();
      } else {
        toast.error(getErrorMessage(response.payload));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await dispatch(deleteUser(userId));
        if (deleteUser.fulfilled.match(response)) {
          toast.success("User deleted successfully");
          await fetchUsers();
        } else {
          toast.error(getErrorMessage(response.payload));
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <div>
      <UserManagement
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRefresh={fetchUsers}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        currentPage={currentPage}
        pageSize={pageSize}
        users={users}
        columns={columns}
        totalElements={totalElements}
        loading={loading}
        error={errorMsg}
      />
    </div>
  );
}
