"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getBusLocation } from "@/utils/slices/schoolSlice";
import { config } from "@/utils/config";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LiveBusMapPage() {
  const { busId } = useParams() as { busId: string };
  const id = Number(busId);
  const dispatch = useAppDispatch();
  const location = useAppSelector((s) => s.school.busLocationsById[id]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;
    const center = { lat: location?.latitude ?? 12.9716, lng: location?.longitude ?? 77.5946 };
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      title: `Bus #${id}`,
    });
  }, [scriptLoaded]);

  // Update marker on location change
  useEffect(() => {
    if (!location || !mapInstanceRef.current || !markerRef.current) return;
    if (location.latitude != null && location.longitude != null) {
      const pos = { lat: location.latitude, lng: location.longitude };
      markerRef.current.setPosition(pos);
      mapInstanceRef.current.setCenter(pos);
    }
  }, [location]);

  // Poll location every 5s
  useEffect(() => {
    if (!id) return;
    const fetchNow = () => dispatch(getBusLocation(id));
    fetchNow();
    const interval = setInterval(fetchNow, 5000);
    return () => clearInterval(interval);
  }, [dispatch, id]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Live Location — Bus #{id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[420px] border rounded overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
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


