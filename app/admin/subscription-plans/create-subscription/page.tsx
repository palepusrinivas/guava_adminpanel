"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Autocomplete,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  AttachMoney as CashIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { config } from "@/utils/config";
import adminAxios from "@/utils/axiosConfig";

interface Driver {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  phone?: string;
}

interface SubscriptionPlan {
  id: number;
  vehicleType: string;
  subscriptionType: "UNLIMITED" | "INTERCITY_EARNING";
  price: number;
  durationDays?: number;
  durationHours?: number;
  earningLimit?: number;
  percentage?: number;
  displayName?: string;
  description?: string;
  active?: boolean;
}

interface CreateSubscriptionForm {
  driverId: number | null;
  planId: number | null;
  paymentOption: "CASH" | "PAYMENT_LINK";
  couponCode: string;
  customAmount: number | null;
}

export default function CreateDriverSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverSearchInput, setDriverSearchInput] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreateSubscriptionForm>({
    driverId: null,
    planId: null,
    paymentOption: "CASH",
    couponCode: "",
    customAmount: null,
  });
  const [responseData, setResponseData] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load plans immediately, drivers will load on-demand via search
        await fetchPlans();
        // Load initial small batch of drivers (50 instead of 1000)
        await fetchDrivers("");
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  // Debounced search for drivers
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (driverSearchInput.trim().length >= 2 || driverSearchInput.trim().length === 0) {
        fetchDrivers(driverSearchInput.trim());
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [driverSearchInput]);

  const fetchDrivers = async (searchTerm: string = "") => {
    try {
      setDriversLoading(true);
      // OPTIMIZATION: Load only 50 drivers initially, or use search for filtered results
      // This is much faster than loading 1000 drivers
      const params: any = { 
        page: 0, 
        size: searchTerm ? 100 : 50 // More results when searching, fewer for initial load
      };
      
      if (searchTerm && searchTerm.trim().length >= 2) {
        params.search = searchTerm.trim();
      }
      
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.DRIVERS, { params });
      
      // Handle Spring Data Page response structure
      let driverList: Driver[] = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.content)) {
          // Spring Page structure: { content: [...], totalElements: ..., ... }
          driverList = response.data.content;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          driverList = response.data;
        } else if (Array.isArray(response.data.data)) {
          // Wrapped array response
          driverList = response.data.data;
        }
      }
      
      // Ensure each driver has required fields for display
      const validDrivers = driverList.map(driver => ({
        id: driver.id,
        name: driver.name || driver.username || 'Unknown',
        email: driver.email || '',
        mobile: driver.mobile || driver.phone || '',
      }));
      
      setDrivers(validDrivers);
      
      if (validDrivers.length === 0 && searchTerm) {
        console.log("No drivers found for search:", searchTerm);
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
      if (!searchTerm) {
        // Only show error for initial load, not for search
        toast.error(
          error.response?.data?.error || 
          error.response?.data?.message || 
          "Failed to fetch drivers"
        );
      }
      // Don't throw for search errors, just log them
      if (!searchTerm) {
        throw error;
      }
    } finally {
      setDriversLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await adminAxios.get(config.ENDPOINTS.ADMIN.SUBSCRIPTION_PLANS);
      
      console.log("Plans API Response:", response.data); // Debug log
      
      const planList = response.data || [];
      // Filter only active plans
      const activePlans = planList.filter((plan: SubscriptionPlan) => plan.active !== false);
      setPlans(activePlans);
      
      console.log("Parsed plans list:", activePlans.length, "plans"); // Debug log
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to fetch subscription plans"
      );
      throw error; // Re-throw to be caught by Promise.all
    }
  };

  const handleDriverChange = (_: any, value: Driver | null) => {
    setSelectedDriver(value);
    setFormData({ ...formData, driverId: value?.id || null });
  };

  const handlePlanChange = (event: any) => {
    const planId = parseInt(event.target.value);
    const plan = plans.find((p) => p.id === planId) || null;
    setSelectedPlan(plan);
    setFormData({ ...formData, planId: planId || null });
  };

  const calculateAmount = () => {
    if (!selectedPlan) return 0;
    return formData.customAmount || selectedPlan.price;
  };

  const handleSubmit = async () => {
    if (!formData.driverId || !formData.planId) {
      toast.error("Please select driver and subscription plan");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("adminToken");
      
      const payload: any = {
        driverId: formData.driverId,
        planId: formData.planId,
        paymentOption: formData.paymentOption,
      };

      if (formData.couponCode && formData.couponCode.trim()) {
        payload.couponCode = formData.couponCode.trim();
      }

      if (formData.customAmount && formData.customAmount > 0) {
        payload.customAmount = formData.customAmount;
      }

      const response = await adminAxios.post(
        config.ENDPOINTS.ADMIN.CREATE_DRIVER_SUBSCRIPTION,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResponseData(response.data);
      setShowSuccessDialog(true);
      toast.success("Subscription created successfully!");
      
      // Reset form
      setFormData({
        driverId: null,
        planId: null,
        paymentOption: "CASH",
        couponCode: "",
        customAmount: null,
      });
      setSelectedDriver(null);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to create subscription"
      );
    } finally {
      setSubmitting(false);
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
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Create Driver Subscription</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subscription Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Driver Selection */}
              <Grid item xs={12}>
                <Autocomplete
                  options={drivers}
                  getOptionLabel={(option) =>
                    `${option.name || 'Unknown'} (${option.mobile || 'N/A'}) - ${option.email || "No email"}`
                  }
                  value={selectedDriver}
                  onChange={handleDriverChange}
                  onInputChange={(_, newInputValue) => {
                    setDriverSearchInput(newInputValue);
                  }}
                  inputValue={driverSearchInput}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options) => options} // Disable client-side filtering, use server-side search
                  noOptionsText={
                    driversLoading 
                      ? "Searching drivers..." 
                      : driverSearchInput.length >= 2 
                        ? "No drivers found. Try a different search term." 
                        : "Type at least 2 characters to search"
                  }
                  loading={driversLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Driver *"
                      placeholder="Type to search by name, mobile, or email (min 2 characters)"
                      helperText={driverSearchInput.length > 0 && driverSearchInput.length < 2 
                        ? "Type at least 2 characters to search" 
                        : `${drivers.length} driver${drivers.length !== 1 ? 's' : ''} found`}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">{option.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.mobile || 'N/A'} • {option.email || "No email"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {/* Subscription Plan Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Subscription Plan *</InputLabel>
                  <Select
                    value={formData.planId ? String(formData.planId) : ""}
                    onChange={handlePlanChange}
                    label="Subscription Plan *"
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.displayName || `${plan.vehicleType} - ${plan.subscriptionType}`} - ₹{plan.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Plan Details */}
              {selectedPlan && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Plan Details:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vehicle Type:</strong> {selectedPlan.vehicleType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {selectedPlan.subscriptionType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Price:</strong> ₹{selectedPlan.price}
                      </Typography>
                      {selectedPlan.subscriptionType === "UNLIMITED" && (
                        <>
                          {selectedPlan.durationDays && (
                            <Typography variant="body2">
                              <strong>Duration:</strong> {selectedPlan.durationDays} days
                            </Typography>
                          )}
                          {selectedPlan.durationHours && (
                            <Typography variant="body2">
                              <strong>Duration:</strong> {selectedPlan.durationHours} hours
                            </Typography>
                          )}
                        </>
                      )}
                      {selectedPlan.subscriptionType === "INTERCITY_EARNING" && selectedPlan.earningLimit && (
                        <Typography variant="body2">
                          <strong>Earning Limit:</strong> ₹{selectedPlan.earningLimit}
                        </Typography>
                      )}
                      {selectedPlan.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Description:</strong> {selectedPlan.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Custom Amount */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custom Amount (₹)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={formData.customAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customAmount: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  helperText="Leave empty to use plan price"
                />
              </Grid>

              {/* Coupon Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coupon Code (Optional)"
                  value={formData.couponCode}
                  onChange={(e) =>
                    setFormData({ ...formData, couponCode: e.target.value })
                  }
                  helperText="Apply discount coupon if available"
                />
              </Grid>

              {/* Payment Option */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Payment Option *</FormLabel>
                  <RadioGroup
                    row
                    value={formData.paymentOption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentOption: e.target.value as "CASH" | "PAYMENT_LINK",
                      })
                    }
                  >
                    <FormControlLabel
                      value="CASH"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <CashIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body1">Cash Payment</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Mark subscription as paid immediately
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="PAYMENT_LINK"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <LinkIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body1">Payment Link</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Send payment link via email
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Summary */}
              {selectedPlan && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Plan Price:</Typography>
                        <Typography variant="body2">₹{selectedPlan.price}</Typography>
                      </Box>
                      {formData.customAmount && formData.customAmount !== selectedPlan.price && (
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Custom Amount:</Typography>
                          <Typography variant="body2">₹{formData.customAmount}</Typography>
                        </Box>
                      )}
                      {formData.couponCode && (
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Coupon Applied:</Typography>
                          <Typography variant="body2">{formData.couponCode}</Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2">
                          <strong>Final Amount:</strong>
                        </Typography>
                        <Typography variant="subtitle2">
                          <strong>₹{calculateAmount()}</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Warning for payment link */}
              {formData.paymentOption === "PAYMENT_LINK" && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Payment link will be sent to driver&apos;s email address. 
                    Subscription will be activated after payment is completed.
                    {selectedDriver && !selectedDriver.email && (
                      <strong style={{ display: "block", marginTop: 8 }}>
                        ⚠️ Warning: Driver does not have an email address. 
                        Payment link cannot be sent.
                      </strong>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Action Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.driverId ||
                !formData.planId ||
                (formData.paymentOption === "PAYMENT_LINK" && !selectedDriver?.email)
              }
              sx={{ mb: 2 }}
            >
              {submitting ? "Creating..." : "Create Subscription"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subscription Created Successfully!</DialogTitle>
        <DialogContent>
          {responseData && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                {responseData.message || "Subscription created successfully"}
              </Alert>
              <Typography variant="body2" gutterBottom>
                <strong>Subscription ID:</strong> {responseData.subscriptionId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Driver:</strong> {responseData.driverName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Plan:</strong> {responseData.planDisplayName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Amount:</strong> ₹{responseData.amount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {responseData.status}
              </Typography>
              {responseData.paymentLinkUrl && (
                <>
                  <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                    <strong>Payment Link:</strong>
                  </Typography>
                  <Box
                    component="a"
                    href={responseData.paymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "block",
                      wordBreak: "break-all",
                      color: "primary.main",
                      textDecoration: "none",
                    }}
                  >
                    {responseData.paymentLinkUrl}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowSuccessDialog(false);
            router.push("/admin/subscription-plans/history");
          }}>
            View History
          </Button>
          <Button onClick={() => setShowSuccessDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

