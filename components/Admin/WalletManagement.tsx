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
  getWalletBalance,
  getWalletTransactions,
  initiateWalletTopUp,
  clearCreditSuccess,
  clearDebitSuccess,
  setWorkflowStep,
  resetWalletState,
  getUsers,
  getDrivers,
} from "@/utils/slices/walletSlice";
import toast from "react-hot-toast";

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

const balanceValidationSchema = yup.object({
  ownerType: yup.string().required("Owner type is required"),
  ownerId: yup.string().required("Owner ID is required"),
});

const WalletManagement = () => {
  const dispatch = useAppDispatch();
  const { balance, transactions, isLoading, error, creditSuccess, debitSuccess, topUpLink, users, drivers, workflowStep } = useAppSelector(
    (state) => state.wallet
  );
  const [tabValue, setTabValue] = useState(0);
  const [debitStep, setDebitStep] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [debitAmount, setDebitAmount] = useState<number>(0);
  const [debitReason, setDebitReason] = useState("");
  const [debitNotes, setDebitNotes] = useState("");

  useEffect(() => {
    dispatch(getUsers({}));
    dispatch(getDrivers({}));
  }, [dispatch]);

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

  return (
    <Box>
      {/* Header */}
      <div className="mb-6">
        <Typography variant="h5" className="font-semibold text-gray-800">
          Wallet Management
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-1">
          Manage user and driver wallets, credit funds, and view transactions
        </Typography>
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
          <Tab label="Credit Wallet" />
          <Tab label="Debit Wallet" />
          <Tab label="View Balance" />
          <Tab label="Transactions" />
          <Tab label="Razorpay Top-up" />
        </Tabs>

        {/* Tab 1: Credit Wallet */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={creditFormik.handleSubmit}>
            <div className="space-y-4 max-w-2xl">
              <FormControl fullWidth size="small">
                <InputLabel>Owner Type</InputLabel>
                <Select
                  name="ownerType"
                  value={creditFormik.values.ownerType}
                  onChange={creditFormik.handleChange}
                  label="Owner Type"
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="DRIVER">Driver</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                fullWidth
                options={creditFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (creditFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === creditFormik.values.ownerId
                  ) || null
                }
                onChange={(_, newValue) => {
                  creditFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${creditFormik.values.ownerType === "USER" ? "User" : "Driver"}`}
                    error={creditFormik.touched.ownerId && Boolean(creditFormik.errors.ownerId)}
                    helperText={creditFormik.touched.ownerId && creditFormik.errors.ownerId}
                    size="small"
                  />
                )}
              />

              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                type="number"
                value={creditFormik.values.amount}
                onChange={creditFormik.handleChange}
                error={creditFormik.touched.amount && Boolean(creditFormik.errors.amount)}
                helperText={creditFormik.touched.amount && creditFormik.errors.amount}
                size="small"
              />

              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={creditFormik.values.notes}
                onChange={creditFormik.handleChange}
                error={creditFormik.touched.notes && Boolean(creditFormik.errors.notes)}
                helperText={creditFormik.touched.notes && creditFormik.errors.notes}
                size="small"
              />

              {error && <Alert severity="error">{error}</Alert>}
              {creditSuccess && <Alert severity="success">Wallet credited successfully!</Alert>}

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
                Credit Wallet
              </Button>
            </div>
          </form>
        </TabPanel>

        {/* Tab 2: Debit Wallet - Multi-Step Workflow */}
        <TabPanel value={tabValue} index={1}>
          <Box className="max-w-4xl">
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

        {/* Tab 3: View Balance */}
        <TabPanel value={tabValue} index={2}>
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
                options={balanceFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (balanceFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === balanceFormik.values.ownerId
                  ) || null
                }
                onChange={(_, newValue) => {
                  balanceFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${balanceFormik.values.ownerType === "USER" ? "User" : "Driver"}`}
                    error={balanceFormik.touched.ownerId && Boolean(balanceFormik.errors.ownerId)}
                    helperText={balanceFormik.touched.ownerId && balanceFormik.errors.ownerId}
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

        {/* Tab 4: Transactions */}
        <TabPanel value={tabValue} index={3}>
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
                  options={transactionsFormik.values.ownerType === "USER" ? users : drivers}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.fullName || option.name} (${option.email || option.mobile || option.id})`;
                  }}
                  value={
                    (transactionsFormik.values.ownerType === "USER" ? users : drivers).find(
                      (u) => u.id.toString() === transactionsFormik.values.ownerId
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    transactionsFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Select ${transactionsFormik.values.ownerType === "USER" ? "User" : "Driver"}`}
                      error={
                        transactionsFormik.touched.ownerId && Boolean(transactionsFormik.errors.ownerId)
                      }
                      helperText={transactionsFormik.touched.ownerId && transactionsFormik.errors.ownerId}
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

        {/* Tab 5: Razorpay Top-up */}
        <TabPanel value={tabValue} index={4}>
          <form onSubmit={topUpFormik.handleSubmit}>
            <div className="space-y-4 max-w-2xl">
              <Typography variant="body2" className="text-gray-600 mb-4">
                Initiate a wallet top-up using Razorpay. This will generate a payment link.
              </Typography>

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
                options={topUpFormik.values.ownerType === "USER" ? users : drivers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.fullName || option.name} (${option.email || option.mobile || option.id})`;
                }}
                value={
                  (topUpFormik.values.ownerType === "USER" ? users : drivers).find(
                    (u) => u.id.toString() === topUpFormik.values.ownerId
                  ) || null
                }
                onChange={(_, newValue) => {
                  topUpFormik.setFieldValue("ownerId", newValue ? newValue.id.toString() : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${topUpFormik.values.ownerType === "USER" ? "User" : "Driver"}`}
                    error={topUpFormik.touched.ownerId && Boolean(topUpFormik.errors.ownerId)}
                    helperText={topUpFormik.touched.ownerId && topUpFormik.errors.ownerId}
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
                Generate Payment Link
              </Button>

              {error && <Alert severity="error" className="mt-4">{error}</Alert>}

              {topUpLink && (
                <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", p: 3, mt: 3, bgcolor: "#f0fdf4" }}>
                  <Typography variant="h6" className="text-green-800 mb-2">
                    Payment Link Generated
                  </Typography>
                  <Typography variant="body2" className="text-green-700 mb-3">
                    Click the button below to complete the payment.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="success"
                    href={topUpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay Now
                  </Button>
                  <Typography variant="caption" display="block" className="text-gray-500 mt-2">
                    Link: {topUpLink}
                  </Typography>
                </Paper>
              )}
            </div>
          </form>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WalletManagement;
