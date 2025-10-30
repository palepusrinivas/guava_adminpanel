"use client";
import React, { useState } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { creditUserWallet, creditDriverWallet } from "@/utils/reducers/adminReducers";
import { toast } from "react-hot-toast";
import WalletManagement from "@/components/Admin/WalletManagement";

export default function AdminWalletPage() {
  const dispatch = useAppDispatch();

  const handleCreditUserWallet = async (userId: string, amount: number, notes: string) => {
    try {
      const response = await dispatch(creditUserWallet({ userId, amount, notes }));
      if (creditUserWallet.fulfilled.match(response)) {
        toast.success("User wallet credited successfully");
      } else {
        toast.error("Failed to credit user wallet");
      }
    } catch (error) {
      toast.error("An error occurred while crediting user wallet");
    }
  };

  const handleCreditDriverWallet = async (driverId: string, amount: number, notes: string) => {
    try {
      const response = await dispatch(creditDriverWallet({ driverId, amount, notes }));
      if (creditDriverWallet.fulfilled.match(response)) {
        toast.success("Driver wallet credited successfully");
      } else {
        toast.error("Failed to credit driver wallet");
      }
    } catch (error) {
      toast.error("An error occurred while crediting driver wallet");
    }
  };

  return (
    <div>
      <WalletManagement
        onCreditUserWallet={handleCreditUserWallet}
        onCreditDriverWallet={handleCreditDriverWallet}
      />
    </div>
  );
}
