"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getEarningReports,
  getExpenseReports,
  getZoneWiseStatistics,
  getTripWiseEarning,
} from "@/utils/reducers/adminReducers";
import { setActiveTab, setTimeRange } from "@/utils/slices/reportSlice";
import { useRouter } from "next/navigation";

export default function ReportAnalytics() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { activeTab, timeRange, earningStatistics, expenseStatistics, zoneWiseStatistics, isLoading, error } =
    useAppSelector((s) => s.report);

  useEffect(() => {
    if (activeTab === "earning") {
      dispatch(getEarningReports({ timeRange })).catch(() => {});
      dispatch(getZoneWiseStatistics({ timeRange })).catch(() => {});
      dispatch(getTripWiseEarning({ timeRange })).catch(() => {});
    } else if (activeTab === "expense") {
      dispatch(getExpenseReports({ timeRange })).catch(() => {});
      dispatch(getZoneWiseStatistics({ timeRange })).catch(() => {});
    }
  }, [dispatch, activeTab, timeRange]);

  // Sample data matching the image
  const sampleEarningStats = {
    totalEarnings: 1000,
    rideRequestEarnings: 1057,
    parcelEarnings: 0,
  };

  const sampleExpenseStats = {
    totalExpenses: 7,
    rideRequestExpenses: 7,
    parcelExpenses: 0,
  };

  const sampleZoneStats = [
    { zoneName: "Amalapuram", earnings: 1057, expenses: 0 },
    { zoneName: "rajamundry", earnings: 0, expenses: 0 },
    { zoneName: "kakinada", earnings: 0, expenses: 0 },
  ];

  const earningStats = earningStatistics || sampleEarningStats;
  const expenseStats = expenseStatistics || sampleExpenseStats;
  const zoneStats = zoneWiseStatistics.length > 0 ? zoneWiseStatistics : sampleZoneStats;

  const maxEarnings = activeTab === "earning" 
    ? Math.max(...zoneStats.map((z) => z.earnings || 0), 1000)
    : 900;
  const chartHeight = 220;
  const chartWidth = 400;
  const padding = 40;
  const chartAreaWidth = chartWidth - padding * 2;
  const chartAreaHeight = chartHeight - padding * 2;

  // Calculate donut chart values for earning
  const earningTotal = earningStats.rideRequestEarnings + earningStats.parcelEarnings;
  const earningRidePercentage = earningTotal > 0 ? (earningStats.rideRequestEarnings / earningTotal) * 100 : 0;
  const earningParcelPercentage = earningTotal > 0 ? (earningStats.parcelEarnings / earningTotal) * 100 : 0;

  // Calculate donut chart values for expense
  const expenseTotal = expenseStats.rideRequestExpenses + expenseStats.parcelExpenses;
  const expenseRidePercentage = expenseTotal > 0 ? (expenseStats.rideRequestExpenses / expenseTotal) * 100 : 0;
  const expenseParcelPercentage = expenseTotal > 0 ? (expenseStats.parcelExpenses / expenseTotal) * 100 : 0;

  // Calculate line graph points
  const zones = zoneStats.map((z) => z.zoneName);
  const values = activeTab === "earning" 
    ? zoneStats.map((z) => z.earnings || 0)
    : zoneStats.map((z) => (z as any).expenses || 0);
  const xStep = chartAreaWidth / Math.max(zones.length - 1, 1);
  const scaleY = chartAreaHeight / maxEarnings;
  const maxValue = activeTab === "earning" ? 1100 : 900;

  const points = values.map((value, index) => ({
    x: padding + index * xStep,
    y: padding + chartAreaHeight - value * scaleY,
    value,
  }));

  const handleTabChange = (tab: "earning" | "expense") => {
    dispatch(setActiveTab(tab));
    if (tab === "expense") {
      router.push("/admin/report/expense");
    } else {
      router.push("/admin/report/earning");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Report Analytics</h2>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex items-center border-b border-gray-200">
          <button
            onClick={() => handleTabChange("earning")}
            className={`px-6 py-3 font-medium ${
              activeTab === "earning"
                ? "bg-teal-600 text-white border-b-2 border-teal-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Earning
          </button>
          <button
            onClick={() => handleTabChange("expense")}
            className={`px-6 py-3 font-medium ${
              activeTab === "expense"
                ? "bg-teal-600 text-white border-b-2 border-teal-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Expense
          </button>
        </div>

        {(activeTab === "earning" || activeTab === "expense") && (
          <div className="p-6 space-y-6">
            {/* Error state */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
                Unable to load reports from server. Displaying sample data. Ensure backend endpoints are implemented.
                Error: {error}
              </div>
            )}

            {/* Statistics Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {activeTab === "earning" ? "Earning Statistics" : "Expense Statistics"}
                </h3>
                <select
                  value={timeRange}
                  onChange={(e) => dispatch(setTimeRange(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="flex items-center justify-center space-x-8">
                {/* Donut Chart */}
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="30"
                    />
                    {/* Ride Request segment */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={activeTab === "earning" ? "#3B82F6" : "#3B82F6"}
                      strokeWidth="30"
                      strokeDasharray={`${2 * Math.PI * 80 * ((activeTab === "earning" ? earningRidePercentage : expenseRidePercentage) / 100)} ${2 * Math.PI * 80}`}
                      strokeDashoffset={0}
                      transform="rotate(-90 100 100)"
                    />
                    {/* Parcel segment */}
                    {(activeTab === "earning" ? earningParcelPercentage : expenseParcelPercentage) > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={activeTab === "earning" ? "#10B981" : "#F97316"}
                        strokeWidth="30"
                        strokeDasharray={`${2 * Math.PI * 80 * ((activeTab === "earning" ? earningParcelPercentage : expenseParcelPercentage) / 100)} ${2 * Math.PI * 80}`}
                        strokeDashoffset={-2 * Math.PI * 80 * ((activeTab === "earning" ? earningRidePercentage : expenseRidePercentage) / 100)}
                        transform="rotate(-90 100 100)"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{activeTab === "earning" 
                          ? (earningStats.totalEarnings >= 1000 ? `${earningStats.totalEarnings / 1000}K` : earningStats.totalEarnings)
                          : expenseStats.totalExpenses}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeTab === "earning" ? "Earnings" : "Expenses"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Boxes */}
                <div className="space-y-4">
                  <div className={`${activeTab === "earning" ? "bg-blue-50 border-blue-200" : "bg-blue-50 border-blue-200"} border rounded-lg p-4 flex items-center space-x-3`}>
                    <div className={`w-10 h-10 ${activeTab === "earning" ? "bg-blue-100" : "bg-blue-100"} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${activeTab === "earning" ? "text-blue-600" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ride Request</div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{activeTab === "earning" ? earningStats.rideRequestEarnings : expenseStats.rideRequestExpenses}
                      </div>
                    </div>
                  </div>
                  <div className={`${activeTab === "earning" ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"} border rounded-lg p-4 flex items-center space-x-3`}>
                    <div className={`w-10 h-10 ${activeTab === "earning" ? "bg-green-100" : "bg-orange-100"} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${activeTab === "earning" ? "text-green-600" : "text-orange-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Parcel</div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{activeTab === "earning" ? earningStats.parcelEarnings : expenseStats.parcelExpenses}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Wise Statistics Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Zone Wise Statistics</h3>
                <select
                  value={timeRange}
                  onChange={(e) => dispatch(setTimeRange(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Line Graph */}
              <div className="relative">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                  {/* Y-axis labels */}
                  {activeTab === "earning" 
                    ? [0, 200, 400, 600, 800, 1000].map((value) => (
                        <g key={value}>
                          <line
                            x1={padding}
                            y1={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight}
                            x2={chartWidth - padding}
                            y2={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={padding - 10}
                            y={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight + 4}
                            textAnchor="end"
                            className="text-xs fill-gray-500"
                          >
                            {value}
                          </text>
                        </g>
                      ))
                    : [0, 90, 180, 270, 360, 450, 540, 630, 720, 810, 900].map((value) => (
                        <g key={value}>
                          <line
                            x1={padding}
                            y1={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight}
                            x2={chartWidth - padding}
                            y2={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={padding - 10}
                            y={padding + chartAreaHeight - (value / maxEarnings) * chartAreaHeight + 4}
                            textAnchor="end"
                            className="text-xs fill-gray-500"
                          >
                            {value}
                          </text>
                        </g>
                      ))}
                  {/* X-axis labels */}
                  {zones.map((zone, index) => (
                    <text
                      key={zone}
                      x={padding + index * xStep}
                      y={chartHeight - padding + 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {zone}
                    </text>
                  ))}
                  {/* Grid line at max value (only for earning) */}
                  {activeTab === "earning" && (
                    <>
                      <line
                        x1={padding}
                        y1={padding + chartAreaHeight - (1100 / maxEarnings) * chartAreaHeight}
                        x2={chartWidth - padding}
                        y2={padding + chartAreaHeight - (1100 / maxEarnings) * chartAreaHeight}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding - 10}
                        y={padding + chartAreaHeight - (1100 / maxEarnings) * chartAreaHeight + 4}
                        textAnchor="end"
                        className="text-xs fill-gray-500"
                      >
                        1100
                      </text>
                    </>
                  )}
                  {/* Line path */}
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={activeTab === "earning" ? "#3B82F6" : "#10B981"}
                    strokeWidth="3"
                  />
                  {/* Data points */}
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={activeTab === "earning" ? "#3B82F6" : "#10B981"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Trip Wise Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {activeTab === "earning" ? "Trip Wise Earning" : "Trip Wise Expense"}
              </h3>
              <div className="text-center py-8 text-gray-500">
                <p>{activeTab === "earning" ? "Trip wise earning data will be displayed here." : "Trip wise expense data will be displayed here."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

