import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import { adminServicesUrl, adminServiceByIdUrl, adminServicesStatsUrl, adminServicesSeedUrl } from "../apiRoutes";

export interface ServiceConfig {
  id: number;
  serviceId: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  iconUrl: string;
  capacity: number;
  displayOrder: number;
  isActive: boolean;
  vehicleType: string;
  estimatedArrival: string;
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  minimumFare: number;
  cancellationFee: number;
  maxDistance: number;
  maxWaitTime: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceConfigState {
  services: ServiceConfig[];
  selectedService: ServiceConfig | null;
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "inactive";
}

const initialState: ServiceConfigState = {
  services: [],
  selectedService: null,
  stats: { total: 0, active: 0, inactive: 0 },
  isLoading: false,
  error: null,
  filter: "all",
};

// Async Thunks
export const getServices = createAsyncThunk(
  "serviceConfig/getServices",
  async (params: { page?: number; size?: number; active?: boolean; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminServicesUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch services");
    }
  }
);

export const getServicesList = createAsyncThunk(
  "serviceConfig/getServicesList",
  async (active: boolean | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${adminServicesUrl}/list`, { params: { active } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch services list");
    }
  }
);

export const getServiceById = createAsyncThunk(
  "serviceConfig/getServiceById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminServiceByIdUrl(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service");
    }
  }
);

export const createService = createAsyncThunk(
  "serviceConfig/createService",
  async (data: Partial<ServiceConfig>, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminServicesUrl, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to create service");
    }
  }
);

export const updateService = createAsyncThunk(
  "serviceConfig/updateService",
  async ({ id, data }: { id: string; data: Partial<ServiceConfig> }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(adminServiceByIdUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to update service");
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  "serviceConfig/toggleServiceStatus",
  async ({ id, active }: { id: string; active: boolean }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.patch(`${adminServiceByIdUrl(id)}/status`, null, {
        params: { active },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update service status");
    }
  }
);

export const deleteService = createAsyncThunk(
  "serviceConfig/deleteService",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminAxios.delete(adminServiceByIdUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete service");
    }
  }
);

export const getServicesStats = createAsyncThunk(
  "serviceConfig/getServicesStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(adminServicesStatsUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const seedDefaultServices = createAsyncThunk(
  "serviceConfig/seedDefaultServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(adminServicesSeedUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to seed default services");
    }
  }
);

const serviceConfigSlice = createSlice({
  name: "serviceConfig",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Services
      .addCase(getServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.content || action.payload || [];
      })
      .addCase(getServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Services List
      .addCase(getServicesList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServicesList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getServicesList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Service By ID
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.selectedService = action.payload;
      })
      // Create Service
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      // Update Service
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      // Toggle Status
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      // Delete Service
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter((s) => s.id.toString() !== action.payload);
      })
      // Get Stats
      .addCase(getServicesStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Seed Defaults
      .addCase(seedDefaultServices.fulfilled, (state) => {
        // Will refetch after seeding
      });
  },
});

export const { setFilter, clearError, clearSelectedService } = serviceConfigSlice.actions;
export default serviceConfigSlice.reducer;

