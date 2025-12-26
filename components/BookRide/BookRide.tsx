"use client";
import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import BookRideNavBar from "./BookRideNavBar";
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Box, 
  CircularProgress,
  Chip,
  Divider
} from "@mui/material";
import { 
  LocationOn, 
  MyLocation, 
  SwapHoriz, 
  Schedule, 
  DirectionsCar,
  AccessTime,
  LocalGasStation
} from "@mui/icons-material";
import AvailableCab from "./AvailableCabs";
import SearchResult from "./SearchResult";
import PricingBreakdown from "@/components/Admin/PricingBreakdown";
import axios from "axios";
import { requestRide } from "@/utils/reducers/rideReducers";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getLocationIqUrl, getLocationSearchAutocompleteUrl, config, getApiUrl } from "@/utils/config";

const validationSchema = Yup.object().shape({
  pickupArea: Yup.string().required("Pickup location is required"),
  destinationArea: Yup.string().required("Destination location is required"),
});

function BookRide() {
  const [activeField, setActiveField] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState("");
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [fareBreakdown, setFareBreakdown] = useState<any>(null);
  const dispatch = useAppDispatch();
  const ride = useAppSelector((state) => state.ride);
  const router = useRouter();
  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Unable to get current location. Please enable location services.");
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const fetchSuggestions = debounce(
    async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      try {
        // Use backend endpoint instead of direct LocationIQ API call
        // This is faster, has timeout control, and keeps API keys secure
        const response = await axios.get(getLocationSearchAutocompleteUrl(input, 5), {
          timeout: 8000 // 8 second timeout on frontend (backend has 10 second timeout)
        });
        setSuggestions(response.data || []);
      } catch (error: any) {
        console.error("Error fetching location suggestions:", error);
        // Don't show error toast for timeout/cancellation - user might be typing
        if (error.code !== 'ECONNABORTED' && !error.message?.includes('timeout')) {
          toast.error("Failed to fetch location suggestions");
        }
        setSuggestions([]); // Clear suggestions on error
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    300 // 300ms debounce delay
  );

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
    setActiveField(name);
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const displayName = suggestion.display_name;
    const latitude = suggestion.lat;
    const longitude = suggestion.lon;
    formik.setFieldValue(activeField, displayName);

    if (activeField === "pickupArea") {
      formik.setFieldValue("pickupLatitude", latitude);
      formik.setFieldValue("pickupLongitude", longitude);
    } else if (activeField === "destinationArea") {
      formik.setFieldValue("destinationLatitude", latitude);
      formik.setFieldValue("destinationLongitude", longitude);
    }

    setActiveField("");
    setSuggestions([]);
    
    // Calculate estimated fare and time when both locations are selected
    if (formik.values.pickupLatitude && formik.values.destinationLatitude) {
      calculateFareAndTime();
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      formik.setFieldValue("pickupArea", "Current Location");
      formik.setFieldValue("pickupLatitude", currentLocation.lat);
      formik.setFieldValue("pickupLongitude", currentLocation.lng);
      toast.success("Current location set as pickup point");
    } else {
      toast.error("Unable to get current location");
    }
  };

  const handleOnSubmit = async (values: {
    pickupArea: string;
    destinationArea: string;
    destinationLatitude: string;
    destinationLongitude: string;
    pickupLatitude: string;
    pickupLongitude: string;
  }) => {
    try {
      const response = await dispatch(
        requestRide({
          destinationArea: values.destinationArea,
          pickupArea: values.pickupArea,
          destinationLatitude: parseFloat(values.destinationLatitude),
          destinationLongitude: parseFloat(values.destinationLongitude),
          pickupLatitude: parseFloat(values.pickupLatitude),
          pickupLongitude: parseFloat(values.pickupLongitude),
        })
      );
      if (response.payload.code === 401) {
        router.replace("/login");
        return;
      }
      if (response.payload.error) {
        toast.error(response.payload.message);
      } else if (response.payload === "Internal Server Error") {
        toast.error(response.payload);
      } else {
        toast.success(response.payload.message || "Ride Booked successfully");
        router.push(`/rideDetail/${response.payload?.id}`);
      }
    } catch (error) {
      toast.error("An error occurred while Booking Ride");
    }
  };

  const formik = useFormik({
    initialValues: {
      pickupArea: "",
      pickupLatitude: "",
      pickupLongitude: "",
      destinationArea: "",
      destinationLatitude: "",
      destinationLongitude: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (formik.isValid) handleOnSubmit(values);
    },
  });

  const swapLocations = () => {
    const tempArea = formik.values.pickupArea;
    const tempLat = formik.values.pickupLatitude;
    const tempLng = formik.values.pickupLongitude;
    
    formik.setFieldValue("pickupArea", formik.values.destinationArea);
    formik.setFieldValue("pickupLatitude", formik.values.destinationLatitude);
    formik.setFieldValue("pickupLongitude", formik.values.destinationLongitude);
    
    formik.setFieldValue("destinationArea", tempArea);
    formik.setFieldValue("destinationLatitude", tempLat);
    formik.setFieldValue("destinationLongitude", tempLng);
    
    // Recalculate after swapping
    if (formik.values.destinationLatitude && tempLat) {
      setTimeout(() => calculateFareAndTime(), 100);
    }
  };

  const calculateFareAndTime = useCallback(async () => {
    const pickupLat = formik.values.pickupLatitude;
    const pickupLng = formik.values.pickupLongitude;
    const dropLat = formik.values.destinationLatitude;
    const dropLng = formik.values.destinationLongitude;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return;
    }

    setIsCalculating(true);
    try {
      // Use Google Maps Directions API to get distance and duration
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&key=${config.GOOGLE_MAPS_API_KEY}`;
      
      const directionsResponse = await axios.get(directionsUrl);
      
      if (directionsResponse.data.status === 'OK' && directionsResponse.data.routes.length > 0) {
        const route = directionsResponse.data.routes[0];
        const leg = route.legs[0];
        
        // Distance in meters, convert to km
        const distanceKm = leg.distance.value / 1000;
        // Duration in seconds, convert to minutes
        const durationMin = Math.round(leg.duration.value / 60);
        
        setEstimatedDistance(Math.round(distanceKm * 10) / 10); // Round to 1 decimal
        setEstimatedTime(`${durationMin} min`);
        
        // Now call backend API to get fare estimate
        try {
          const fareRequest = {
            serviceType: "CAR", // Default to CAR, can be made dynamic
            distanceKm: distanceKm,
            durationMin: durationMin,
            pickupLat: parseFloat(pickupLat),
            pickupLng: parseFloat(pickupLng),
            dropLat: parseFloat(dropLat),
            dropLng: parseFloat(dropLng),
          };
          
          const fareResponse = await axios.post(
            getApiUrl("/api/fare/estimate"),
            fareRequest,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          if (fareResponse.data && fareResponse.data.finalTotal) {
            setEstimatedFare(Math.round(fareResponse.data.finalTotal));
            // Store full breakdown for display
            if (fareResponse.data.breakdown) {
              setFareBreakdown(fareResponse.data.breakdown);
            } else {
              // Create breakdown from response data
              setFareBreakdown({
                baseFare: fareResponse.data.baseFare || 0,
                distanceFare: fareResponse.data.distanceFare || 0,
                timeFare: fareResponse.data.timeFare || 0,
                platformFee: fareResponse.data.platformFee || 0,
                gst: fareResponse.data.gst || 0,
                commission: fareResponse.data.commission || 0,
                nightSurcharge: fareResponse.data.nightSurcharge || 0,
                subtotal: fareResponse.data.subtotal || fareResponse.data.total || 0,
                discount: fareResponse.data.discount || 0,
                finalTotal: fareResponse.data.finalTotal || 0,
              });
            }
          } else {
            // Fallback calculation if API doesn't return fare
            const baseFare = 50;
            const perKmRate = 15;
            setEstimatedFare(Math.round(baseFare + (distanceKm * perKmRate)));
          }
        } catch (fareError) {
          console.error("Error fetching fare estimate:", fareError);
          // Fallback calculation
          const baseFare = 50;
          const perKmRate = 15;
          setEstimatedFare(Math.round(baseFare + (distanceKm * perKmRate)));
        }
      } else {
        console.error("Directions API error:", directionsResponse.data.status);
        toast.error("Could not calculate route. Please try again.");
      }
    } catch (error: any) {
      console.error("Error calculating distance and time:", error);
      toast.error("Failed to calculate trip details. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  }, [formik.values.pickupLatitude, formik.values.pickupLongitude, formik.values.destinationLatitude, formik.values.destinationLongitude]);

  // Recalculate when both locations are set
  useEffect(() => {
    if (formik.values.pickupLatitude && formik.values.destinationLatitude) {
      calculateFareAndTime();
    } else {
      // Clear estimates if locations are not complete
      setEstimatedFare(null);
      setEstimatedTime("");
      setEstimatedDistance(null);
      setFareBreakdown(null);
    }
  }, [calculateFareAndTime, formik.values.pickupLatitude, formik.values.destinationLatitude]);
  const onFocused = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setActiveField(name);
  };
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <BookRideNavBar />
      
      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Typography variant="h4" className="text-center mb-8 font-bold text-gray-800">
            Book Your Ride
          </Typography>
          
          {locationError && (
            <Alert severity="warning" className="mb-6">
              {locationError}
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Pickup Location */}
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <LocationOn className="text-green-600" />
                    <Typography variant="subtitle1" className="font-semibold text-gray-700">
                      Pickup Location
                    </Typography>
                    {currentLocation && (
                      <Button
                        size="small"
                        startIcon={<MyLocation />}
                        onClick={useCurrentLocation}
                        className="text-blue-600"
                      >
                        Use Current Location
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      name="pickupArea"
                      placeholder="Enter pickup location"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      value={formik.values.pickupArea}
                      onChange={handleInputChange}
                      onBlur={formik.handleBlur}
                      onFocus={onFocused}
                    />
                    
                    {activeField === "pickupArea" && formik.values?.pickupArea?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white z-20 rounded-lg shadow-xl border max-h-60 overflow-y-auto mt-1">
                        {isLoadingSuggestions ? (
                          <div className="p-4 text-center">
                            <CircularProgress size={24} />
                            <Typography variant="body2" className="mt-2">Searching...</Typography>
                          </div>
                        ) : (
                          suggestions.map((suggestion: any, index) => (
                            <div
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                              <LocationOn className="text-gray-400 mr-3" />
                              <div>
                                <Typography variant="body2" className="font-medium">
                                  {suggestion?.display_name?.split(',')[0]}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {suggestion?.display_name}
                                </Typography>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  {formik.touched.pickupArea && formik.errors.pickupArea && (
                    <Typography variant="caption" className="text-red-500 mt-1">
                      {formik.errors.pickupArea}
                    </Typography>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SwapHoriz />}
                    onClick={swapLocations}
                    className="rounded-full"
                  >
                    Swap
                  </Button>
                </div>

                {/* Destination Location */}
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <LocationOn className="text-red-600" />
                    <Typography variant="subtitle1" className="font-semibold text-gray-700">
                      Destination
                    </Typography>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      name="destinationArea"
                      placeholder="Enter destination"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      value={formik.values.destinationArea}
                      onChange={handleInputChange}
                      onBlur={formik.handleBlur}
                      onFocus={onFocused}
                    />
                    
                    {activeField === "destinationArea" && formik.values?.destinationArea?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white z-20 rounded-lg shadow-xl border max-h-60 overflow-y-auto mt-1">
                        {isLoadingSuggestions ? (
                          <div className="p-4 text-center">
                            <CircularProgress size={24} />
                            <Typography variant="body2" className="mt-2">Searching...</Typography>
                          </div>
                        ) : (
                          suggestions.map((suggestion: any, index) => (
                            <div
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                              <LocationOn className="text-gray-400 mr-3" />
                              <div>
                                <Typography variant="body2" className="font-medium">
                                  {suggestion?.display_name?.split(',')[0]}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {suggestion?.display_name}
                                </Typography>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  {formik.touched.destinationArea && formik.errors.destinationArea && (
                    <Typography variant="caption" className="text-red-500 mt-1">
                      {formik.errors.destinationArea}
                    </Typography>
                  )}
                </div>

                {/* Estimated Fare, Distance, and Time */}
                {(estimatedFare || estimatedTime || estimatedDistance) && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <Typography variant="h6" className="text-blue-800 mb-3">
                        Trip Details
                      </Typography>
                      {isCalculating ? (
                        <div className="flex items-center justify-center py-4">
                          <CircularProgress size={24} />
                          <Typography variant="body2" className="ml-2">
                            Calculating...
                          </Typography>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {estimatedDistance && (
                            <div className="flex flex-col items-center">
                              <DirectionsCar className="text-blue-600 mb-1" />
                              <Typography variant="body2" className="text-gray-600">
                                Distance
                              </Typography>
                              <Typography variant="body1" className="font-semibold">
                                {estimatedDistance} km
                              </Typography>
                            </div>
                          )}
                          {estimatedTime && (
                            <div className="flex flex-col items-center">
                              <AccessTime className="text-orange-600 mb-1" />
                              <Typography variant="body2" className="text-gray-600">
                                ETA
                              </Typography>
                              <Typography variant="body1" className="font-semibold">
                                {estimatedTime}
                              </Typography>
                            </div>
                          )}
                          {estimatedFare && (
                            <div className="flex flex-col items-center">
                              <LocalGasStation className="text-green-600 mb-1" />
                              <Typography variant="body2" className="text-gray-600">
                                Fare
                              </Typography>
                              <Typography variant="body1" className="font-semibold">
                                ₹{estimatedFare}
                              </Typography>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pricing Breakdown */}
                      {fareBreakdown && (
                        <div className="mt-4">
                          <PricingBreakdown
                            breakdown={fareBreakdown}
                            distanceKm={estimatedDistance || undefined}
                            durationMin={estimatedTime ? parseInt(estimatedTime.replace(" min", "")) : undefined}
                            isNightTime={false}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!formik.isValid || !formik.values.pickupArea || !formik.values.destinationArea}
                >
                  <DirectionsCar className="mr-2" />
                  Book Your Ride
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Available Cabs Section */}
          <div className="mt-8">
            <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
              Available Ride Options
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <DirectionsCar className="text-blue-600 text-2xl" />
                    <div>
                      <Typography variant="h6" className="font-semibold">Standard</Typography>
                      <Typography variant="body2" className="text-gray-600">4-seater car</Typography>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Typography variant="h6" className="text-green-600">₹150</Typography>
                    <Chip label="2 min" size="small" color="primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <DirectionsCar className="text-green-600 text-2xl" />
                    <div>
                      <Typography variant="h6" className="font-semibold">Premium</Typography>
                      <Typography variant="body2" className="text-gray-600">6-seater SUV</Typography>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Typography variant="h6" className="text-green-600">₹250</Typography>
                    <Chip label="3 min" size="small" color="primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <DirectionsCar className="text-purple-600 text-2xl" />
                    <div>
                      <Typography variant="h6" className="font-semibold">Luxury</Typography>
                      <Typography variant="body2" className="text-gray-600">Premium sedan</Typography>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Typography variant="h6" className="text-green-600">₹400</Typography>
                    <Chip label="5 min" size="small" color="primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookRide;
