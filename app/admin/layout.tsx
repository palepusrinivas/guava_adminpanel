"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";
import AdminGuardComponent from "@/components/Admin/AdminGuardComponent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't wrap login page with dashboard layout
  if (pathname === "/admin/login" || pathname === "/admin/debug" || pathname === "/admin/test-simple" || pathname === "/admin/simple-login") {
    return <>{children}</>;
  }
  
  // Wrap other admin pages with dashboard layout and guard
  return (
    <AdminGuardComponent>
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </AdminGuardComponent>
  );
}
