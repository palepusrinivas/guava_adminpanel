"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getAllTrips } from "@/utils/reducers/adminReducers";
import { setStatusFilter, setSearchTerm, setDateFilter, setPage, setPageSize } from "@/utils/slices/tripManagementSlice";
import TripManagement from "@/components/Admin/TripManagement";
import type { TripStatus } from "@/utils/slices/tripManagementSlice";

export default function TripsPage() {
  const dispatch = useAppDispatch();
  const { trips, statistics, isLoading, error, filters } = useAppSelector(
    (state) => state.tripManagement
  );
  const { pagination } = useAppSelector((state) => state.tripManagement);

  useEffect(() => {
    // Fetch trips when filters/pagination change (single source of truth; avoids double-fetch on mount).
    const params: { status?: string; search?: string; dateFilter?: string; page?: number; size?: number } = {
      page: pagination.page,
      size: pagination.size,
    };
    
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
  }, [filters.status, filters.searchTerm, filters.dateFilter, pagination.page, pagination.size, dispatch]);

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
      currentPage={pagination.page}
      pageSize={pagination.size}
      totalElements={pagination.totalElements}
      totalPages={pagination.totalPages}
      onPageChange={(page) => dispatch(setPage(page))}
      onPageSizeChange={(size) => dispatch(setPageSize(size))}
    />
  );
}


