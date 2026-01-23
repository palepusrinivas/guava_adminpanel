"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { config } from "@/utils/config";
import adminAxios from "@/utils/axiosConfig";
import { formatDateTimeIST } from "@/utils/dateUtils";
import { exportToExcel } from "@/utils/excelExport";

interface Driver {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

interface SubscriptionHistoryItem {
  subscriptionId: number;
  driver: Driver;
  planId: number;
  planDisplayName: string;
  subscriptionType: string;
  vehicleType: string;
  amount: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  paymentId: string;
}

interface SubscriptionHistoryResponse {
  content: SubscriptionHistoryItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

type DateFilterType = "all" | "today" | "week" | "custom";

export default function SubscriptionHistoryPage() {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [allHistory, setAllHistory] = useState<SubscriptionHistoryItem[]>([]); // Store all data for export
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [page, dateFilter]);

  const getDateRange = (filterType: DateFilterType): { startDate: string | null; endDate: string | null } => {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (filterType) {
      case "today": {
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        return {
          startDate: startDate.toISOString().slice(0, 19),
          endDate: endDate.toISOString().slice(0, 19),
        };
      }
      case "week": {
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        return {
          startDate: startDate.toISOString().slice(0, 19),
          endDate: endDate.toISOString().slice(0, 19),
        };
      }
      default:
        return { startDate: null, endDate: null };
    }
  };

  const fetchHistory = async (fetchAll: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      
      const { startDate, endDate } = getDateRange(dateFilter);
      const size = fetchAll ? 10000 : 20; // Fetch all for export
      
      let url = `${config.ENDPOINTS.ADMIN.SUBSCRIPTION_HISTORY}?page=${page}&size=${size}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await adminAxios.get<SubscriptionHistoryResponse>(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const content = response.data.content || [];
      
      if (fetchAll) {
        setAllHistory(content);
      } else {
        setHistory(content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error: any) {
      console.error("Error fetching subscription history:", error);
      setError(error.response?.data?.error || "Failed to fetch subscription history");
      toast.error("Failed to fetch subscription history");
    } finally {
      setLoading(false);
    }
  };

  // Detect duplicate transactions
  const detectDuplicates = (data: SubscriptionHistoryItem[]): SubscriptionHistoryItem[] => {
    const seen = new Set<string>();
    const duplicates: SubscriptionHistoryItem[] = [];
    
    data.forEach((item) => {
      // Create a unique key based on paymentId, driverId, amount, and startTime
      const key = `${item.paymentId || 'no-payment'}-${item.driver?.id || 'no-driver'}-${item.amount}-${item.startTime}`;
      
      if (seen.has(key)) {
        duplicates.push(item);
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  };

  const duplicates = useMemo(() => detectDuplicates(history), [history]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination is 1-based, API is 0-based
  };

  const handleDateFilterChange = (newFilter: DateFilterType) => {
    setDateFilter(newFilter);
    setPage(0); // Reset to first page when filter changes
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      toast.loading("Preparing Excel export...", { id: "export" });
      
      // Fetch all data for export (bypass pagination)
      const token = localStorage.getItem("adminToken");
      const { startDate, endDate } = getDateRange(dateFilter);
      
      let url = `${config.ENDPOINTS.ADMIN.SUBSCRIPTION_HISTORY}?page=0&size=10000`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await adminAxios.get<SubscriptionHistoryResponse>(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const dataToExport = response.data.content || history;
      
      if (dataToExport.length === 0) {
        toast.error("No data to export", { id: "export" });
        return;
      }

      // Prepare Excel columns
      const columns = [
        { header: "Subscription ID", key: "subscriptionId", width: 15 },
        { header: "Driver ID", key: "driverId", width: 12 },
        { header: "Driver Name", key: "driverName", width: 20 },
        { header: "Driver Email", key: "driverEmail", width: 25 },
        { header: "Driver Mobile", key: "driverMobile", width: 15 },
        { header: "Plan ID", key: "planId", width: 12 },
        { header: "Plan Name", key: "planDisplayName", width: 20 },
        { header: "Subscription Type", key: "subscriptionType", width: 18 },
        { header: "Vehicle Type", key: "vehicleType", width: 15 },
        { header: "Amount (₹)", key: "amount", width: 15 },
        { header: "Start Date", key: "startTime", width: 20 },
        { header: "End Date", key: "endTime", width: 20 },
        { header: "Status", key: "status", width: 12 },
        { header: "Payment ID", key: "paymentId", width: 20 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      // Transform data for Excel
      const excelData = dataToExport.map((item) => ({
        subscriptionId: item.subscriptionId,
        driverId: item.driver?.id || "N/A",
        driverName: item.driver?.name || "N/A",
        driverEmail: item.driver?.email || "N/A",
        driverMobile: item.driver?.mobile || "N/A",
        planId: item.planId,
        planDisplayName: item.planDisplayName || "N/A",
        subscriptionType: item.subscriptionType || "N/A",
        vehicleType: item.vehicleType || "N/A",
        amount: item.amount?.toFixed(2) || "0.00",
        startTime: item.startTime
          ? formatDateTimeIST(item.startTime, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        endTime: item.endTime
          ? formatDateTimeIST(item.endTime, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        status: item.status || "N/A",
        paymentId: item.paymentId || "N/A",
        createdAt: item.createdAt
          ? formatDateTimeIST(item.createdAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      }));

      // Generate filename with date filter
      const filterSuffix = dateFilter !== "all" ? `_${dateFilter}` : "";
      const filename = `subscription_history${filterSuffix}_${new Date().toISOString().split("T")[0]}`;

      await exportToExcel(excelData, columns, filename);
      
      toast.success(`Exported ${excelData.length} records to Excel`, { id: "export" });
    } catch (error: any) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel", { id: "export" });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "success";
      case "EXPIRED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "UNLIMITED":
        return "primary";
      case "INTERCITY_EARNING":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading && history.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <HistoryIcon sx={{ fontSize: 32, color: "teal.600" }} />
          <Typography variant="h4">Subscription History</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Date Filter</InputLabel>
            <Select
              value={dateFilter}
              label="Date Filter"
              onChange={(e) => handleDateFilterChange(e.target.value as DateFilterType)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleExportToExcel}
            disabled={isExporting || loading || history.length === 0}
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchHistory()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {duplicates.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            ⚠️ Duplicate Transactions Detected: {duplicates.length} duplicate(s) found
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Duplicates are based on Payment ID, Driver ID, Amount, and Start Date combination.
            Please review the data for potential data integrity issues.
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Total Subscriptions: {totalElements}
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Driver Details</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No subscription history found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.subscriptionId} hover>
                      <TableCell>{item.subscriptionId}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.driver?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.driver?.id || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.driver?.mobile || item.driver?.email || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.planDisplayName || `Plan #${item.planId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.subscriptionType || "N/A"}
                          size="small"
                          color={getTypeColor(item.subscriptionType) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={item.vehicleType || "N/A"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ₹{item.amount?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.startTime
                            ? formatDateTimeIST(item.startTime, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.endTime
                            ? formatDateTimeIST(item.endTime, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || "N/A"}
                          size="small"
                          color={getStatusColor(item.status) as any}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

