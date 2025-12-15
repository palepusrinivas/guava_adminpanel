"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  creditUserWallet,
  creditDriverWallet,
  debitUserWallet,
  debitDriverWallet,
  manualPaymentUser,
  manualPaymentDriver,
  getWalletBalance,
  getWalletTransactions,
  initiateWalletTopUp,
  clearCreditSuccess,
  clearDebitSuccess,
  clearManualPaymentSuccess,
  setWorkflowStep,
  resetWalletState,
  getUsers,
  getDrivers,
} from "@/utils/slices/walletSlice";
import toast from "react-hot-toast";
import { getApiUrl, getAuthToken } from "@/utils/config";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const creditValidationSchema = yup.object({
  ownerType: yup.string().required("Owner type is required"),
  ownerId: yup.string().required("Owner ID is required"),
  amount: yup.number().required("Amount is required").positive("Amount must be positive"),
  notes: yup.string().required("Notes are required"),
});

const manualPaymentValidationSchema = yup.object({
  ownerType: yup.string().required("Owner type is required"),
  ownerId: yup.string().required("Owner ID is required"),
  amount: yup.number().required("Amount is required").positive("Amount must be positive"),
  paymentMethod: yup.string().required("Payment method is required"),
  referenceNumber: yup.string(),
  notes: yup.string(),
});

const balanceValidationSchema = yup.object({
  ownerType: yup.string().required("Owner type is required"),
  ownerId: yup.string().required("Owner ID is required"),
});

const WalletManagement = () => {
  const dispatch = useAppDispatch();
  const { balance, transactions, isLoading, error, creditSuccess, debitSuccess, manualPaymentSuccess, topUpLink, users: rawUsers, drivers: rawDrivers, workflowStep } = useAppSelector(
    (state) => state.wallet
  );
  
  // Ensure users and drivers are always arrays
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const drivers = Array.isArray(rawDrivers) ? rawDrivers : [];
  
  const [tabValue, setTabValue] = useState(0);
  const [debitStep, setDebitStep] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [debitAmount, setDebitAmount] = useState<number>(0);
  const [debitReason, setDebitReason] = useState("");
  const [debitNotes, setDebitNotes] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fetch more users/drivers by increasing page size
    dispatch(getUsers({ page: 0, size: 500 }));
    dispatch(getDrivers({ page: 0, size: 500 }));
  }, [dispatch, refreshKey]);

  const handleRefreshUsers = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Refreshing users and drivers list...");
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    dispatch(resetWalletState());
  };

  // Credit Wallet Form
  const creditFormik = useFormik({
    initialValues: {
      ownerType: "USER",
      ownerId: "",
      amount: 0,
      notes: "",
    },
    validationSchema: creditValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const { ownerType, ownerId, amount, notes } = values;
      const data = { amount, notes };

      let result;
      if (ownerType === "USER") {
        result = await dispatch(creditUserWallet({ userId: ownerId, data }));
      } else {
        result = await dispatch(creditDriverWallet({ driverId: ownerId, data }));
      }

      if (creditUserWallet.fulfilled.match(result) || creditDriverWallet.fulfilled.match(result)) {
        toast.success(`Successfully credited ₹${amount} to ${ownerType.toLowerCase()} wallet`);
        resetForm();
        setTimeout(() => dispatch(clearCreditSuccess()), 3000);
      } else {
        toast.error(error || "Failed to credit wallet");
      }
    },
  });

  // Balance Check Form
  const balanceFormik = useFormik({
    initialValues: {
      ownerType: "USER",
      ownerId: "",
    },
    validationSchema: balanceValidationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(
        getWalletBalance({ ownerType: values.ownerType, ownerId: values.ownerId })
      );
      if (getWalletBalance.rejected.match(result)) {
        toast.error(error || "Failed to fetch balance");
      }
    },
  });

  // Transactions Form
  const transactionsFormik = useFormik({
    initialValues: {
      ownerType: "USER",
      ownerId: "",
    },
    validationSchema: balanceValidationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(
        getWalletTransactions({ ownerType: values.ownerType, ownerId: values.ownerId })
      );
      if (getWalletTransactions.rejected.match(result)) {
        toast.error(error || "Failed to fetch transactions");
      }
    },
  });

  // Top Up Form
  const topUpFormik = useFormik({
    initialValues: {
      amount: 0,
      ownerType: "USER",
      ownerId: "",
    },
    validationSchema: yup.object({
      amount: yup.number().required("Amount is required").min(10, "Minimum amount is ₹10").max(50000, "Maximum amount is ₹50,000"),
      ownerType: yup.string().required("Owner type is required"),
      ownerId: yup.string().required("Owner ID is required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(
        initiateWalletTopUp({
          amount: values.amount,
          ownerType: values.ownerType as "USER" | "DRIVER",
          ownerId: values.ownerId
        })
      );
      if (initiateWalletTopUp.fulfilled.match(result)) {
        toast.success("Payment link created successfully!");
      } else {
        toast.error(error || "Failed to create payment link");
      }
    },
  });

  // Debit Workflow Handlers
  const handleDebitEntitySelect = async (entity: any, ownerType: string) => {
    setSelectedEntity({ ...entity, ownerType });
    setDebitStep(1);
    // Fetch current balance
    await dispatch(getWalletBalance({ ownerType, ownerId: entity.id.toString() }));
  };

  const handleDebitAmountSubmit = () => {
    if (!debitAmount || debitAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (balance !== null && debitAmount > balance) {
      toast.error(`Insufficient balance! Current balance: ₹${balance}`);
      return;
    }
    setDebitStep(2);
  };

  const handleDebitReasonSubmit = () => {
    if (!debitReason.trim()) {
      toast.error("Please provide a reason for debit");
      return;
    }
    setDebitStep(3);
  };

  const handleDebitConfirm = async () => {
    const data = {
      amount: debitAmount,
      reason: debitReason,
      notes: debitNotes || undefined,
    };

    let result;
    if (selectedEntity.ownerType === "USER") {
      result = await dispatch(debitUserWallet({ userId: selectedEntity.id.toString(), data }));
    } else {
      result = await dispatch(debitDriverWallet({ driverId: selectedEntity.id.toString(), data }));
    }

    if (debitUserWallet.fulfilled.match(result) || debitDriverWallet.fulfilled.match(result)) {
      toast.success(`Successfully debited ₹${debitAmount} from ${selectedEntity.ownerType.toLowerCase()} wallet`);
      setDebitStep(4);
      setTimeout(() => {
        dispatch(clearDebitSuccess());
        handleDebitReset();
      }, 3000);
    } else {
      toast.error(error || "Failed to debit wallet");
    }
  };

  const handleDebitReset = () => {
    setDebitStep(0);
    setSelectedEntity(null);
    setDebitAmount(0);
    setDebitReason("");
    setDebitNotes("");
    dispatch(resetWalletState());
  };

  const debitSteps = ["Select Entity", "Enter Amount", "Add Reason", "Confirm", "Complete"];

  // Manual Payment Form
  const manualPaymentFormik = useFormik({
    initialValues: {
      ownerType: "USER",
      ownerId: "",
      amount: 0,
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
    },
    validationSchema: manualPaymentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const { ownerType, ownerId, amount, paymentMethod, referenceNumber, notes } = values;
      const data = { amount, paymentMethod, referenceNumber, notes };

      let result;
      if (ownerType === "USER") {
        result = await dispatch(manualPaymentUser({ userId: ownerId, data }));
      } else {
        result = await dispatch(manualPaymentDriver({ driverId: ownerId, data }));
      }

      if (manualPaymentUser.fulfilled.match(result) || manualPaymentDriver.fulfilled.match(result)) {
        toast.success(`Successfully added ₹${amount} via ${paymentMethod} to ${ownerType.toLowerCase()} wallet`);
        resetForm();
        setTimeout(() => dispatch(clearManualPaymentSuccess()), 3000);
      } else {
        toast.error(error || "Failed to process manual payment");
      }
    },
  });

  return (
    <Box>
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
        <Typography variant="h5" className="font-semibold text-gray-800">
          Wallet Management
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-1">
          Manage user and driver wallets, credit funds, and view transactions
        </Typography>
          <Typography variant="caption" className="text-gray-400">
            Loaded: {users.length} users, {drivers.length} drivers
          </Typography>
        </div>
        <Button
          variant="outlined"
          onClick={handleRefreshUsers}
          size="small"
          sx={{ textTransform: "none" }}
        >
          🔄 Refresh Users
        </Button>
      </div>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: "1px solid #e5e7eb",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "#120E43",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#120E43",
            },
          }}
        >
          <Tab label="💰 Add Funds (Pay via Razorpay)" />
          <Tab label="💵 Manual Payment" />
          <Tab label="💸 Debit Wallet" />
          <Tab label="📊 View Balance" />
          <Tab label="📜 Transactions" />
          <Tab label="💳 Razorpay Payments" />
        </Tabs>

        {/* Tab 1: Add Funds via Razorpay */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={topUpFormik.handleSubmit}>
            <div className="space-y-4 max-w-2xl">
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>💳 Add Funds via Razorpay:</strong> This will generate a payment link. When you complete the payment, the amount will be debited from your bank account and credited to the selected user/driver wallet.
              </Alert>

              <FormControl fullWidth size="small">
                <InputLabel>Owner Type</InputLabel>
                <Select
                  name="ownerType"
                  value={topUpFormik.values.ownerType}
                  onChange={topUpFormik.handleChange}
                  label="Owner Type"
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="DRIVER">Driver</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                fullWidth
                freeSolo
                options={topUpFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name || 'Unknown'} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (topUpFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === topUpFormik.values.ownerId
                  ) || topUpFormik.values.ownerId || null
                }
                onChange={(_, newValue) => {
                  if (newValue === null) {
                    topUpFormik.setFieldValue("ownerId", "");
                  } else if (typeof newValue === 'string') {
                    // Manual input - only accept if it looks like an ID (numeric)
                    const cleanValue = newValue.replace(/\D/g, '');
                    topUpFormik.setFieldValue("ownerId", cleanValue || newValue);
                  } else {
                    topUpFormik.setFieldValue("ownerId", newValue.id.toString());
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${topUpFormik.values.ownerType === "USER" ? "User" : "Driver"} or Enter ID`}
                    error={topUpFormik.touched.ownerId && Boolean(topUpFormik.errors.ownerId)}
                    helperText={topUpFormik.touched.ownerId ? topUpFormik.errors.ownerId : "Select from list or enter ID"}
                    size="small"
                  />
                )}
              />

              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                type="number"
                value={topUpFormik.values.amount}
                onChange={topUpFormik.handleChange}
                error={topUpFormik.touched.amount && Boolean(topUpFormik.errors.amount)}
                helperText={topUpFormik.touched.amount && topUpFormik.errors.amount}
                size="small"
                inputProps={{ min: 10, max: 50000 }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  backgroundColor: "#120E43",
                  "&:hover": { backgroundColor: "#0d0a30" },
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 4,
                }}
                startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
              >
                💳 Pay & Add Funds
              </Button>

              {error && <Alert severity="error" className="mt-4">{error}</Alert>}

              {topUpLink && (
                <Paper elevation={0} sx={{ border: "2px solid #22c55e", p: 3, mt: 3, bgcolor: "#f0fdf4" }}>
                  <Typography variant="h6" className="text-green-800 mb-2">
                    ✅ Payment Link Generated
                  </Typography>
                  <Typography variant="body2" className="text-green-700 mb-3">
                    Click the button below to complete payment. Once paid, the wallet will be credited automatically.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    href={topUpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="large"
                    sx={{ mb: 2 }}
                  >
                    💳 PAY NOW
                  </Button>
                  <Typography variant="caption" display="block" className="text-gray-500">
                    Payment Link: {topUpLink}
                  </Typography>
                </Paper>
              )}
            </div>
          </form>
        </TabPanel>

        {/* Tab 2: Manual Payment */}
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={manualPaymentFormik.handleSubmit}>
            <div className="space-y-4 max-w-2xl">
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>💵 Manual Payment:</strong> Record cash payments, bank transfers, UPI payments, or other manual payment methods. The amount will be immediately credited to the selected user/driver wallet.
              </Alert>

              <FormControl fullWidth size="small">
                <InputLabel>Owner Type</InputLabel>
                <Select
                  name="ownerType"
                  value={manualPaymentFormik.values.ownerType}
                  onChange={manualPaymentFormik.handleChange}
                  label="Owner Type"
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="DRIVER">Driver</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                fullWidth
                freeSolo
                options={manualPaymentFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name || 'Unknown'} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (manualPaymentFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === manualPaymentFormik.values.ownerId
                  ) || manualPaymentFormik.values.ownerId || null
                }
                onChange={(_, newValue) => {
                  if (newValue === null) {
                    manualPaymentFormik.setFieldValue("ownerId", "");
                  } else if (typeof newValue === 'string') {
                    const cleanValue = newValue.replace(/\D/g, '');
                    manualPaymentFormik.setFieldValue("ownerId", cleanValue || newValue);
                  } else {
                    manualPaymentFormik.setFieldValue("ownerId", newValue.id.toString());
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${manualPaymentFormik.values.ownerType === "USER" ? "User" : "Driver"} or Enter ID`}
                    error={manualPaymentFormik.touched.ownerId && Boolean(manualPaymentFormik.errors.ownerId)}
                    helperText={manualPaymentFormik.touched.ownerId ? manualPaymentFormik.errors.ownerId : "Select from list or enter ID"}
                    size="small"
                  />
                )}
              />

              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                type="number"
                value={manualPaymentFormik.values.amount}
                onChange={manualPaymentFormik.handleChange}
                error={manualPaymentFormik.touched.amount && Boolean(manualPaymentFormik.errors.amount)}
                helperText={manualPaymentFormik.touched.amount && manualPaymentFormik.errors.amount}
                size="small"
                inputProps={{ min: 1, step: 0.01 }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={manualPaymentFormik.values.paymentMethod}
                  onChange={manualPaymentFormik.handleChange}
                  label="Payment Method"
                >
                  <MenuItem value="CASH">💵 Cash</MenuItem>
                  <MenuItem value="BANK_TRANSFER">🏦 Bank Transfer</MenuItem>
                  <MenuItem value="UPI">📱 UPI</MenuItem>
                  <MenuItem value="CHEQUE">📄 Cheque</MenuItem>
                  <MenuItem value="OTHER">🔷 Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Reference Number (Optional)"
                name="referenceNumber"
                value={manualPaymentFormik.values.referenceNumber}
                onChange={manualPaymentFormik.handleChange}
                error={manualPaymentFormik.touched.referenceNumber && Boolean(manualPaymentFormik.errors.referenceNumber)}
                helperText={manualPaymentFormik.touched.referenceNumber ? manualPaymentFormik.errors.referenceNumber : "Transaction ID, UPI ID, Cheque Number, etc."}
                size="small"
              />

              <TextField
                fullWidth
                label="Notes (Optional)"
                name="notes"
                multiline
                rows={3}
                value={manualPaymentFormik.values.notes}
                onChange={manualPaymentFormik.handleChange}
                error={manualPaymentFormik.touched.notes && Boolean(manualPaymentFormik.errors.notes)}
                helperText={manualPaymentFormik.touched.notes ? manualPaymentFormik.errors.notes : "Additional notes about this payment"}
                size="small"
              />

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  backgroundColor: "#120E43",
                  "&:hover": { backgroundColor: "#0d0a30" },
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 4,
                }}
                startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
              >
                ✅ Record Manual Payment
              </Button>

              {error && <Alert severity="error" className="mt-4">{error}</Alert>}

              {manualPaymentSuccess && (
                <Alert severity="success" className="mt-4">
                  Payment recorded successfully! The wallet has been credited.
                </Alert>
              )}
            </div>
          </form>
        </TabPanel>

        {/* Tab 3: Debit Wallet - Multi-Step Workflow */}
        <TabPanel value={tabValue} index={2}>
          <Box className="max-w-4xl">
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>💸 Debit Wallet:</strong> Remove funds from user/driver wallet. The debited amount will be settled to your Razorpay account balance.
            </Alert>
            
            {/* Stepper */}
            <Stepper activeStep={debitStep} sx={{ mb: 4 }}>
              {debitSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 0: Select Entity */}
            {debitStep === 0 && (
              <Box>
                <Typography variant="h6" className="mb-4 font-semibold">
                  Select User or Driver
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" className="font-semibold mb-3">
                        Users
                      </Typography>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.fullName} (${option.email || option.id})`}
                        onChange={(_, value) => value && handleDebitEntitySelect(value, "USER")}
                        renderInput={(params) => <TextField {...params} label="Select User" size="small" />}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" className="font-semibold mb-3">
                        Drivers
                      </Typography>
                      <Autocomplete
                        options={drivers}
                        getOptionLabel={(option) => `${option.name} (${option.mobile || option.id})`}
                        onChange={(_, value) => value && handleDebitEntitySelect(value, "DRIVER")}
                        renderInput={(params) => <TextField {...params} label="Select Driver" size="small" />}
                      />
                    </CardContent>
                  </Card>
                </div>
              </Box>
            )}

            {/* Step 1: Enter Amount */}
            {debitStep === 1 && selectedEntity && (
              <Box>
                <Card className="mb-4">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Selected {selectedEntity.ownerType}
                    </Typography>
                    <Typography variant="h6" className="font-semibold">
                      {selectedEntity.fullName || selectedEntity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEntity.email || selectedEntity.mobile}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box className="flex items-center justify-between">
                      <Typography variant="body2" color="text.secondary">
                        Current Balance
                      </Typography>
                      <Typography variant="h5" className="font-bold" color="primary">
                        ₹{balance !== null ? balance.toLocaleString() : "Loading..."}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Typography variant="h6" className="mb-3 font-semibold">
                  Enter Debit Amount
                </Typography>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={debitAmount || ""}
                  onChange={(e) => setDebitAmount(Number(e.target.value))}
                  size="medium"
                  sx={{ mb: 3 }}
                  helperText={balance !== null && debitAmount > balance ? "⚠️ Amount exceeds current balance" : ""}
                  error={balance !== null && debitAmount > balance}
                />

                <Box className="flex gap-2">
                  <Button onClick={handleDebitReset} variant="outlined">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDebitAmountSubmit}
                    variant="contained"
                    disabled={!debitAmount || debitAmount <= 0}
                    sx={{
                      backgroundColor: "#120E43",
                      "&:hover": { backgroundColor: "#0d0a30" },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Add Reason */}
            {debitStep === 2 && (
              <Box>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Reason for Debit
                </Typography>
                <TextField
                  fullWidth
                  label="Reason (Required)"
                  value={debitReason}
                  onChange={(e) => setDebitReason(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  placeholder="e.g., Penalty for policy violation, Refund adjustment, etc."
                />
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  value={debitNotes}
                  onChange={(e) => setDebitNotes(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 3 }}
                />

                <Box className="flex gap-2">
                  <Button onClick={() => setDebitStep(1)} variant="outlined">
                    Back
                  </Button>
                  <Button
                    onClick={handleDebitReasonSubmit}
                    variant="contained"
                    disabled={!debitReason.trim()}
                    sx={{
                      backgroundColor: "#120E43",
                      "&:hover": { backgroundColor: "#0d0a30" },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 3: Confirmation */}
            {debitStep === 3 && selectedEntity && (
              <Box>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Confirm Debit
                </Typography>
                <Card>
                  <CardContent>
                    <Box className="space-y-3">
                      <Box className="flex justify-between">
                        <Typography color="text.secondary">Entity Type:</Typography>
                        <Chip label={selectedEntity.ownerType} size="small" color="primary" />
                      </Box>
                      <Box className="flex justify-between">
                        <Typography color="text.secondary">Name:</Typography>
                        <Typography className="font-semibold">
                          {selectedEntity.fullName || selectedEntity.name}
                        </Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography color="text.secondary">Current Balance:</Typography>
                        <Typography className="font-semibold">₹{balance?.toLocaleString()}</Typography>
                      </Box>
                      <Divider />
                      <Box className="flex justify-between">
                        <Typography color="text.secondary">Debit Amount:</Typography>
                        <Typography className="font-bold text-xl" color="error">
                          - ₹{debitAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography color="text.secondary">New Balance:</Typography>
                        <Typography className="font-bold" color="success.main">
                          ₹{((balance || 0) - debitAmount).toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography color="text.secondary" className="mb-1">
                          Reason:
                        </Typography>
                        <Typography>{debitReason}</Typography>
                      </Box>
                      {debitNotes && (
                        <Box>
                          <Typography color="text.secondary" className="mb-1">
                            Notes:
                          </Typography>
                          <Typography>{debitNotes}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Alert severity="warning" sx={{ mt: 3, mb: 3 }}>
                  This action will debit ₹{debitAmount.toLocaleString()} from the wallet. Please confirm to proceed.
                </Alert>

                <Box className="flex gap-2">
                  <Button onClick={() => setDebitStep(2)} variant="outlined">
                    Back
                  </Button>
                  <Button
                    onClick={handleDebitConfirm}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      backgroundColor: "#d32f2f",
                      "&:hover": { backgroundColor: "#b71c1c" },
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                  >
                    Confirm Debit
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 4: Success */}
            {debitStep === 4 && (
              <Box className="text-center py-8">
                <Alert severity="success" sx={{ mb: 3 }}>
                  Wallet debited successfully!
                </Alert>
                <Typography variant="h5" className="mb-2 font-bold" color="success.main">
                  ₹{debitAmount.toLocaleString()}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  has been debited from {selectedEntity?.fullName || selectedEntity?.name}'s wallet
                </Typography>
                <Button onClick={handleDebitReset} variant="contained" sx={{ backgroundColor: "#120E43" }}>
                  Start New Debit
                </Button>
              </Box>
            )}

            {error && debitStep < 4 && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          </Box>
        </TabPanel>

        {/* Tab 4: View Balance */}
        <TabPanel value={tabValue} index={3}>
          <form onSubmit={balanceFormik.handleSubmit}>
            <div className="space-y-4 max-w-2xl">
              <FormControl fullWidth size="small">
                <InputLabel>Owner Type</InputLabel>
                <Select
                  name="ownerType"
                  value={balanceFormik.values.ownerType}
                  onChange={balanceFormik.handleChange}
                  label="Owner Type"
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="DRIVER">Driver</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                fullWidth
                freeSolo
                options={balanceFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name || 'Unknown'} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (balanceFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === balanceFormik.values.ownerId
                  ) || balanceFormik.values.ownerId || null
                }
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') {
                    balanceFormik.setFieldValue("ownerId", newValue);
                  } else {
                  balanceFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  balanceFormik.setFieldValue("ownerId", newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${balanceFormik.values.ownerType === "USER" ? "User" : "Driver"} or Enter ID`}
                    error={balanceFormik.touched.ownerId && Boolean(balanceFormik.errors.ownerId)}
                    helperText={balanceFormik.touched.ownerId ? balanceFormik.errors.ownerId : `${users.length} users loaded`}
                    size="small"
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  backgroundColor: "#120E43",
                  "&:hover": { backgroundColor: "#0d0a30" },
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 4,
                }}
                startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
              >
                Get Balance
              </Button>

              {error && <Alert severity="error" className="mt-4">{error}</Alert>}

              {balance !== null && (
                <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", p: 3, mt: 3 }}>
                  <Typography variant="h6" className="text-gray-700 mb-2">
                    Current Balance
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    ₹{balance.toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </div>
          </form>
        </TabPanel>

        {/* Tab 5: Transactions */}
        <TabPanel value={tabValue} index={4}>
          <form onSubmit={transactionsFormik.handleSubmit}>
            <div className="space-y-4">
              <div className="flex gap-4 max-w-2xl">
                <FormControl fullWidth size="small">
                  <InputLabel>Owner Type</InputLabel>
                  <Select
                    name="ownerType"
                    value={transactionsFormik.values.ownerType}
                    onChange={transactionsFormik.handleChange}
                    label="Owner Type"
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="DRIVER">Driver</MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  fullWidth
                  freeSolo
                  options={transactionsFormik.values.ownerType === "USER" ? users : drivers}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.fullName || option.name || 'Unknown'} (${option.email || option.mobile || option.id})`;
                  }}
                  value={
                    (transactionsFormik.values.ownerType === "USER" ? users : drivers).find(
                      (u) => u.id.toString() === transactionsFormik.values.ownerId
                    ) || transactionsFormik.values.ownerId || null
                  }
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      transactionsFormik.setFieldValue("ownerId", newValue);
                    } else {
                    transactionsFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    transactionsFormik.setFieldValue("ownerId", newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Select ${transactionsFormik.values.ownerType === "USER" ? "User" : "Driver"} or Enter ID`}
                      error={
                        transactionsFormik.touched.ownerId && Boolean(transactionsFormik.errors.ownerId)
                      }
                      helperText={transactionsFormik.touched.ownerId ? transactionsFormik.errors.ownerId : `${users.length} users loaded`}
                      size="small"
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    backgroundColor: "#120E43",
                    "&:hover": { backgroundColor: "#0d0a30" },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 4,
                    minWidth: "150px",
                  }}
                  startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                >
                  Get Transactions
                </Button>
              </div>

              {error && <Alert severity="error">{error}</Alert>}

              {transactions.length > 0 && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", mt: 3 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>#{transaction.id}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              size="small"
                              sx={{
                                backgroundColor:
                                  transaction.type === "CREDIT" ? "#D1FAE5" : "#FEE2E2",
                                color: transaction.type === "CREDIT" ? "#065F46" : "#991B1B",
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={transaction.type === "CREDIT" ? "#10B981" : "#EF4444"}
                            >
                              {transaction.type === "CREDIT" ? "+" : "-"}₹
                              {transaction.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={transaction.status} size="small" />
                          </TableCell>
                          <TableCell>{transaction.notes || "-"}</TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {transactions.length === 0 && !isLoading && !error && transactionsFormik.values.ownerId && (
                <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", p: 10, textAlign: "center" }}>
                  <Typography variant="body1" className="text-gray-500">
                    No transactions found
                  </Typography>
                </Paper>
              )}
            </div>
          </form>
        </TabPanel>

        {/* Tab 6: Razorpay Payments */}
        <TabPanel value={tabValue} index={5}>
          <RazorpayTransactionsPanel />
        </TabPanel>

      </Paper>
    </Box>
  );
};

// Razorpay Transactions Panel Component
const RazorpayTransactionsPanel = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
      });
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        getApiUrl(`/api/admin/wallet/razorpay-transactions?${params}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 401 || response.status === 403) {
        setError("Authentication failed. Please login again.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      
      const data = await response.json();
      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No token available for stats fetch");
        return;
      }
      
      const response = await fetch(
        getApiUrl(`/api/admin/wallet/razorpay-transactions/stats`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed for stats fetch");
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [page, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return { bg: "#D1FAE5", color: "#065F46" };
      case "PENDING":
      case "INITIATED":
        return { bg: "#FEF3C7", color: "#92400E" };
      case "FAILED":
        return { bg: "#FEE2E2", color: "#991B1B" };
      default:
        return { bg: "#E5E7EB", color: "#374151" };
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6" className="mb-4">
        💳 Razorpay Payment Transactions
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.totalTransactions}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #22c55e" }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Successful</Typography>
              <Typography variant="h4" fontWeight={700} color="#22c55e">{stats.successCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #f59e0b" }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Pending</Typography>
              <Typography variant="h4" fontWeight={700} color="#f59e0b">{stats.pendingCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #ef4444" }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Failed</Typography>
              <Typography variant="h4" fontWeight={700} color="#ef4444">{stats.failedCount}</Typography>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Total Successful Amount:</strong> ₹{stats.totalSuccessAmount?.toLocaleString() || 0}
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center mb-4">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            label="Status Filter"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="SUCCESS">Success</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="INITIATED">Initiated</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
          </Select>
        </FormControl>
              <Button
          variant="outlined"
          onClick={() => {
            fetchTransactions();
            fetchStats();
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Refresh"}
              </Button>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Transactions Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No transactions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const statusColors = getStatusColor(tx.status);
                return (
                  <TableRow key={tx.id} hover>
                    <TableCell>#{tx.id}</TableCell>
                    <TableCell>{tx.userId || tx.driverId || "-"}</TableCell>
                    <TableCell>
                      <Chip label={tx.type || "N/A"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color="#10B981">
                        ₹{tx.amount?.toLocaleString() || 0}
                  </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.color,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>{tx.provider || "RAZORPAY"}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {tx.providerPaymentId || tx.providerPaymentLinkId || "-"}
                  </Typography>
                    </TableCell>
                    <TableCell>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outlined"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
                  </Button>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", px: 2 }}>
            Page {page + 1} of {totalPages}
                  </Typography>
          <Button
            variant="outlined"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
              )}
            </div>
  );
};

export default WalletManagement;
