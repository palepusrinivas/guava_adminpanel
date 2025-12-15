"use client";
import React from "react";
import PricingManagement from "@/components/Admin/PricingManagement";
import TripFares from "@/components/Admin/TripFares";

export default function AdminPricingPage() {
  return (
    <div className="p-6">
      <PricingManagement />
      <div className="mt-8">
        <TripFares />
      </div>
    </div>
  );
}
