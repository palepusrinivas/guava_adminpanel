"use client";
import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { config } from "@/utils/config";
import axios from "axios";
import { getApiUrl } from "@/utils/config";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { DirectionsCar } from "@mui/icons-material";

const libraries: ("visualization")[] = ["visualization"];

const containerStyle = {
  width: "100%",
  height: "400px",
};

interface Driver {
  id: number;
  name: string;
  mobile: string;
  latitude: number;
  longitude: number;
  vehicle?: {
    model?: string;
    licensePlate?: string;
    serviceType?: string;
  };
  rating?: number;
}

interface NearbyDriversMapProps {
  center: { lat: number; lng: number };
  onDriverSelect?: (driver: Driver) => void;
}

export default function NearbyDriversMap({ center, onDriverSelect }: NearbyDriversMapProps) {
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const fetchNearbyDrivers = useCallback(async () => {
    if (!center.lat || !center.lng) return;

    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage if available (optional authentication)
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        getApiUrl("/api/customer/drivers-near-me"),
        {
          params: {
            lat: center.lat,
            lng: center.lng,
            radius_m: 5000, // 5km radius
            limit: 20, // Limit to 20 drivers
          },
          headers,
        }
      );

      const drivers = response.data || [];
      setNearbyDrivers(drivers);
    } catch (err: any) {
      console.error("Error fetching nearby drivers:", err);
      // Don't show error if it's just authentication required
      if (err.response?.status === 401) {
        setError("Please login to see nearby drivers");
      } else {
        setError("Failed to load nearby drivers");
      }
    } finally {
      setLoading(false);
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (isLoaded && center.lat && center.lng) {
      fetchNearbyDrivers();
      // Refresh drivers every 30 seconds
      const interval = setInterval(fetchNearbyDrivers, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, center.lat, center.lng, fetchNearbyDrivers]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const handleMarkerClick = (driver: Driver) => {
    setSelectedDriver(driver);
    if (onDriverSelect) {
      onDriverSelect(driver);
    }
  };

  const getDriverIcon = (serviceType?: string) => {
    // Different colors for different vehicle types
    if (serviceType === "BIKE") {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4285F4",
        fillOpacity: 0.8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    } else if (serviceType === "MEGA") {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF9800",
        fillOpacity: 0.8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    } else {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#34A853",
        fillOpacity: 0.8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    }
  };

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Nearby Drivers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {nearbyDrivers.length} driver{nearbyDrivers.length !== 1 ? "s" : ""} available
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box position="relative" borderRadius={2} overflow="hidden" border="1px solid #e0e0e0">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* User location marker */}
          <Marker
            position={center}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            title="Your Location"
          />

          {/* Nearby drivers markers */}
          {nearbyDrivers.map((driver) => (
            <Marker
              key={driver.id}
              position={{
                lat: driver.latitude,
                lng: driver.longitude,
              }}
              icon={getDriverIcon(driver.vehicle?.serviceType)}
              title={driver.name}
              onClick={() => handleMarkerClick(driver)}
            />
          ))}

          {/* Info window for selected driver */}
          {selectedDriver && (
            <InfoWindow
              position={{
                lat: selectedDriver.latitude,
                lng: selectedDriver.longitude,
              }}
              onCloseClick={() => setSelectedDriver(null)}
            >
              <Box p={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedDriver.name}
                </Typography>
                {selectedDriver.vehicle?.model && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedDriver.vehicle.model}
                  </Typography>
                )}
                {selectedDriver.vehicle?.licensePlate && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedDriver.vehicle.licensePlate}
                  </Typography>
                )}
                {selectedDriver.rating && (
                  <Typography variant="body2" color="text.secondary">
                    ⭐ {selectedDriver.rating.toFixed(1)}
                  </Typography>
                )}
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>

        {loading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(255, 255, 255, 0.8)"
            zIndex={1000}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Legend */}
        <Box
          position="absolute"
          bottom={10}
          left={10}
          bgcolor="white"
          p={1.5}
          borderRadius={1}
          boxShadow={2}
          zIndex={1000}
        >
          <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
            Legend:
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Box width={12} height={12} borderRadius="50%" bgcolor="blue" />
            <Typography variant="caption">Bike</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Box width={12} height={12} borderRadius="50%" bgcolor="orange" />
            <Typography variant="caption">Auto</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} borderRadius="50%" bgcolor="green" />
            <Typography variant="caption">Car</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
