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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { config } from "@/utils/config";
import adminAxios from "@/utils/axiosConfig";
import { formatDateTimeIST } from "@/utils/dateUtils";

interface SubscriptionPlan {
  id?: number;
  vehicleType: string;
  subscriptionType: "UNLIMITED" | "INTERCITY_EARNING";
  price: number;
  durationDays?: number;
  durationHours?: number;
  earningLimit?: number;
  percentage?: number;
  active: boolean;
  displayName?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const VEHICLE_TYPES = [
  { value: "BIKE", label: "Bike" },
  { value: "AUTO", label: "Auto" },
  { value: "CAR", label: "Car" },
];

const SUBSCRIPTION_TYPES = [
  { value: "UNLIMITED", label: "Unlimited (Time-based)" },
  { value: "INTERCITY_EARNING", label: "Intercity Earning (Earning-limit based)" },
];

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<SubscriptionPlan>({
    vehicleType: "BIKE",
    subscriptionType: "UNLIMITED",
    price: 0,
    active: true,
    earningLimit: undefined,
    percentage: undefined,
    durationDays: undefined,
    durationHours: undefined,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    console.log("FormData subscriptionType changed:", formData.subscriptionType);
  }, [formData.subscriptionType]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLANS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({
        vehicleType: "BIKE",
        subscriptionType: "UNLIMITED",
        price: 0,
        active: true,
        earningLimit: undefined,
        percentage: undefined,
        durationDays: undefined,
        durationHours: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
    setFormData({
      vehicleType: "BIKE",
      subscriptionType: "UNLIMITED",
      price: 0,
      active: true,
      earningLimit: undefined,
      percentage: undefined,
      durationDays: undefined,
      durationHours: undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = editingPlan
        ? config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLAN_BY_ID.replace(":id", editingPlan.id!.toString())
        : config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLANS;

      if (editingPlan) {
        await adminAxios.put(endpoint, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Subscription plan updated successfully");
      } else {
        await adminAxios.post(endpoint, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Subscription plan created successfully");
      }
      handleCloseDialog();
      fetchPlans();
    } catch (error: any) {
      console.error("Error saving subscription plan:", error);
      toast.error(error.response?.data?.error || "Failed to save subscription plan");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await adminAxios.delete(
        config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLAN_BY_ID.replace(":id", id.toString()),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Subscription plan deleted successfully");
      fetchPlans();
    } catch (error: any) {
      console.error("Error deleting subscription plan:", error);
      toast.error(error.response?.data?.error || "Failed to delete subscription plan");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = currentStatus
        ? config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLAN_DISABLE.replace(":id", id.toString())
        : config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLAN_ENABLE.replace(":id", id.toString());

      await adminAxios.patch(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Subscription plan ${currentStatus ? "disabled" : "enabled"} successfully`);
      fetchPlans();
    } catch (error: any) {
      console.error("Error toggling subscription plan status:", error);
      toast.error("Failed to toggle subscription plan status");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Subscription Plans</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPlans}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/subscription-plans/create-subscription")}
            sx={{ mr: 2 }}
          >
            Create Driver Subscription
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Plan
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vehicle Type</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Earning Limit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No subscription plans found
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.id}</TableCell>
                  <TableCell>
                    <Chip label={plan.vehicleType} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.subscriptionType}
                      color={plan.subscriptionType === "UNLIMITED" ? "primary" : "secondary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{plan.displayName || "-"}</TableCell>
                  <TableCell>₹{plan.price}</TableCell>
                  <TableCell>
                    {plan.subscriptionType === "UNLIMITED" ? (
                      <>
                        {plan.durationDays && `${plan.durationDays} days`}
                        {plan.durationHours && `${plan.durationHours} hours`}
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.subscriptionType === "INTERCITY_EARNING" ? (
                      <>₹{plan.earningLimit}</>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.active ? "Active" : "Inactive"}
                      color={plan.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(plan.id!, plan.active)}
                      color={plan.active ? "error" : "success"}
                    >
                      {plan.active ? <CancelIcon /> : <CheckCircleIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(plan)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(plan.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
        </DialogTitle>
        <DialogContent key={formData.subscriptionType}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                  label="Vehicle Type"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Type</InputLabel>
                <Select
                  value={formData.subscriptionType}
                  onChange={(e) => {
                    const newType = e.target.value as "UNLIMITED" | "INTERCITY_EARNING";
                    console.log("Subscription type changed to:", newType);
                    // Reset fields based on subscription type
                    if (newType === "UNLIMITED") {
                      setFormData((prev) => ({
                        ...prev,
                        subscriptionType: newType,
                        earningLimit: undefined,
                        percentage: undefined,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        subscriptionType: newType,
                        durationDays: undefined,
                        durationHours: undefined,
                      }));
                    }
                  }}
                  label="Subscription Type"
                >
                  {SUBSCRIPTION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </Grid>
            {/* Debug: Current subscription type */}
            {process.env.NODE_ENV === "development" && (
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Debug: Current type = "{formData.subscriptionType}" (Should show earning fields: {String(formData.subscriptionType === "INTERCITY_EARNING")})
                </Typography>
              </Grid>
            )}
            {formData.subscriptionType === "UNLIMITED" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (Days)"
                    type="number"
                    value={formData.durationDays || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (Hours)"
                    type="number"
                    value={formData.durationHours || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationHours: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </Grid>
              </>
            )}
            {formData.subscriptionType === "INTERCITY_EARNING" ? (
              <>
                <Grid item xs={12} sm={6} key="earning-limit-field">
                  <TextField
                    fullWidth
                    label="Earning Limit (₹)"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={formData.earningLimit ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        earningLimit: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} key="percentage-field">
                  <TextField
                    fullWidth
                    label="Percentage (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    value={formData.percentage ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        percentage: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                  />
                </Grid>
              </>
            ) : null}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlan ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

