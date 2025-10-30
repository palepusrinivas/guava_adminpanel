"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getAnalyticsStats, getAnalyticsSummary, getRecentActivities, getAnalyticsHeatmap } from "@/utils/reducers/adminReducers";
import { config } from "@/utils/config";
import { toast } from "react-hot-toast";
import AnalyticsDashboard from "@/components/Admin/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00',
    to: new Date().toISOString().split('T')[0] + 'T23:59:59'
  });

  const { stats, summary, recentActivities, heatmap } = useAppSelector((state) => state.adminAnalytics);
  
  const fetchAnalytics = async () => {
    if (!config.ENABLE_ANALYTICS) {
      // Analytics disabled via feature flag - don't call APIs
      toast("Analytics feature is disabled");
      return;
    }
    try {
      await Promise.all([
        dispatch(getAnalyticsStats(dateRange)),
        dispatch(getAnalyticsSummary(dateRange)),
        dispatch(getRecentActivities({ limit: 10 })),
        dispatch(getAnalyticsHeatmap(dateRange)),
      ]);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dispatch, dateRange]);

  return (
    <div>
      <AnalyticsDashboard
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        stats={stats}
        summary={summary}
        recentActivities={recentActivities}
        heatmap={heatmap}
      />
    </div>
  );
}
