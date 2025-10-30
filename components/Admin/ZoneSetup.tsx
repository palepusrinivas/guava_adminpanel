"use client";
import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Polygon, DrawingManager } from "@react-google-maps/api";
import { config } from "@/utils/config";
import { useFormik } from "formik";
import * as yup from "yup";

interface ZoneSetupProps {
  onCreateZone: (zoneData: any) => void | Promise<void>;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 23.8103, // Dhaka, Bangladesh
  lng: 90.4125,
};

const drawingManagerOptions = {
  drawingControl: true,
  drawingControlOptions: {
    position: 2, // TOP_CENTER
    drawingModes: ["polygon" as google.maps.drawing.OverlayType.POLYGON],
  },
  polygonOptions: {
    fillColor: "#2196F3",
    fillOpacity: 0.3,
    strokeWeight: 2,
    strokeColor: "#2196F3",
    clickable: true,
    editable: true,
    draggable: false,
    zIndex: 1,
  },
};

const libraries: ("drawing" | "places")[] = ["drawing", "places"];

const zoneValidationSchema = yup.object({
  name: yup.string().required("Zone name is required"),
});

function ZoneSetup({ onCreateZone }: ZoneSetupProps) {
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [coordinates, setCoordinates] = useState<google.maps.LatLng[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: zoneValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (coordinates.length < 3) {
        alert("Please draw a zone on the map (minimum 3 points required)");
        return;
      }

      // Convert coordinates to WKT format
      const wktCoordinates = coordinates
        .map((coord) => `${coord.lng()} ${coord.lat()}`)
        .join(", ");
      
      // Close the polygon by adding the first point at the end
      const firstCoord = coordinates[0];
      const wkt = `POLYGON((${wktCoordinates}, ${firstCoord.lng()} ${firstCoord.lat()}))`;

      const zoneData = {
        readableId: `ZONE_${Date.now()}`,
        name: values.name,
        polygonWkt: wkt,
        active: true,
      };

      await onCreateZone(zoneData);
      
      // Clear the form and map
      resetForm();
      if (polygon) {
        polygon.setMap(null);
        setPolygon(null);
      }
      setCoordinates([]);
    },
  });

  const onPolygonComplete = useCallback((completedPolygon: google.maps.Polygon) => {
    // Remove previous polygon if exists
    if (polygon) {
      polygon.setMap(null);
    }

    const path = completedPolygon.getPath();
    const coords: google.maps.LatLng[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push(point);
    }

    setPolygon(completedPolygon);
    setCoordinates(coords);

    // Listen for path changes (when user edits the polygon)
    google.maps.event.addListener(path, "set_at", () => {
      const newCoords: google.maps.LatLng[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        newCoords.push(path.getAt(i));
      }
      setCoordinates(newCoords);
    });

    google.maps.event.addListener(path, "insert_at", () => {
      const newCoords: google.maps.LatLng[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        newCoords.push(path.getAt(i));
      }
      setCoordinates(newCoords);
    });
  }, [polygon]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Instructions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
        <p className="text-sm text-gray-600 mb-4">
          Create zone by clicking on map and connect the dots together
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Drag Map</p>
              <p className="text-xs text-gray-500">Use this to drag map to find proper area</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Draw Polygon</p>
              <p className="text-xs text-gray-500">
                Click this icon to start pin points in the map and connect them to draw a zone. Minimum 3 points required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Creation Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter zone name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>

          {/* Google Map */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {config.GOOGLE_MAPS_API_KEY ? (
              <LoadScript googleMapsApiKey={config.GOOGLE_MAPS_API_KEY} libraries={libraries}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  <DrawingManager
                    options={drawingManagerOptions}
                    onPolygonComplete={onPolygonComplete}
                  />
                </GoogleMap>
              </LoadScript>
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Google Maps API Key not configured</p>
                  <p className="text-sm text-gray-500">
                    Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {coordinates.length > 0 ? (
              <p className="text-green-600">
                ✓ Zone drawn with {coordinates.length} points
              </p>
            ) : (
              <p className="text-gray-500">
                Click the polygon icon on the map to start drawing
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ZoneSetup;

