"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getAllTrips } from "@/utils/reducers/adminReducers";
import { setStatusFilter, setSearchTerm, setDateFilter } from "@/utils/slices/tripManagementSlice";
import TripManagement from "@/components/Admin/TripManagement";
import type { TripStatus } from "@/utils/slices/tripManagementSlice";

export default function TripsPage() {
  const dispatch = useAppDispatch();
  const { trips, statistics, isLoading, error, filters } = useAppSelector(
    (state) => state.tripManagement
  );

  useEffect(() => {
    // Fetch trips on mount
    dispatch(getAllTrips({}));
  }, [dispatch]);

  useEffect(() => {
    // Refetch when filters change
    const params: { status?: string; search?: string; dateFilter?: string } = {};
    
    if (filters.status !== "all") {
      params.status = filters.status;
    }
    
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }
    
    if (filters.dateFilter !== "all") {
      params.dateFilter = filters.dateFilter;
    }

    dispatch(getAllTrips(Object.keys(params).length > 0 ? params : {}));
  }, [filters.status, filters.searchTerm, filters.dateFilter, dispatch]);

  const handleStatusChange = (status: TripStatus) => {
    dispatch(setStatusFilter(status));
  };

  const handleSearch = (searchTerm: string) => {
    dispatch(setSearchTerm(searchTerm));
  };

  const handleDateFilterChange = (dateFilter: string) => {
    dispatch(setDateFilter(dateFilter));
  };

  return (
    <TripManagement
      trips={trips}
      statistics={statistics}
      isLoading={isLoading}
      error={error}
      onStatusChange={handleStatusChange}
      onSearch={handleSearch}
      onDateFilterChange={handleDateFilterChange}
      currentStatus={filters.status}
    />
  );
}


