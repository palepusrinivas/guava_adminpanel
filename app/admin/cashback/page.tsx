"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  InputAdornment,
} from "@mui/material";
import {
  Savings as CashbackIcon,
  TrendingUp,
  TrendingDown,
  AccessTime,
  Celebration,
  Category,
  Refresh,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getCashbackDashboard,
  getCashbackSettings,
  updateCashbackSettings,
  toggleCashback,
  updateFestivalMode,
  clearFestivalMode,
  getCashbackEntries,
  expireCashbackEntry,
  processExpiredEntries,
  CashbackSettings,
} from "@/utils/slices/cashbackSlice";
import { toast } from "react-hot-toast";

const VEHICLE_CATEGORIES = [
  { id: "CAR_PREMIUM_EXPRESS", label: "Premium Express Car" },
  { id: "CAR_SHARE_POOLING", label: "Car Share Pooling" },
  { id: "AUTO_SHARE_POOLING", label: "Auto Share Pooling" },
  { id: "TATA_MAGIC_SHARE_POOLING", label: "Tata Magic Share Pooling" },
  { id: "CAR_NORMAL", label: "Car Normal" },
  { id: "AUTO_NORMAL", label: "Auto Normal" },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CashbackManagementPage() {
  const dispatch = useAppDispatch();
  const { settings, dashboard, entries, totalEntries, isLoading, error } = useAppSelector(
    (state) => state.cashback
  );

  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [festivalDialogOpen, setFestivalDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    cashbackPercentage: 10,
    utilisationLimit: 15,
    validityHours: 24,
    maxCreditsPerDay: 1,
    enabledCategories: [] as string[],
  });

  const [festivalData, setFestivalData] = useState({
    extraPercentage: 5,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(getCashbackDashboard());
    dispatch(getCashbackEntries({ page: 0, size: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        cashbackPercentage: settings.cashbackPercentage,
        utilisationLimit: settings.utilisationLimit,
        validityHours: settings.validityHours,
        maxCreditsPerDay: settings.maxCreditsPerDay,
        enabledCategories: settings.enabledCategories || [],
      });
    }
  }, [settings]);

  const handleToggleCashback = async () => {
    if (!settings) return;
    try {
      await dispatch(toggleCashback(!settings.isEnabled)).unwrap();
      toast.success(`Cashback ${!settings.isEnabled ? "enabled" : "disabled"}`);
    } catch (err: any) {
      toast.error(err || "Failed to toggle cashback");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(updateCashbackSettings(formData)).unwrap();
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err || "Failed to save settings");
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      enabledCategories: prev.enabledCategories.includes(categoryId)
        ? prev.enabledCategories.filter((c) => c !== categoryId)
        : [...prev.enabledCategories, categoryId],
    }));
  };

  const handleSaveFestival = async () => {
    try {
      await dispatch(
        updateFestivalMode({
          extraPercentage: festivalData.extraPercentage,
          startDate: festivalData.startDate,
          endDate: festivalData.endDate,
        })
      ).unwrap();
      toast.success("Festival mode updated");
      setFestivalDialogOpen(false);
    } catch (err: any) {
      toast.error(err || "Failed to update festival mode");
    }
  };

  const handleClearFestival = async () => {
    try {
      await dispatch(clearFestivalMode()).unwrap();
      toast.success("Festival mode cleared");
    } catch (err: any) {
      toast.error(err || "Failed to clear festival mode");
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
    dispatch(getCashbackEntries({ page: newPage, size: rowsPerPage, status: statusFilter }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    dispatch(getCashbackEntries({ page: 0, size: newSize, status: statusFilter }));
  };

  const handleExpireEntry = async (entryId: number) => {
    try {
      await dispatch(expireCashbackEntry(entryId)).unwrap();
      toast.success("Entry expired");
    } catch (err: any) {
      toast.error(err || "Failed to expire entry");
    }
  };

  const handleProcessExpired = async () => {
    try {
      await dispatch(processExpiredEntries()).unwrap();
      toast.success("Expired entries processed");
      dispatch(getCashbackEntries({ page, size: rowsPerPage, status: statusFilter }));
    } catch (err: any) {
      toast.error(err || "Failed to process expired entries");
    }
  };

  const formatCurrency = (amount: number) => `₹${amount?.toFixed(2) || "0.00"}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "USED":
        return "info";
      case "PARTIALLY_USED":
        return "warning";
      case "EXPIRED":
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          💰 Cashback Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => dispatch(getCashbackDashboard())}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Master Switch */}
      <Paper sx={{ p: 3, mb: 3, background: settings?.isEnabled ? "#e8f5e9" : "#ffebee" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Cashback System</Typography>
            <Typography variant="body2" color="text.secondary">
              {settings?.isEnabled
                ? `Active at ${settings.effectivePercentage}% (including festival bonus)`
                : "Currently disabled"}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings?.isEnabled || false}
                onChange={handleToggleCashback}
                color="success"
                size="medium"
              />
            }
            label={settings?.isEnabled ? "ON" : "OFF"}
            labelPlacement="start"
          />
        </Box>
      </Paper>

      {/* Dashboard Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <CardContent>
              <Typography color="white" variant="subtitle2">
                Total Credited Today
              </Typography>
              <Typography color="white" variant="h4" fontWeight="bold">
                {formatCurrency(dashboard?.creditedToday || 0)}
              </Typography>
              <TrendingUp sx={{ color: "rgba(255,255,255,0.7)" }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <CardContent>
              <Typography color="white" variant="subtitle2">
                Total Used Today
              </Typography>
              <Typography color="white" variant="h4" fontWeight="bold">
                {formatCurrency(dashboard?.usedToday || 0)}
              </Typography>
              <TrendingDown sx={{ color: "rgba(255,255,255,0.7)" }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <CardContent>
              <Typography color="white" variant="subtitle2">
                Credited This Month
              </Typography>
              <Typography color="white" variant="h4" fontWeight="bold">
                {formatCurrency(dashboard?.creditedThisMonth || 0)}
              </Typography>
              <CashbackIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
            <CardContent>
              <Typography color="white" variant="subtitle2">
                Used This Month
              </Typography>
              <Typography color="white" variant="h4" fontWeight="bold">
                {formatCurrency(dashboard?.usedThisMonth || 0)}
              </Typography>
              <AccessTime sx={{ color: "rgba(255,255,255,0.7)" }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="⚙️ Settings" />
          <Tab label="🎉 Festival Mode" />
          <Tab label="📋 Entries" />
        </Tabs>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Cashback Percentage
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={formData.cashbackPercentage}
                    onChange={(e, v) =>
                      setFormData({ ...formData, cashbackPercentage: v as number })
                    }
                    min={10}
                    max={50}
                    step={5}
                    marks={[
                      { value: 10, label: "10%" },
                      { value: 20, label: "20%" },
                      { value: 30, label: "30%" },
                      { value: 40, label: "40%" },
                      { value: 50, label: "50%" },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(v) => `${v}%`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Utilisation Limit (per trip)
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={formData.utilisationLimit}
                    onChange={(e, v) =>
                      setFormData({ ...formData, utilisationLimit: v as number })
                    }
                    min={10}
                    max={50}
                    step={5}
                    marks={[
                      { value: 10, label: "₹10" },
                      { value: 15, label: "₹15" },
                      { value: 20, label: "₹20" },
                      { value: 30, label: "₹30" },
                      { value: 50, label: "₹50" },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(v) => `₹${v}`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Validity Hours"
                  type="number"
                  value={formData.validityHours}
                  onChange={(e) =>
                    setFormData({ ...formData, validityHours: parseInt(e.target.value) })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Credits Per Day"
                  type="number"
                  value={formData.maxCreditsPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, maxCreditsPerDay: parseInt(e.target.value) })
                  }
                  helperText="0 = Unlimited"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  <Category sx={{ mr: 1, verticalAlign: "middle" }} />
                  Enabled Categories
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      onClick={() => handleCategoryToggle(cat.id)}
                      color={formData.enabledCategories.includes(cat.id) ? "primary" : "default"}
                      variant={formData.enabledCategories.includes(cat.id) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Save Settings"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Festival Mode Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Alert
              severity={settings?.isFestivalActive ? "success" : "info"}
              sx={{ mb: 3 }}
              icon={<Celebration />}
            >
              {settings?.isFestivalActive
                ? `Festival mode is ACTIVE! Extra ${settings.festivalExtraPercentage}% cashback`
                : "Festival mode is not active"}
            </Alert>

            {settings?.isFestivalActive && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: "#fff3e0" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Current Festival Settings
                </Typography>
                <Typography>
                  Extra Bonus: +{settings.festivalExtraPercentage}%
                </Typography>
                <Typography>
                  Period: {new Date(settings.festivalStartDate!).toLocaleDateString()} -{" "}
                  {new Date(settings.festivalEndDate!).toLocaleDateString()}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={handleClearFestival}
                >
                  Clear Festival Mode
                </Button>
              </Paper>
            )}

            <Button
              variant="contained"
              startIcon={<Celebration />}
              onClick={() => setFestivalDialogOpen(true)}
            >
              {settings?.isFestivalActive ? "Update Festival Mode" : "Enable Festival Mode"}
            </Button>
          </Box>
        </TabPanel>

        {/* Entries Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" gap={1}>
                {["", "ACTIVE", "USED", "EXPIRED"].map((status) => (
                  <Chip
                    key={status || "ALL"}
                    label={status || "All"}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(0);
                      dispatch(getCashbackEntries({ page: 0, size: rowsPerPage, status }));
                    }}
                    color={statusFilter === status ? "primary" : "default"}
                    variant={statusFilter === status ? "filled" : "outlined"}
                  />
                ))}
              </Box>
              <Button variant="outlined" onClick={handleProcessExpired}>
                Process Expired
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Remaining</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Expires At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.id}</TableCell>
                      <TableCell>{entry.userId?.substring(0, 8)}...</TableCell>
                      <TableCell>{entry.rideCategory}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{formatCurrency(entry.amountRemaining)}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status) as any}
                          size="small"
                        />
                        {entry.isFestivalBonus && (
                          <Chip label="🎉" size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.expiresAt).toLocaleString()}
                        {entry.isExpiringSoon && (
                          <Chip label="⚠️ Soon" size="small" color="warning" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.status === "ACTIVE" && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleExpireEntry(entry.id)}
                          >
                            Expire
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalEntries}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Festival Dialog */}
      <Dialog open={festivalDialogOpen} onClose={() => setFestivalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Celebration sx={{ mr: 1, verticalAlign: "middle" }} />
          Festival Mode Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Extra Cashback Percentage"
              type="number"
              value={festivalData.extraPercentage}
              onChange={(e) =>
                setFestivalData({ ...festivalData, extraPercentage: parseFloat(e.target.value) })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={festivalData.startDate}
              onChange={(e) => setFestivalData({ ...festivalData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={festivalData.endDate}
              onChange={(e) => setFestivalData({ ...festivalData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFestivalDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFestival}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

