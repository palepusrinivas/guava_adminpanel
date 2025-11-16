import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getBusinessPage,
  updateBusinessPage,
  uploadPageBanner,
  getLandingPageSetup,
  updateLandingPageSetup,
  getSocialMediaLinks,
  updateSocialMediaLinks,
} from "../reducers/adminReducers";

export interface BusinessPageData {
  pageType: string;
  shortDescription: string;
  longDescription: string;
  bannerImage?: string;
}

interface PagesMediaState {
  businessPages: {
    [key: string]: BusinessPageData;
  };
  landingPageSetup: any;
  socialMediaLinks: any;
  isLoading: boolean;
  error: string | null;
  activePageType: string;
}

const initialState: PagesMediaState = {
  businessPages: {},
  landingPageSetup: null,
  socialMediaLinks: null,
  isLoading: false,
  error: null,
  activePageType: "about_us",
};

const pagesMediaSlice = createSlice({
  name: "pagesMedia",
  initialState,
  reducers: {
    clearPagesMediaError: (state) => {
      state.error = null;
    },
    setActivePageType: (state, action: PayloadAction<string>) => {
      state.activePageType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Business Pages
      .addCase(getBusinessPage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessPage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.businessPages[action.payload.type || state.activePageType] = action.payload;
        }
      })
      .addCase(getBusinessPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessPage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessPage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.businessPages[action.payload.type || state.activePageType] = action.payload;
        }
      })
      .addCase(updateBusinessPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadPageBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPageBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const pageType = action.payload.type || state.activePageType;
          if (state.businessPages[pageType]) {
            state.businessPages[pageType].bannerImage = action.payload.bannerImage;
          }
        }
      })
      .addCase(uploadPageBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Landing Page Setup
      .addCase(getLandingPageSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLandingPageSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.landingPageSetup = action.payload || null;
      })
      .addCase(getLandingPageSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLandingPageSetup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLandingPageSetup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.landingPageSetup = action.payload || state.landingPageSetup;
      })
      .addCase(updateLandingPageSetup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Social Media Links
      .addCase(getSocialMediaLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSocialMediaLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.socialMediaLinks = action.payload || null;
      })
      .addCase(getSocialMediaLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSocialMediaLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSocialMediaLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.socialMediaLinks = action.payload || state.socialMediaLinks;
      })
      .addCase(updateSocialMediaLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPagesMediaError, setActivePageType } = pagesMediaSlice.actions;
export default pagesMediaSlice.reducer;

