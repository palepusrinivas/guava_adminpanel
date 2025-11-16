"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPageSetup from "@/components/Admin/LandingPageSetup";

export default function LandingPageSetupPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/admin/business/pages-media/landing-page/intro-section");
  }, [router]);

  return <LandingPageSetup />;
}

