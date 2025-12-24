"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import SimplifiedPricingManagement from "@/components/Admin/SimplifiedPricingManagement";
import TripFares from "@/components/Admin/TripFares";
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
          <Tab label="💰 Base Fares & Fees" />
          <Tab label="🚗 Zone Overrides (Advanced)" />
        </Tabs>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Pricing Structure:</strong> Base fare rates are calculated using distance tiers. Additional fees (platform fee, GST, night surcharge) are added on top. Zone overrides can replace default rates for specific zones.
      </Alert>

      {activeTab === 0 && (
        <div>
          <SimplifiedPricingManagement />
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <TripFares />
        </div>
      )}
    </div>
  );
}
