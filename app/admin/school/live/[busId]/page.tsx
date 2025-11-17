"use client";
import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusLocation } from "@/utils/slices/schoolSlice";
import { config } from "@/utils/config";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const libraries: never[] = [];

export default function LiveBusMapPage() {
  const { busId } = useParams() as { busId: string };
  const id = Number(busId);
  const dispatch = useAppDispatch();
  const location = useAppSelector((s) => s.school.busLocationsById[id]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Update marker and map center on location change
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const center = { 
      lat: location?.latitude ?? 12.9716, 
      lng: location?.longitude ?? 77.5946 
    };
    mapRef.current.setCenter(center);
  }, [location, isLoaded]);

  // Poll location every 5s
  useEffect(() => {
    if (!id) return;
    const fetchNow = () => dispatch(getBusLocation(id));
    fetchNow();
    const interval = setInterval(fetchNow, 5000);
    return () => clearInterval(interval);
  }, [dispatch, id]);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">Loading map...</div>
      </div>
    );
  }

  const center = { 
    lat: location?.latitude ?? 12.9716, 
    lng: location?.longitude ?? 77.5946 
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Live Location — Bus #{id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[420px] border rounded overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            <Marker
              position={center}
              title={`Bus #${id}`}
            />
          </GoogleMap>
        </div>
        <div className="p-4 border rounded space-y-2">
          <div><span className="font-medium">Latitude:</span> {location?.latitude ?? "-"}</div>
          <div><span className="font-medium">Longitude:</span> {location?.longitude ?? "-"}</div>
          <div><span className="font-medium">ETA (min):</span> {location?.etaMinutes ?? "—"}</div>
          <div className="text-sm text-gray-500">Last updated: {location?.lastUpdated ? new Date(location.lastUpdated).toLocaleTimeString() : "-"}</div>
          <div className="text-xs text-gray-400 break-all">Raw: {location?.raw ? JSON.stringify(location.raw) : "-"}</div>
        </div>
      </div>
    </div>
  );
}


