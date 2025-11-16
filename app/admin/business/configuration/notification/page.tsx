"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/admin/business/configuration/notification/regular-trip");
  }, [router]);

  return null;
}

