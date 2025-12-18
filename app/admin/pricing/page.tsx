"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import PricingManagement from "@/components/Admin/PricingManagement";
import TripFares from "@/components/Admin/TripFares";
import { Tabs, Tab, Box } from "@mui/material";

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
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="💰 Tiered Pricing Rates" />
          <Tab label="⚙️ Pricing Configuration" />
          <Tab label="🚗 Trip Fares" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <div>
          <TieredPricingManagement />
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <PricingManagement />
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <TripFares />
        </div>
      )}
    </div>
  );
}
