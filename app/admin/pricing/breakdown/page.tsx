"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import PricingBreakdown from "@/components/Admin/PricingBreakdown";
import { getApiUrl, getAuthToken } from "@/utils/config";
import axios from "axios";
import toast from "react-hot-toast";

export default function PricingBreakdownPage() {
  const [formData, setFormData] = useState({
    serviceType: "CAR",
    distanceKm: 10,
    durationMin: 30,
    pickupLat: 12.9716,
    pickupLng: 77.5946,
    dropLat: 12.9352,
    dropLng: 77.6245,
  });
  const [breakdown, setBreakdown] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        getApiUrl("/api/fare/estimate"),
        {
          serviceType: formData.serviceType,
          distanceKm: formData.distanceKm,
          durationMin: formData.durationMin,
          pickupLat: formData.pickupLat,
          pickupLng: formData.pickupLng,
          dropLat: formData.dropLat,
          dropLng: formData.dropLng,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (response.data) {
        setBreakdown({
          baseFare: response.data.baseFare || 0,
          distanceFare: response.data.distanceFare || 0,
          timeFare: response.data.timeFare || 0,
          platformFee: response.data.platformFee || 0,
          gst: response.data.gst || 0,
          commission: response.data.commission || 0,
          nightSurcharge: response.data.nightSurcharge || 0,
          subtotal: response.data.subtotal || response.data.total || 0,
          discount: response.data.discount || 0,
          finalTotal: response.data.finalTotal || 0,
          breakdownText: response.data.breakdown?.breakdownText,
        });
        toast.success("Fare breakdown calculated successfully");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to calculate fare breakdown");
      toast.error("Failed to calculate fare breakdown");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" className="font-bold mb-4">
        💰 Pricing Breakdown Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Calculate and view detailed pricing breakdown for rides
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter Ride Details
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth size="small">
              <InputLabel>Service Type</InputLabel>
              <Select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                label="Service Type"
              >
                <MenuItem value="BIKE">Bike</MenuItem>
                <MenuItem value="CAR">Car</MenuItem>
                <MenuItem value="SMALL_SEDAN">Small Sedan</MenuItem>
                <MenuItem value="MEGA">Mega</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Distance (km)"
              type="number"
              size="small"
              value={formData.distanceKm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  distanceKm: parseFloat(e.target.value) || 0,
                })
              }
            />

            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              size="small"
              value={formData.durationMin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMin: parseFloat(e.target.value) || 0,
                })
              }
            />

            <TextField
              fullWidth
              label="Pickup Latitude"
              type="number"
              size="small"
              value={formData.pickupLat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pickupLat: parseFloat(e.target.value) || 0,
                })
              }
            />

            <TextField
              fullWidth
              label="Pickup Longitude"
              type="number"
              size="small"
              value={formData.pickupLng}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pickupLng: parseFloat(e.target.value) || 0,
                })
              }
            />

            <TextField
              fullWidth
              label="Drop Latitude"
              type="number"
              size="small"
              value={formData.dropLat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dropLat: parseFloat(e.target.value) || 0,
                })
              }
            />

            <TextField
              fullWidth
              label="Drop Longitude"
              type="number"
              size="small"
              value={formData.dropLng}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dropLng: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={isLoading}
            sx={{ mt: 3 }}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Calculate Breakdown
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {breakdown && (
        <PricingBreakdown
          breakdown={breakdown}
          distanceKm={formData.distanceKm}
          durationMin={formData.durationMin}
          isNightTime={false}
        />
      )}
    </Box>
  );
}
