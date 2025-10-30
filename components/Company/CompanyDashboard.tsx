"use client";
import { useAppSelector } from "@/utils/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CustomLoader, { CircularProgressBar } from "../CustomLoader";
import { convertMillisecondsToMinutesAndHours } from "@/utils/millisecondsToMinutes";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  LinearProgress
} from "@mui/material";
import {
  People,
  DirectionsCar,
  LocalTaxi,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  PersonAdd,
  Edit,
  Delete,
  Visibility,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Star,
  CheckCircle,
  Cancel,
  Warning
} from "@mui/icons-material";

const CompanyDashboard = () => {
  const [selectedBtn, setSelectedBtn] = useState("Users");
  const [userData, setUserData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [rideData, setRideData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalRevenue: 0,
    activeRides: 0,
    completedRides: 0
  });
  const [selectedTab, setSelectedTab] = useState(0);

  const token = useAppSelector((state) => state.auth.token);

  const getUserData = () => {
    setIsLoading(true);
    axios
      .get("/api/v1/company/allUsers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData(response.data);
        setAnalytics(prev => ({ ...prev, totalUsers: response.data.length }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const getRidesData = () => {
    setIsLoading(true);
    axios
      .get("/api/v1/company/allRides", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRideData(response.data);
        const totalRevenue = response.data.reduce((sum: number, ride: any) => sum + (ride.fare || 0), 0);
        const completedRides = response.data.filter((ride: any) => ride.status === 'COMPLETED').length;
        setAnalytics(prev => ({ 
          ...prev, 
          totalRides: response.data.length,
          totalRevenue,
          completedRides
        }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const getDriverData = () => {
    setIsLoading(true);
    axios
      .get("/api/v1/company/allDrivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDriverData(response.data);
        setAnalytics(prev => ({ ...prev, totalDrivers: response.data.length }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (selectedBtn === "Users") {
      getUserData();
    } else if (selectedBtn === "Drivers") {
      getDriverData();
    } else if (selectedBtn === "Rides") {
      getRidesData();
    }
  }, [selectedBtn]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    const tabs = ["Users", "Drivers", "Rides"];
    setSelectedBtn(tabs[newValue]);
  };

  if (isLoading) {
    return (
      <div className="h-[90vh] flex justify-center items-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Company Dashboard
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Manage users, drivers, and monitor ride analytics
        </Typography>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {analytics.totalUsers}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Users
                  </Typography>
                </Box>
                <People className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {analytics.totalDrivers}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Active Drivers
                  </Typography>
                </Box>
                <DirectionsCar className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {analytics.totalRides}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Rides
                  </Typography>
                </Box>
                <LocalTaxi className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {analytics.completedRides}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Completed
                  </Typography>
                </Box>
                <CheckCircle className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    ₹{analytics.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Revenue
                  </Typography>
                </Box>
                <AttachMoney className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {analytics.activeRides}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Active Rides
                  </Typography>
                </Box>
                <TrendingUp className="text-3xl opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card className="shadow-lg">
        <Box className="border-b border-gray-200">
          <Tabs value={selectedTab} onChange={handleTabChange} className="px-6">
            <Tab 
              label="Users" 
              icon={<People />} 
              iconPosition="start"
              className="text-left"
            />
            <Tab 
              label="Drivers" 
              icon={<DirectionsCar />} 
              iconPosition="start"
              className="text-left"
            />
            <Tab 
              label="Rides" 
              icon={<LocalTaxi />} 
              iconPosition="start"
              className="text-left"
            />
          </Tabs>
        </Box>

        <CardContent className="p-0">
          {selectedTab === 0 && (
            <div className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  User Management
                </Typography>
                <Button variant="contained" startIcon={<PersonAdd />}>
                  Add User
                </Button>
              </Box>
              
            {userData.length === 0 ? (
                <Alert severity="info" className="text-center py-8">
                  <Typography variant="h6" className="mb-2">No Users Found</Typography>
                  <Typography variant="body2" className="text-gray-600">
                    No users have registered yet.
                  </Typography>
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell className="font-semibold">User</TableCell>
                        <TableCell className="font-semibold">Email</TableCell>
                        <TableCell className="font-semibold">Mobile</TableCell>
                        <TableCell className="font-semibold">Status</TableCell>
                        <TableCell className="font-semibold">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userData.map((user: any) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box className="flex items-center space-x-3">
                              <Avatar className="bg-blue-100 text-blue-600">
                                {user.fullName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" className="font-medium">
                                  {user.fullName}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  ID: {user.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box className="flex items-center space-x-2">
                              <Email className="text-gray-400 text-sm" />
                              <Typography variant="body2">{user.email}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box className="flex items-center space-x-2">
                              <Phone className="text-gray-400 text-sm" />
                              <Typography variant="body2">{user.mobile}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label="Active" color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Box className="flex space-x-1">
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" color="secondary">
                                <Edit />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              </div>
            )}

          {selectedTab === 1 && (
            <div className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Driver Management
                </Typography>
                <Button variant="contained" startIcon={<PersonAdd />}>
                  Add Driver
                </Button>
              </Box>
              
            {driverData.length === 0 ? (
                <Alert severity="info" className="text-center py-8">
                  <Typography variant="h6" className="mb-2">No Drivers Found</Typography>
                  <Typography variant="body2" className="text-gray-600">
                    No drivers have registered yet.
                  </Typography>
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {driverData.map((driver: any) => (
                    <Grid item xs={12} md={6} lg={4} key={driver.id}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <Box className="flex items-start justify-between mb-4">
                            <Box className="flex items-center space-x-3">
                              <Avatar className="bg-green-100 text-green-600">
                                {driver.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" className="font-semibold">
                                  {driver.name}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600">
                                  ID: {driver.id}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip label="Active" color="success" size="small" />
                          </Box>

                          <Divider className="my-3" />

                          <Box className="space-y-2 mb-4">
                            <Box className="flex items-center space-x-2">
                              <Email className="text-gray-400 text-sm" />
                              <Typography variant="body2">{driver.email}</Typography>
                            </Box>
                            <Box className="flex items-center space-x-2">
                              <Phone className="text-gray-400 text-sm" />
                              <Typography variant="body2">{driver.mobile}</Typography>
                            </Box>
                            <Box className="flex items-center space-x-2">
                              <AttachMoney className="text-green-500 text-sm" />
                              <Typography variant="body2" className="font-semibold text-green-600">
                                ₹{driver.totalRevenue || 0}
                              </Typography>
                            </Box>
                          </Box>

                          <Box className="bg-gray-50 p-3 rounded-lg mb-4">
                            <Typography variant="subtitle2" className="font-semibold mb-2">
                              Vehicle Details
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {driver.vehicle?.company} {driver.vehicle?.model}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {driver.vehicle?.licensePlate} • {driver.vehicle?.year}
                            </Typography>
                          </Box>

                          <Box className="flex space-x-2">
                            <Button size="small" startIcon={<Visibility />} variant="outlined">
                              View
                            </Button>
                            <Button size="small" startIcon={<Edit />} variant="outlined">
                              Edit
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
            )}
          </div>
          )}

          {selectedTab === 2 && (
            <div className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Ride Management
                </Typography>
                <Button variant="contained" startIcon={<TrendingUp />}>
                  Analytics
                </Button>
              </Box>
              
            {rideData.length === 0 ? (
                <Alert severity="info" className="text-center py-8">
                  <Typography variant="h6" className="mb-2">No Rides Found</Typography>
                  <Typography variant="body2" className="text-gray-600">
                    No rides have been completed yet.
                  </Typography>
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell className="font-semibold">Ride ID</TableCell>
                        <TableCell className="font-semibold">Customer</TableCell>
                        <TableCell className="font-semibold">Driver</TableCell>
                        <TableCell className="font-semibold">Route</TableCell>
                        <TableCell className="font-semibold">Fare</TableCell>
                        <TableCell className="font-semibold">Status</TableCell>
                        <TableCell className="font-semibold">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rideData.map((ride: any) => (
                        <TableRow key={ride.id} hover>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              #{ride.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" className="font-medium">
                                {ride.user?.fullName || ride.user?.email}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {ride.user?.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" className="font-medium">
                                {ride.driver?.name || ride.driver?.email}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {ride.driver?.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" className="text-green-600">
                                {ride.pickupArea}
                              </Typography>
                              <Typography variant="body2" className="text-red-600">
                        {ride.destinationArea}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-semibold text-green-600">
                              ₹{ride.fare}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ride.status || 'COMPLETED'} 
                              color={ride.status === 'COMPLETED' ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box className="flex space-x-1">
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                    {ride.paymentDetails?.paymentId && (
                                <Link href={`https://dashboard.razorpay.com/app/payments/${ride.paymentDetails?.paymentId}`}>
                                  <IconButton size="small" color="secondary">
                                    <AttachMoney />
                                  </IconButton>
                      </Link>
                    )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
