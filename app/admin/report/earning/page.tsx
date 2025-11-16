"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/utils/store/store";
import { setActiveTab } from "@/utils/slices/reportSlice";
import ReportAnalytics from "@/components/Admin/ReportAnalytics";

export default function EarningReportsPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveTab("earning"));
  }, [dispatch]);

  return <ReportAnalytics />;
}

