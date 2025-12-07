"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { getDrivers, createDriver, updateDriver, deleteDriver } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import DriverManagement from "@/components/Admin/DriverManagement";

interface Driver {
  id: string;
  name: string;
  email: string;
  mobile: string;
  rating: number;
  latitude: number;
  longitude: number;
}

export default function AdminDriversPage() {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [totalElements, setTotalElements] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Backend expects 0-based page numbers
      const response = await dispatch(getDrivers({ page: currentPage, size: pageSize }));
      if (getDrivers.fulfilled.match(response)) {
        const payload = response.payload;
        
        console.log("Driver API Response:", payload); // Debug log
        
        let list = [];
        let total = 0;
        
        // Handle Spring Data Page response
        if (payload && typeof payload === 'object') {
          // Check for Spring Page structure
          if (Array.isArray(payload.content)) {
            list = payload.content;
            total = payload.totalElements || payload.total || 0;
          } else if (Array.isArray(payload)) {
            // Direct array response
            list = payload;
            total = payload.length;
          } else if (payload.data && Array.isArray(payload.data)) {
            list = payload.data;
            total = payload.total || payload.count || payload.data.length;
          } else if (payload.drivers && Array.isArray(payload.drivers)) {
            list = payload.drivers;
            total = payload.total || payload.count || payload.drivers.length;
          }
        }
        
        console.log("Parsed drivers list:", list); // Debug log
        
        // Map driver data - handle different field names
        const cleanedDrivers = list.map((driver: any) => ({
          id: driver.id?.toString() || driver.driverId?.toString() || "",
          name: driver.name || driver.fullName || driver.firstName + " " + (driver.lastName || "") || driver.email || "Unknown",
          email: driver.email || "",
          mobile: driver.mobile || driver.phone || "",
          rating: driver.rating || 0,
          latitude: driver.latitude || 0,
          longitude: driver.longitude || 0
        })).filter((d: any) => d.id); // Filter out drivers without ID
        
        console.log("Cleaned drivers:", cleanedDrivers); // Debug log
        
        setDrivers(cleanedDrivers);
        setTotalElements(total || cleanedDrivers.length);
      } else {
        const errorPayload = (response as any).payload;
        const errorMsg = typeof errorPayload === 'string' 
          ? errorPayload 
          : errorPayload?.message || errorPayload?.error || "Failed to fetch drivers";
        console.error("Failed to fetch drivers:", errorPayload);
        setErrorMsg(errorMsg);
        setDrivers([]);
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
      setErrorMsg(error?.message || "Failed to fetch drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [dispatch, currentPage, pageSize]);

  const handleCreateDriver = async (driverData: any) => {
    try {
      const response = await dispatch(createDriver(driverData));
      if (createDriver.fulfilled.match(response)) {
        toast.success("Driver created successfully");
        await fetchDrivers();
      } else {
        toast.error("Failed to create driver");
      }
    } catch (error) {
      toast.error("An error occurred while creating driver");
    }
  };

  const handleUpdateDriver = async (driverId: string, driverData: any) => {
    try {
      const response = await dispatch(updateDriver({ driverId, driverData }));
      if (updateDriver.fulfilled.match(response)) {
        toast.success("Driver updated successfully");
        await fetchDrivers();
      } else {
        toast.error("Failed to update driver");
      }
    } catch (error) {
      toast.error("An error occurred while updating driver");
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        const response = await dispatch(deleteDriver(driverId));
        if (deleteDriver.fulfilled.match(response)) {
          toast.success("Driver deleted successfully");
          await fetchDrivers();
        } else {
          toast.error("Failed to delete driver");
        }
      } catch (error) {
        toast.error("An error occurred while deleting driver");
      }
    }
  };

  return (
    <div>
      <DriverManagement
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onCreateDriver={handleCreateDriver}
        onUpdateDriver={handleUpdateDriver}
        onDeleteDriver={handleDeleteDriver}
        onRefresh={fetchDrivers}
        currentPage={currentPage}
        pageSize={pageSize}
        drivers={drivers}
        totalElements={totalElements}
        loading={loading}
        error={errorMsg}
      />
    </div>
  );
}
