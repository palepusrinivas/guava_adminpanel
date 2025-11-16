import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getNotificationRegularTrip,
  updateNotificationRegularTrip,
  getNotificationParcel,
  updateNotificationParcel,
  getNotificationDriverRegistration,
  updateNotificationDriverRegistration,
  getNotificationOther,
  updateNotificationOther,
  getFirebaseConfiguration,
  updateFirebaseConfiguration,
  getThirdPartyConfiguration,
  updateThirdPartyConfiguration,
} from "../reducers/adminReducers";

export interface NotificationMessage {
  enabled: boolean;
  message: string;
}

interface NotificationState {
  regularTrip: {
    customer: { [key: string]: NotificationMessage };
    driver: { [key: string]: NotificationMessage };
  } | null;
  parcel: {
    customer: { [key: string]: NotificationMessage };
    driver?: { [key: string]: NotificationMessage };
  } | null;
  driverRegistration: {
    driver: { [key: string]: NotificationMessage };
  } | null;
  other: {
    coupon?: { [key: string]: NotificationMessage };
    review?: { [key: string]: NotificationMessage };
    referral?: { [key: string]: NotificationMessage };
    safetyAlert?: { [key: string]: NotificationMessage };
    businessPage?: { [key: string]: NotificationMessage };
  } | null;
  firebaseConfiguration: any;
  thirdPartyConfiguration: any;
  isLoading: boolean;
  error: string | null;
  activeTab: "notification-message" | "firebase-configuration";
  activeNotificationType: "regular-trip" | "parcel" | "driver-registration" | "other";
}

const initialState: NotificationState = {
  regularTrip: null,
  parcel: null,
  driverRegistration: null,
  other: null,
  firebaseConfiguration: null,
  thirdPartyConfiguration: null,
  isLoading: false,
  error: null,
  activeTab: "notification-message",
  activeNotificationType: "regular-trip",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action: PayloadAction<"notification-message" | "firebase-configuration">) => {
      state.activeTab = action.payload;
    },
    setActiveNotificationType: (
      state,
      action: PayloadAction<"regular-trip" | "parcel" | "driver-registration" | "other">
    ) => {
      state.activeNotificationType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Regular Trip
      .addCase(getNotificationRegularTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotificationRegularTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.regularTrip = action.payload || null;
      })
      .addCase(getNotificationRegularTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationRegularTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationRegularTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.regularTrip = action.payload || state.regularTrip;
      })
      .addCase(updateNotificationRegularTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Parcel
      .addCase(getNotificationParcel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotificationParcel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parcel = action.payload || null;
      })
      .addCase(getNotificationParcel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationParcel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationParcel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parcel = action.payload || state.parcel;
      })
      .addCase(updateNotificationParcel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Driver Registration
      .addCase(getNotificationDriverRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotificationDriverRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.driverRegistration = action.payload || null;
      })
      .addCase(getNotificationDriverRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationDriverRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationDriverRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.driverRegistration = action.payload || state.driverRegistration;
      })
      .addCase(updateNotificationDriverRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Other
      .addCase(getNotificationOther.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotificationOther.fulfilled, (state, action) => {
        state.isLoading = false;
        state.other = action.payload || null;
      })
      .addCase(getNotificationOther.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationOther.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationOther.fulfilled, (state, action) => {
        state.isLoading = false;
        state.other = action.payload || state.other;
      })
      .addCase(updateNotificationOther.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Firebase Configuration
      .addCase(getFirebaseConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFirebaseConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.firebaseConfiguration = action.payload || null;
      })
      .addCase(getFirebaseConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFirebaseConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFirebaseConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.firebaseConfiguration = action.payload || state.firebaseConfiguration;
      })
      .addCase(updateFirebaseConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Third Party Configuration
      .addCase(getThirdPartyConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getThirdPartyConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.thirdPartyConfiguration = action.payload || null;
      })
      .addCase(getThirdPartyConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateThirdPartyConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateThirdPartyConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.thirdPartyConfiguration = action.payload || state.thirdPartyConfiguration;
      })
      .addCase(updateThirdPartyConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationError, setActiveTab, setActiveNotificationType } = notificationSlice.actions;
export default notificationSlice.reducer;

