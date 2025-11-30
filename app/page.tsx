"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/utils/store/store";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function Home() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.role);
  const adminToken = useAppSelector((state) => state.admin.token);
  const adminRole = useAppSelector((state) => state.admin.admin?.role);
  
  useEffect(() => {
    // Check for admin authentication first
    if (adminToken && adminRole && (adminRole === "ADMIN" || adminRole === "SUPER_ADMIN")) {
      router.replace("/admin/dashboard");
      return;
    }
    
    // Check for regular user authentication
    if (token && token !== "" && role !== null) {
      if (role === "NORMAL_USER") {
        router.replace("/profile");
        return;
      } else if (role === "DRIVER") {
        router.replace("/driver/dashboard");
        return;
      }
    }
    // If not authenticated, show landing page (no redirect)
  }, [token, role, adminToken, adminRole, router]);
  
  // Show landing page for unauthenticated users
  if (!token && !adminToken) {
    return <LandingPage />;
  }
  
  // Show loading state while checking auth
  return null;
}
