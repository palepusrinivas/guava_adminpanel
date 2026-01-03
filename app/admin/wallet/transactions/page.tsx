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
  AccountBalanceWallet as WalletIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { config } from "@/utils/config";
import adminAxios from "@/utils/axiosConfig";
import { formatDateTimeIST } from "@/utils/dateUtils";
import { exportToExcel } from "@/utils/excelExport";

interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  referenceType: string;
  referenceId: string;
  status: string;
  notes: string;
  createdAt: string;
  wallet: {
    id: number;
    ownerType: string;
    ownerId: string;
    balance: number;
  };
}

interface WalletTransactionsResponse {
  content: WalletTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await adminAxios.get<WalletTransactionsResponse>(
        `${config.ENDPOINTS.ADMIN.WALLET_TRANSACTIONS}?page=${page}&size=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      setError(error.response?.data?.error || "Failed to fetch wallet transactions");
      toast.error("Failed to fetch wallet transactions");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination is 1-based, API is 0-based
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      // Fetch all transactions (use a large page size to get all)
      const token = localStorage.getItem("adminToken");
      const response = await adminAxios.get<WalletTransactionsResponse>(
        `${config.ENDPOINTS.ADMIN.WALLET_TRANSACTIONS}?page=0&size=10000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const allTransactions = response.data.content;
      
      // Prepare data for Excel export
      const excelData = allTransactions.map((tx) => ({
        id: tx.id,
        ownerType: tx.wallet?.ownerType || '',
        ownerId: tx.wallet?.ownerId || '',
        type: tx.type || '',
        amount: tx.amount || 0,
        currency: tx.currency || 'INR',
        referenceType: tx.referenceType || '',
        referenceId: tx.referenceId || '',
        status: tx.status || '',
        notes: tx.notes || '',
        createdAt: tx.createdAt ? formatDateTimeIST(tx.createdAt) : '',
      }));
      
      // Define columns
      const columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Owner Type', key: 'ownerType', width: 15 },
        { header: 'Owner ID', key: 'ownerId', width: 20 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Currency', key: 'currency', width: 12 },
        { header: 'Reference Type', key: 'referenceType', width: 20 },
        { header: 'Reference ID', key: 'referenceId', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Notes', key: 'notes', width: 30 },
        { header: 'Created At', key: 'createdAt', width: 25 },
      ];
      
      await exportToExcel(excelData, columns, `wallet-transactions-${new Date().toISOString().split('T')[0]}`);
      toast.success('Excel file downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      toast.error(error.message || 'Failed to download Excel file. Please install xlsx: npm install xlsx');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "CREDIT":
        return "success";
      case "DEBIT":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading && transactions.length === 0) {
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
          <WalletIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4">Wallet Transactions</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadExcel}
            disabled={loading}
          >
            Download Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTransactions}
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

      <Card>
        <CardContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Total Transactions: {totalElements}
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Owner Type</TableCell>
                  <TableCell>Owner ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Reference Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No wallet transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>
                        <Chip
                          label={tx.wallet?.ownerType || "N/A"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {tx.wallet?.ownerId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type || "N/A"}
                          size="small"
                          color={getTypeColor(tx.type) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={tx.type === "CREDIT" ? "success.main" : "error.main"}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}₹
                          {tx.amount?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tx.referenceType || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status || "N/A"}
                          size="small"
                          color={getStatusColor(tx.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={tx.notes || ""}
                        >
                          {tx.notes || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tx.createdAt
                            ? formatDateTimeIST(tx.createdAt, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </Typography>
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

