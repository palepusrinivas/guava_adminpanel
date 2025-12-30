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
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { formatDateTimeIST } from "@/utils/dateUtils";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";
import {
  adminInvoicesUrl,
  adminInvoiceByIdUrl,
  adminInvoiceDownloadUrl,
  adminInvoicesRetryUploadsUrl,
} from "@/utils/apiRoutes";

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceType: "REGULAR_RIDE" | "INTERCITY_RIDE";
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  pickupLocation?: string;
  dropLocation?: string;
  distanceKm?: number;
  durationMinutes?: number;
  rideDate: string;
  invoiceDate: string;
  uploadedToDrive: boolean;
  uploadError?: string;
  googleDriveFileUrl?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [invoiceType, setInvoiceType] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [page, size, invoiceType]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size,
        sortBy: "invoiceDate",
        sortDir: "DESC",
      };
      if (invoiceType) {
        params.invoiceType = invoiceType;
      }

      const response = await adminAxios.get(adminInvoicesUrl, { params });
      const data = response.data;
      
      setInvoices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error: any) {
      toast.error("Error fetching invoices: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await adminAxios.get(adminInvoiceDownloadUrl(invoice.id.toString()), {
        responseType: "blob",
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error("Error downloading invoice: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    setDeleting(true);
    try {
      await adminAxios.delete(adminInvoiceByIdUrl(invoiceToDelete.id.toString()));
      toast.success("Invoice deleted successfully");
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (error: any) {
      toast.error("Error deleting invoice: " + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleRetryUploads = async () => {
    try {
      const response = await adminAxios.post(adminInvoicesRetryUploadsUrl);
      toast.success(
        `Retry completed: ${response.data.successCount} successful, ${response.data.failCount} failed`
      );
      fetchInvoices();
    } catch (error: any) {
      toast.error("Error retrying uploads: " + (error.response?.data?.message || error.message));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatDateTimeIST(dateString, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            📄 Invoice Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, download, and manage invoices
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRetryUploads}
          >
            Retry Failed Uploads
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvoices}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Invoice Type</InputLabel>
            <Select
              value={invoiceType}
              label="Invoice Type"
              onChange={(e) => {
                setInvoiceType(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="REGULAR_RIDE">Regular Ride</MenuItem>
              <MenuItem value="INTERCITY_RIDE">Intercity Ride</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Statistics */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Invoices
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {totalElements}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Uploaded to Drive
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {invoices.filter((inv) => inv.uploadedToDrive).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Failed Uploads
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            {invoices.filter((inv) => !inv.uploadedToDrive && inv.uploadError).length}
          </Typography>
        </Paper>
      </Box>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>Invoice #</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Drive Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                  <Typography color="text.secondary">
                    No invoices found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {invoice.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.invoiceType === "REGULAR_RIDE" ? "Regular" : "Intercity"}
                      size="small"
                      color={invoice.invoiceType === "REGULAR_RIDE" ? "primary" : "secondary"}
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.user ? (
                      <Box>
                        <Typography variant="body2">
                          {invoice.user.firstName} {invoice.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.user.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(invoice.finalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{invoice.paymentMethod}</Typography>
                      <Chip
                        label={invoice.paymentStatus}
                        size="small"
                        color={invoice.paymentStatus === "COMPLETED" ? "success" : "default"}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(invoice.invoiceDate)}</Typography>
                  </TableCell>
                  <TableCell>
                    {invoice.uploadedToDrive ? (
                      <Tooltip title={invoice.googleDriveFileUrl || "Uploaded"}>
                        <Chip
                          icon={<CloudUploadIcon />}
                          label="Uploaded"
                          size="small"
                          color="success"
                        />
                      </Tooltip>
                    ) : invoice.uploadError ? (
                      <Tooltip title={invoice.uploadError}>
                        <Chip label="Failed" size="small" color="error" />
                      </Tooltip>
                    ) : (
                      <Chip label="Pending" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download PDF">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(invoice)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(invoice)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
            color="primary"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete invoice <strong>{invoiceToDelete?.invoiceNumber}</strong>?
            This will also delete the file from Google Drive if it was uploaded.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InvoiceManagement;
