import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getBusinessInfo,
  updateBusinessInfo,
  getBusinessDriverSettings,
  updateBusinessDriverSettings,
  getBusinessCustomerSettings,
  updateBusinessCustomerSettings,
  getBusinessFarePenalty,
  updateBusinessFarePenalty,
  getBusinessTripsSettings,
  updateBusinessTripsSettings,
  getBusinessSettings,
  updateBusinessSettings,
  getBusinessParcelSettings,
  updateBusinessParcelSettings,
  getBusinessRefundSettings,
  updateBusinessRefundSettings,
  getBusinessSafetySettings,
  updateBusinessSafetySettings,
  getBusinessReferralSettings,
  updateBusinessReferralSettings,
  getBusinessChattingSetup,
  updateBusinessChattingSetup,
} from "../reducers/adminReducers";

interface BusinessState {
  businessInfo: any;
  driverSettings: any;
  customerSettings: any;
  farePenalty: any;
  tripsSettings: any;
  settings: any;
  parcelSettings: any;
  refundSettings: any;
  safetySettings: any;
  referralSettings: any;
  chattingSetup: any;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
}

const initialState: BusinessState = {
  businessInfo: null,
  driverSettings: null,
  customerSettings: null,
  farePenalty: null,
  tripsSettings: null,
  settings: null,
  parcelSettings: null,
  refundSettings: null,
  safetySettings: null,
  referralSettings: null,
  chattingSetup: null,
  isLoading: false,
  error: null,
  activeTab: "info",
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearBusinessError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Business Info
      .addCase(getBusinessInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessInfo = action.payload || null;
      })
      .addCase(getBusinessInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessInfo = action.payload || state.businessInfo;
      })
      .addCase(updateBusinessInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Driver Settings
      .addCase(getBusinessDriverSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessDriverSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.driverSettings = action.payload || null;
      })
      .addCase(getBusinessDriverSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessDriverSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessDriverSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.driverSettings = action.payload || state.driverSettings;
      })
      .addCase(updateBusinessDriverSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Customer Settings
      .addCase(getBusinessCustomerSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessCustomerSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerSettings = action.payload || null;
      })
      .addCase(getBusinessCustomerSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessCustomerSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessCustomerSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerSettings = action.payload || state.customerSettings;
      })
      .addCase(updateBusinessCustomerSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fare Penalty
      .addCase(getBusinessFarePenalty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessFarePenalty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farePenalty = action.payload || null;
      })
      .addCase(getBusinessFarePenalty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessFarePenalty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessFarePenalty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farePenalty = action.payload || state.farePenalty;
      })
      .addCase(updateBusinessFarePenalty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Trips Settings
      .addCase(getBusinessTripsSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessTripsSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripsSettings = action.payload || null;
      })
      .addCase(getBusinessTripsSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessTripsSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessTripsSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripsSettings = action.payload || state.tripsSettings;
      })
      .addCase(updateBusinessTripsSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Settings
      .addCase(getBusinessSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload || null;
      })
      .addCase(getBusinessSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload || state.settings;
      })
      .addCase(updateBusinessSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Parcel Settings
      .addCase(getBusinessParcelSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessParcelSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parcelSettings = action.payload || null;
      })
      .addCase(getBusinessParcelSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessParcelSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessParcelSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parcelSettings = action.payload || state.parcelSettings;
      })
      .addCase(updateBusinessParcelSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refund Settings
      .addCase(getBusinessRefundSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessRefundSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.refundSettings = action.payload || null;
      })
      .addCase(getBusinessRefundSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessRefundSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessRefundSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.refundSettings = action.payload || state.refundSettings;
      })
      .addCase(updateBusinessRefundSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Safety Settings
      .addCase(getBusinessSafetySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessSafetySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.safetySettings = action.payload || null;
      })
      .addCase(getBusinessSafetySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessSafetySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessSafetySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.safetySettings = action.payload || state.safetySettings;
      })
      .addCase(updateBusinessSafetySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Referral Settings
      .addCase(getBusinessReferralSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessReferralSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralSettings = action.payload || null;
      })
      .addCase(getBusinessReferralSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessReferralSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessReferralSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralSettings = action.payload || state.referralSettings;
      })
      .addCase(updateBusinessReferralSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Chatting Setup
      .addCase(getBusinessChattingSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessChattingSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chattingSetup = action.payload || null;
      })
      .addCase(getBusinessChattingSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessChattingSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessChattingSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chattingSetup = action.payload || state.chattingSetup;
      })
      .addCase(updateBusinessChattingSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusinessError, setActiveTab } = businessSlice.actions;
export default businessSlice.reducer;

