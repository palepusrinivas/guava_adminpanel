import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getVehicleBrands,
  createVehicleBrand,
  updateVehicleBrand,
  getVehicleModels,
  createVehicleModel,
  getVehicleCategories,
  createVehicleCategory,
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  getVehicleRequests,
  approveVehicleRequest,
  denyVehicleRequest,
  getVehicleUpdateRequests,
  approveVehicleUpdateRequest,
  rejectVehicleUpdateRequest,
} from "../reducers/adminReducers";

export interface VehicleBrand {
  id: string | number;
  brandName: string;
  shortDescription?: string;
  brandLogo?: string;
  active: boolean;
  createdAt?: string;
}

export interface VehicleModel {
  id: string | number;
  modelName: string;
  brandId?: string | number;
  active: boolean;
}

export interface VehicleCategory {
  id: string | number;
  categoryName: string;
  active: boolean;
}

export interface Vehicle {
  id: string | number;
  vehicleId?: string;
  driverId?: string;
  driverName?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleCategory?: string;
  licensePlate?: string;
  licenseExpiryDate?: string;
  vinNumber?: string;
  transmission?: string;
  parcelWeightCapacity?: number;
  fuelType?: string;
  ownership?: string;
  owner?: string;
  engine?: string;
  seat?: number;
  hatchBag?: number;
  fuel?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
}

export interface VehicleRequest {
  id: string | number;
  vehicleId: string;
  vehicleCategory: string;
  brand: string;
  model: string;
  vin?: string;
  license?: string;
  ownerInfo: string;
  ownerName?: string;
  carFeatures?: {
    seat?: number;
    hatchBag?: number;
    fuel?: string;
  } | string;
  status: "PENDING" | "APPROVED" | "DENIED" | "SETTLED";
  createdAt?: string;
}

export interface VehicleUpdateRequest {
  id: string | number;
  vehicleId: string;
  dateTime: string;
  beforeEdit: string;
  afterEdit: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

interface VehicleState {
  brands: VehicleBrand[];
  models: VehicleModel[];
  categories: VehicleCategory[];
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  requests: VehicleRequest[];
  updateRequests: VehicleUpdateRequest[];
  isLoading: boolean;
  error: string | null;
  vehicleFilter: "all" | "active" | "inactive";
  vehicleSearchQuery: string;
  requestTab: "pending" | "denied";
  requestSearchQuery: string;
  brandFilter: "all" | "active" | "inactive";
  brandSearchQuery: string;
  activeTab: "brand" | "model" | "category";
}

const initialState: VehicleState = {
  brands: [],
  models: [],
  categories: [],
  vehicles: [],
  selectedVehicle: null,
  requests: [],
  updateRequests: [],
  isLoading: false,
  error: null,
  vehicleFilter: "all",
  vehicleSearchQuery: "",
  requestTab: "pending",
  requestSearchQuery: "",
  brandFilter: "all",
  brandSearchQuery: "",
  activeTab: "brand",
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    clearVehicleError: (state) => {
      state.error = null;
    },
    setVehicleFilter: (state, action: PayloadAction<VehicleState["vehicleFilter"]>) => {
      state.vehicleFilter = action.payload;
    },
    setVehicleSearchQuery: (state, action: PayloadAction<string>) => {
      state.vehicleSearchQuery = action.payload;
    },
    setRequestTab: (state, action: PayloadAction<VehicleState["requestTab"]>) => {
      state.requestTab = action.payload;
    },
    setRequestSearchQuery: (state, action: PayloadAction<string>) => {
      state.requestSearchQuery = action.payload;
    },
    setBrandFilter: (state, action: PayloadAction<VehicleState["brandFilter"]>) => {
      state.brandFilter = action.payload;
    },
    setBrandSearchQuery: (state, action: PayloadAction<string>) => {
      state.brandSearchQuery = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<VehicleState["activeTab"]>) => {
      state.activeTab = action.payload;
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Brands
      .addCase(getVehicleBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload || [];
      })
      .addCase(getVehicleBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicleBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVehicleBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.brands.unshift(action.payload);
      })
      .addCase(createVehicleBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVehicleBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVehicleBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.brands.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.brands[idx] = action.payload;
      })
      .addCase(updateVehicleBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Models
      .addCase(getVehicleModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleModels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.models = action.payload || [];
      })
      .addCase(getVehicleModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicleModel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVehicleModel.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.models.unshift(action.payload);
      })
      .addCase(createVehicleModel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Categories
      .addCase(getVehicleCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and paginated response
        const payload = action.payload || {};
        if (Array.isArray(payload)) {
          state.categories = payload;
        } else if (payload.content && Array.isArray(payload.content)) {
          state.categories = payload.content;
        } else {
          state.categories = [];
        }
      })
      .addCase(getVehicleCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicleCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVehicleCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.categories.unshift(action.payload);
      })
      .addCase(createVehicleCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vehicles
      .addCase(getVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload || [];
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getVehicleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedVehicle = action.payload || null;
      })
      .addCase(getVehicleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.vehicles.unshift(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vehicles[idx] = action.payload;
        if (state.selectedVehicle?.id === action.payload.id) {
          state.selectedVehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vehicle Requests
      .addCase(getVehicleRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload || [];
      })
      .addCase(getVehicleRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveVehicleRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveVehicleRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(approveVehicleRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(denyVehicleRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(denyVehicleRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(denyVehicleRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vehicle Update Requests
      .addCase(getVehicleUpdateRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleUpdateRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.updateRequests = action.payload || [];
      })
      .addCase(getVehicleUpdateRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveVehicleUpdateRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveVehicleUpdateRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.updateRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.updateRequests[idx] = action.payload;
      })
      .addCase(approveVehicleUpdateRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(rejectVehicleUpdateRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectVehicleUpdateRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.updateRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.updateRequests[idx] = action.payload;
      })
      .addCase(rejectVehicleUpdateRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearVehicleError,
  setVehicleFilter,
  setVehicleSearchQuery,
  setRequestTab,
  setRequestSearchQuery,
  setBrandFilter,
  setBrandSearchQuery,
  setActiveTab,
  setSelectedVehicle,
} = vehicleSlice.actions;
export default vehicleSlice.reducer;

