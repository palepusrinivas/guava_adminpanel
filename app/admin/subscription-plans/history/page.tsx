"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { config } from "@/utils/config";
import adminAxios from "@/utils/axiosConfig";
import { formatDateTimeIST } from "@/utils/dateUtils";

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

export default function SubscriptionHistoryPage() {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await adminAxios.get<SubscriptionHistoryResponse>(
        `${config.ENDPOINTS.ADMIN.SUBSCRIPTION_HISTORY}?page=${page}&size=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error: any) {
      console.error("Error fetching subscription history:", error);
      setError(error.response?.data?.error || "Failed to fetch subscription history");
      toast.error("Failed to fetch subscription history");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination is 1-based, API is 0-based
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
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchHistory}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
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

