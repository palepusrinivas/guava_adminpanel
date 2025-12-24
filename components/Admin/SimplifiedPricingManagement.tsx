"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import { getPricing, updatePricing } from "@/utils/slices/adminSlice";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon } from "@mui/icons-material";

// Dynamically import TieredPricingManagement to avoid SSR issues
const TieredPricingManagement = dynamic(
  () => import("@/components/Admin/TieredPricingManagement"),
  { 
    ssr: false,
    loading: () => <Box sx={{ p: 3 }}>Loading tiered pricing...</Box>
  }
);

interface SimplifiedPricingConfig {
  // Platform Fees (flat fees)
  autoPlatformFeeFlat?: number | null;
  bikePlatformFeeFlat?: number | null;
  carPlatformFeeFlat?: number | null;
  
  // Commission (%)
  autoCommissionPercent?: number | null;
  bikeCommissionPercent?: number | null;
  carCommissionPercent?: number | null;
  
  // Night Surcharge (%)
  autoNightSurchargePercent?: number | null;
  bikeNightSurchargePercent?: number | null;
  carNightSurchargePercent?: number | null;
  
  // Common settings
  gstPercent?: number | null;
  nightStartHour?: number | null;
  nightEndHour?: number | null;
}

const simplifiedPricingValidationSchema = yup.object({
  autoPlatformFeeFlat: yup.number().min(0, "Must be positive").nullable(),
  bikePlatformFeeFlat: yup.number().min(0, "Must be positive").nullable(),
  carPlatformFeeFlat: yup.number().min(0, "Must be positive").nullable(),
  
  autoCommissionPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  bikeCommissionPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  carCommissionPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  
  autoNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  bikeNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  carNightSurchargePercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  
  gstPercent: yup.number().min(0).max(100, "Must be 0-100").nullable(),
  nightStartHour: yup.number().min(0).max(23, "Must be 0-23").nullable(),
  nightEndHour: yup.number().min(0).max(23, "Must be 0-23").nullable(),
});

export default function SimplifiedPricingManagement() {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  
  const pricingState = useAppSelector((state: any) => state.admin?.pricing);
  const pricingLoading = useAppSelector((state: any) => state.admin?.pricingLoading);
  
  useEffect(() => {
    if (!pricingState && !pricingLoading) {
      dispatch(getPricing());
    }
  }, [dispatch, pricingState, pricingLoading]);
  
  const defaultPricing: SimplifiedPricingConfig = {
    autoPlatformFeeFlat: null,
    bikePlatformFeeFlat: null,
    carPlatformFeeFlat: null,
    autoCommissionPercent: null,
    bikeCommissionPercent: null,
    carCommissionPercent: null,
    autoNightSurchargePercent: null,
    bikeNightSurchargePercent: null,
    carNightSurchargePercent: null,
    gstPercent: null,
    nightStartHour: 21,
    nightEndHour: 5,
  };

  const currentPricing: SimplifiedPricingConfig = pricingState || defaultPricing;

  const formik = useFormik({
    initialValues: {
      autoPlatformFeeFlat: currentPricing.autoPlatformFeeFlat || "",
      bikePlatformFeeFlat: currentPricing.bikePlatformFeeFlat || "",
      carPlatformFeeFlat: currentPricing.carPlatformFeeFlat || "",
      autoCommissionPercent: currentPricing.autoCommissionPercent || "",
      bikeCommissionPercent: currentPricing.bikeCommissionPercent || "",
      carCommissionPercent: currentPricing.carCommissionPercent || "",
      autoNightSurchargePercent: currentPricing.autoNightSurchargePercent || "",
      bikeNightSurchargePercent: currentPricing.bikeNightSurchargePercent || "",
      carNightSurchargePercent: currentPricing.carNightSurchargePercent || "",
      gstPercent: currentPricing.gstPercent || "",
      nightStartHour: currentPricing.nightStartHour || 21,
      nightEndHour: currentPricing.nightEndHour || 5,
    },
    validationSchema: simplifiedPricingValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const cleanedValues: any = {};
        Object.keys(values).forEach((key) => {
          const value = (values as any)[key];
          cleanedValues[key] = value === "" || value === undefined ? null : value;
        });
        
        await dispatch(updatePricing(cleanedValues)).unwrap();
        toast.success("Pricing updated successfully!");
        setIsEditing(false);
        dispatch(getPricing()); // Refresh
      } catch (error: any) {
        toast.error(error?.message || "Failed to update pricing");
      }
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    formik.resetForm();
    setIsEditing(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={activeSubTab} onChange={(_, newValue) => setActiveSubTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="💰 Base Fare Rates (Distance Tiers)" />
        <Tab label="⚙️ Additional Fees & Surcharges" />
      </Tabs>

      {activeSubTab === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Base Fare Rates:</strong> Configure distance-based pricing tiers. These are the primary rates used for fare calculation. 
            Select a service type (BIKE, MEGA, AUTO, etc.) to configure its base fare tiers.
          </Alert>
          <TieredPricingManagement />
        </Box>
      )}

      {activeSubTab === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Additional Fees:</strong> These fees are added on top of the base fare rates. Platform fees are flat amounts, 
            while GST, commission, and night surcharge are percentages.
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Additional Fees Configuration</Typography>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit Fees
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => formik.handleSubmit()}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              <form onSubmit={formik.handleSubmit}>
                {/* Common Settings */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: "bold" }}>
                  🌙 Common Settings
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="GST Percentage (%)"
                      name="gstPercent"
                      type="number"
                      value={formik.values.gstPercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Tax percentage applied to all rides"
                      error={formik.touched.gstPercent && Boolean(formik.errors.gstPercent)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Night Start Hour"
                      name="nightStartHour"
                      type="number"
                      value={formik.values.nightStartHour}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Hour when night surcharge starts (0-23)"
                      inputProps={{ min: 0, max: 23 }}
                      error={formik.touched.nightStartHour && Boolean(formik.errors.nightStartHour)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Night End Hour"
                      name="nightEndHour"
                      type="number"
                      value={formik.values.nightEndHour}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Hour when night surcharge ends (0-23)"
                      inputProps={{ min: 0, max: 23 }}
                      error={formik.touched.nightEndHour && Boolean(formik.errors.nightEndHour)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Auto/Rickshaw Settings */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                  🛺 Auto/Rickshaw (MEGA/AUTO)
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Platform Fee (₹)"
                      name="autoPlatformFeeFlat"
                      type="number"
                      value={formik.values.autoPlatformFeeFlat}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Flat platform fee per ride"
                      error={formik.touched.autoPlatformFeeFlat && Boolean(formik.errors.autoPlatformFeeFlat)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Commission (%)"
                      name="autoCommissionPercent"
                      type="number"
                      value={formik.values.autoCommissionPercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Commission percentage"
                      error={formik.touched.autoCommissionPercent && Boolean(formik.errors.autoCommissionPercent)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Night Surcharge (%)"
                      name="autoNightSurchargePercent"
                      type="number"
                      value={formik.values.autoNightSurchargePercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Percentage surcharge during night hours"
                      error={formik.touched.autoNightSurchargePercent && Boolean(formik.errors.autoNightSurchargePercent)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Bike Settings */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                  🏍️ Bike (BIKE)
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Platform Fee (₹)"
                      name="bikePlatformFeeFlat"
                      type="number"
                      value={formik.values.bikePlatformFeeFlat}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Flat platform fee per ride"
                      error={formik.touched.bikePlatformFeeFlat && Boolean(formik.errors.bikePlatformFeeFlat)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Commission (%)"
                      name="bikeCommissionPercent"
                      type="number"
                      value={formik.values.bikeCommissionPercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Commission percentage"
                      error={formik.touched.bikeCommissionPercent && Boolean(formik.errors.bikeCommissionPercent)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Night Surcharge (%)"
                      name="bikeNightSurchargePercent"
                      type="number"
                      value={formik.values.bikeNightSurchargePercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Percentage surcharge during night hours"
                      error={formik.touched.bikeNightSurchargePercent && Boolean(formik.errors.bikeNightSurchargePercent)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Car Settings */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                  🚗 Car (SMALL_SEDAN/CAR)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Platform Fee (₹)"
                      name="carPlatformFeeFlat"
                      type="number"
                      value={formik.values.carPlatformFeeFlat}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Flat platform fee per ride"
                      error={formik.touched.carPlatformFeeFlat && Boolean(formik.errors.carPlatformFeeFlat)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Commission (%)"
                      name="carCommissionPercent"
                      type="number"
                      value={formik.values.carCommissionPercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Commission percentage"
                      error={formik.touched.carCommissionPercent && Boolean(formik.errors.carCommissionPercent)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Night Surcharge (%)"
                      name="carNightSurchargePercent"
                      type="number"
                      value={formik.values.carNightSurchargePercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      helperText="Percentage surcharge during night hours"
                      error={formik.touched.carNightSurchargePercent && Boolean(formik.errors.carNightSurchargePercent)}
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
