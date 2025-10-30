"use client";
import { useAppSelector } from "@/utils/store/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

function AdminGuardComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, token } = useAppSelector((state) => state.admin);

  useEffect(() => {
    // Check if admin is authenticated
    if (!token || !admin) {
      router.replace("/admin/login");
      return;
    }

    // Check if user has admin role
    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      router.replace("/admin/login");
      return;
    }

    // Redirect to dashboard if accessing login page while authenticated
    if (pathname === "/admin/login" && token && admin) {
      router.replace("/admin/dashboard");
      return;
    }
  }, [token, admin, router, pathname]);

  // Show loading or nothing while checking authentication
  if (!token || !admin) {
    return null;
  }

  // Check role again before rendering
  if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
    return null;
  }

  return <>{children}</>;
}

export default AdminGuardComponent;
