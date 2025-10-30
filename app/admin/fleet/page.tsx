"use client";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { getFleetLocations } from "@/utils/reducers/adminReducers";
import FleetManagement from "@/components/Admin/FleetManagement";

export default function AdminFleetPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getFleetLocations());
  }, [dispatch]);

  return (
    <div>
      <FleetManagement />
    </div>
  );
}
