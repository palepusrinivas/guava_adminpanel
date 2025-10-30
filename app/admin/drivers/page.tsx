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
      const response = await dispatch(getDrivers({ page: currentPage + 1, size: pageSize }));
      if (getDrivers.fulfilled.match(response)) {
        const payload = response.payload;
        
        let list = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (Array.isArray(payload?.content)) {
          list = payload.content;
        } else if (typeof payload === 'object' && payload !== null) {
          list = payload?.data || payload?.drivers || [];
        }
        
        const cleanedDrivers = list.map((driver: any) => ({
          id: driver.id,
          name: driver.name,
          email: driver.email,
          mobile: driver.mobile,
          rating: driver.rating,
          latitude: driver.latitude,
          longitude: driver.longitude
        }));
        
        setDrivers(cleanedDrivers);
        setTotalElements(payload?.totalElements || payload?.total || payload?.count || list.length);
      } else {
        setErrorMsg((response as any).payload || "Failed to fetch drivers");
        setDrivers([]);
      }
    } catch (error: any) {
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
