"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Paper
} from "@mui/material";
import {
  DirectionsCar,
  Person,
  LocationOn,
  AccessTime,
  PlayArrow,
  Phone,
  Star
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getDriverCurrentRide } from "@/utils/reducers/driverReducers";
import { driverProfile } from "@/utils/reducers/authReducers";
import { useRouter } from "next/navigation";
import { startRide } from "@/utils/reducers/rideReducers";

const CurrentRides = () => {
  const driver = useAppSelector((state) => state.driver);
  const auth = useAppSelector((state) => state.auth);
  const ride = useAppSelector((state) => state.ride);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingRide, setIsStartingRide] = useState(false);

  const handleOpen = () => {
    setOtp("");
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setIsStartingRide(true);
      if (auth.token) {
        const response = await dispatch(driverProfile(auth.token));
        if (response.payload.code === 401) {
          toast.error(response.payload.payload);
          router.replace("/login");
          return;
        }
        
        dispatchGetdriverCurrentRide();
        
        if (driver.currentRides.length > 0) {
          const data = {
            otp: parseInt(otp),
            rideId: ride.rideId,
          };
          const response = await dispatch(startRide(data));
          if (response.payload.error) {
            toast.error(response.payload.message);
          } else {
            toast.success(response.payload.message || "Ride started successfully");
          }
        }
      }
      handleClose();
    } catch (error) {
      toast.error("Failed to start ride");
    } finally {
      setIsStartingRide(false);
    }
  };

  const dispatchGetdriverCurrentRide = async () => {
    try {
      setIsLoading(true);
      if (auth.token) {
        const response = await dispatch(driverProfile(auth.token));
        if (response.payload.code === 401) {
          toast.error(response.payload.payload);
          router.replace("/login");
          return;
        }
        const currentRideData = {
          driverId: response.payload.id,
          token: auth.token,
        };
        await dispatch(getDriverCurrentRide(currentRideData));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch current rides");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatchGetdriverCurrentRide();
  }, []);
  
  useEffect(() => {
    dispatchGetdriverCurrentRide();
  }, [auth.token, ride.status]);

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          <Box className="flex items-center justify-between mb-6">
            <Typography variant="h5" className="font-bold text-gray-800">
              Current Ride
            </Typography>
            <Chip 
              label={driver.currentRides.length > 0 ? "Active" : "No Active Rides"} 
              color={driver.currentRides.length > 0 ? "success" : "default"}
              variant="outlined"
            />
          </Box>

          {isLoading ? (
            <Box className="flex justify-center py-8">
              <CircularProgress />
            </Box>
          ) : driver.currentRides.length === 0 ? (
            <Alert severity="info" className="text-center py-8">
              <Typography variant="h6" className="mb-2">No Active Rides</Typography>
              <Typography variant="body2" className="text-gray-600">
                You don't have any active rides at the moment.
              </Typography>
            </Alert>
          ) : (
            driver.currentRides.map((item: any) => (
              <Paper key={item?.id} elevation={3} className="p-6 rounded-xl">
                <Box className="flex items-start justify-between mb-4">
                  <Box className="flex items-center space-x-4">
                    <Avatar className="bg-green-100 text-green-600">
                      <DirectionsCar />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" className="font-semibold">
                        Ride #{item.id}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {item?.driver?.vehicle?.company} {item?.driver?.vehicle?.model}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label="Ready to Start" 
                    color="warning" 
                    size="small"
                  />
                </Box>

                <Divider className="my-4" />

                <Box className="mb-4">
                  <Box className="flex items-start space-x-2 mb-3">
                    <LocationOn className="text-green-600 text-sm mt-1" />
                    <Box>
                      <Typography variant="body2" className="font-medium text-green-600">
                        Pickup Location
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {ride?.pickupArea || item?.pickupArea}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box className="flex items-start space-x-2">
                    <LocationOn className="text-red-600 text-sm mt-1" />
                    <Box>
                      <Typography variant="body2" className="font-medium text-red-600">
                        Destination
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {ride?.destinationArea || item?.destinationArea}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="flex justify-center">
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={handleOpen}
                    className="px-8 py-3 rounded-xl"
                  >
                    Start Ride
                  </Button>
                </Box>
              </Paper>
            ))
          )}

          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle className="text-center">
              <Typography variant="h6" className="font-bold">
                Start Your Ride
              </Typography>
              <Typography variant="body2" className="text-gray-600 mt-2">
                Enter the OTP provided by the customer
              </Typography>
            </DialogTitle>
            <DialogContent className="pt-4">
              <TextField
                autoFocus
                label="Enter 4-digit OTP"
                type="number"
                name="otp"
                margin="normal"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 4 }}
                helperText="Please enter the OTP shared by the customer"
              />
            </DialogContent>
            <DialogActions className="p-4">
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleOtpSubmit}
                disabled={isStartingRide || !otp || otp.length !== 4}
                startIcon={isStartingRide ? <CircularProgress size={16} /> : <PlayArrow />}
                className="px-6"
              >
                {isStartingRide ? "Starting..." : "Start Ride"}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default CurrentRides;
