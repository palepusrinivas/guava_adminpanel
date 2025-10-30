"use client";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { getPricing, updatePricing } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import PricingManagement from "@/components/Admin/PricingManagement";
import TripFares from "@/components/Admin/TripFares";

export default function AdminPricingPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPricing());
  }, [dispatch]);

  const handleUpdatePricing = async (pricingData: any) => {
    try {
      const response = await dispatch(updatePricing(pricingData));
      if (updatePricing.fulfilled.match(response)) {
        toast.success("Pricing updated successfully");
      } else {
        toast.error("Failed to update pricing");
      }
    } catch (error) {
      toast.error("An error occurred while updating pricing");
    }
  };

  return (
    <div>
      <PricingManagement onUpdatePricing={handleUpdatePricing} />
      <div className="mt-8">
        <TripFares />
      </div>
    </div>
  );
}
