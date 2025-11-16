import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  acceptRideUrl,
  completeRideUrl,
  requestRideUrl,
  startRideUrl,
} from "../apiRoutes";

export const requestRide = createAsyncThunk(
  "ride/requestRide",
  async (
    rideData: {
      destinationArea: string;
      pickupArea: string;
      pickupLatitude: number;
      destinationLatitude: number;
      pickupLongitude: number;
      destinationLongitude: number;
    },
    { rejectWithValue }
  ) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    try {
      const response = await axios.post(requestRideUrl, rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      } else {
        return rejectWithValue("An Error Occured !!");
      }
    }
  }
);

export const acceptRide = createAsyncThunk(
  "ride/acceptRide",
  async (rideId: number, { rejectWithValue }) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    try {
      const response = await axios.post(
        acceptRideUrl.replace(":id", rideId.toString()),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      } else {
        return rejectWithValue("An Error Occured !!");
      }
    }
  }
);

export const startRide = createAsyncThunk(
  "ride/startRide",
  async (
    startRideData: { otp: number; rideId: number },
    { rejectWithValue }
  ) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    try {
      const response = await axios.post(
        startRideUrl.replace(":id", startRideData.rideId.toString()),
        startRideData.otp,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      } else {
        return rejectWithValue("An Error Occured !!");
      }
    }
  }
);

export const completeRide = createAsyncThunk(
  "ride/completeRide",
  async (rideId: number, { rejectWithValue }) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;

    try {
      const response = await axios.post(
        completeRideUrl.replace(":id", rideId.toString()),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      } else {
        return rejectWithValue("An Error Occured !!");
      }
    }
  }
);

export const getRideById = createAsyncThunk(
  "ride/getride",
  async (rideData: { rideId: number; token: string }, { rejectWithValue }) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net";
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/ride/${rideData.rideId}`, {
        headers: {
          Authorization: `Bearer ${rideData.token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      } else {
        return rejectWithValue("An Error Occured !!");
      }
    }
  }
);
