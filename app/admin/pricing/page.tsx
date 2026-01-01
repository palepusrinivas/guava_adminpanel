"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import SimplifiedPricingManagement from "@/components/Admin/SimplifiedPricingManagement";
import TripFares from "@/components/Admin/TripFares";
import PricingStatus from "@/components/Admin/PricingStatus";
import { Tabs, Tab, Box, Alert } from "@mui/material";

// Dynamically import TieredPricingManagement to avoid SSR issues
const TieredPricingManagement = dynamic(
  () => import("@/components/Admin/TieredPricingManagement"),
  { 
    ssr: false,
    loading: () => <Box sx={{ p: 3 }}>Loading pricing management...</Box>
  }
);

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Management</h1>
        <p className="text-gray-600">Configure base fares, additional fees, and zone-specific overrides</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="🎯 Tiered Pricing (Primary)" />
          <Tab label="💰 Base Fares & Fees" />
          <Tab label="🚗 Zone Overrides (Advanced)" />
          <Tab label="📊 Pricing Status" />
        </Tabs>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Pricing Structure:</strong> Tiered Pricing Management is now the primary pricing source. Configure distance-based pricing tiers for each service type. Zone overrides can replace tiered pricing for specific zones. Additional fees (platform fee, GST, night surcharge) are added on top.
      </Alert>

      {activeTab === 0 && (
        <div>
          <TieredPricingManagement />
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <SimplifiedPricingManagement />
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <TripFares />
        </div>
      )}

      {activeTab === 3 && (
        <div>
          <PricingStatus />
        </div>
      )}
    </div>
  );
}
