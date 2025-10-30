"use client";
import { driverProfile } from "@/utils/reducers/authReducers";
import {
  getDriverAllocatedRides,
  getDriverCurrentRide,
} from "@/utils/reducers/driverReducers";
import { acceptRide, getRideById } from "@/utils/reducers/rideReducers";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from "@mui/material";
import {
  DirectionsCar,
  Person,
  LocationOn,
  AccessTime,
  CheckCircle,
  Cancel,
  Phone,
  Star
} from "@mui/icons-material";

const AllocatedRides = () => {
  const ride = useAppSelector((state) => state.driver);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [startedride, setStartedride] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingRide, setProcessingRide] = useState<number | null>(null);

  useEffect(() => {
    const dispatchallocatedRide = async () => {
      try {
        if (auth.token) {
          setIsLoading(true);
          await dispatch(getDriverAllocatedRides(auth.token));
        }
      } catch (error) {
        toast.error("Failed to fetch allocated rides");
      } finally {
        setIsLoading(false);
      }
    };
    dispatchallocatedRide();
  }, [ride.status]);

  const handleAcceptRide = async (rideId: number) => {
    try {
      setProcessingRide(rideId);
      if (ride.currentRides.length <= 0) {
        const response = await dispatch(acceptRide(rideId));
        if (response.payload?.error) {
          toast.error(response.payload.message || "Failed to accept ride");
        } else {
          toast.success("Ride accepted successfully!");
        }
      } else {
        toast.error("You already have an active ride");
      }
      if (auth.token) {
        await dispatch(getDriverAllocatedRides(auth.token));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept ride");
    } finally {
      setProcessingRide(null);
    }
  };

  const handleDeclineRide = async (rideId: number) => {
    try {
      setProcessingRide(rideId);
      // TODO: Implement decline ride API call
      toast.success("Ride declined");
      if (auth.token) {
        await dispatch(getDriverAllocatedRides(auth.token));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to decline ride");
    } finally {
      setProcessingRide(null);
    }
  };
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between mb-6">
          <Typography variant="h5" className="font-bold text-gray-800">
            New Ride Requests
          </Typography>
          <Chip 
            label={`${ride.allocatedRides.length} pending`} 
            color="primary" 
            variant="outlined"
          />
        </Box>

        {isLoading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        ) : ride.allocatedRides.length === 0 ? (
          <Alert severity="info" className="text-center py-8">
            <Typography variant="h6" className="mb-2">No New Ride Requests</Typography>
            <Typography variant="body2" className="text-gray-600">
              You'll be notified when new rides are allocated to you.
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {ride.allocatedRides.map((item: any, idx) => (
              <Grid item xs={12} md={6} key={idx + item.id}>
                <Paper 
                  elevation={3} 
                  className="p-4 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex items-center space-x-3">
                      <Avatar className="bg-blue-100 text-blue-600">
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
                      label="New" 
                      color="warning" 
                      size="small"
                    />
                  </Box>

                  <Divider className="my-3" />

                  <Box className="mb-4">
                    <Box className="flex items-center space-x-2 mb-2">
                      <Person className="text-gray-500 text-sm" />
                      <Typography variant="body2" className="font-medium">
                        Customer: {item?.user.fullName}
                      </Typography>
                    </Box>
                    
                    <Box className="flex items-start space-x-2 mb-2">
                      <LocationOn className="text-green-600 text-sm mt-1" />
                      <Box>
                        <Typography variant="body2" className="font-medium text-green-600">
                          Pickup
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {item?.pickupArea}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box className="flex items-start space-x-2">
                      <LocationOn className="text-red-600 text-sm mt-1" />
                      <Box>
                        <Typography variant="body2" className="font-medium text-red-600">
                          Destination
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {item?.destinationArea}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="flex space-x-2">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={processingRide === item.id ? <CircularProgress size={16} /> : <CheckCircle />}
                      onClick={() => handleAcceptRide(item.id)}
                      disabled={processingRide === item.id}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={processingRide === item.id ? <CircularProgress size={16} /> : <Cancel />}
                      onClick={() => handleDeclineRide(item.id)}
                      disabled={processingRide === item.id}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocatedRides;
