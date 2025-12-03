import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import {
  schoolSubscriptionPlansUrl,
  schoolSubscriptionPlanByIdUrl,
} from "../apiRoutes";

const BASE_URL = "/api/admin/school";

// ========== INTERFACES ==========
export interface SchoolSubscriptionPlan {
  id: number;
  name: string;
  amount: number;
  durationDays: number;
  description: string;
  isActive: boolean;
}

export interface Institution {
  id: number;
  name: string;
  uniqueId?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  email?: string;
  gstNumber?: string;
}

export interface Branch {
  id: number;
  institutionId: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  subscriptionPlan?: string;
}

export interface Bus {
  id: number;
  branchId: number;
  busNumber?: string;
  capacity?: number;
  type?: string;
  rcExpiry?: string;
  insuranceExpiry?: string;
  photoUrl?: string;
}

export interface Route {
  id: number;
  branchId: number;
  name: string;
  isMorning: boolean;
}

export interface Stop {
  id: number;
  routeId: number;
  name: string;
  latitude?: number;
  longitude?: number;
  stopOrder?: number;
  etaMinutesFromPrev?: number;
}

export interface BusLocation {
  busId: number;
  latitude: number;
  longitude: number;
  timestamp?: string;
  etaMinutes?: number;
  lastUpdated?: string;
  raw?: any;
}

// ========== STATE ==========
interface SchoolState {
  // Subscription Plans
  plans: SchoolSubscriptionPlan[];
  
  // Institutions
  institutions: Institution[];
  institutionsById: Record<number, Institution>;
  
  // Branches
  branchesByInstitution: Record<number, Branch[]>;
  branchesAll: Branch[];
  
  // Buses
  busesByBranch: Record<number, Bus[]>;
  
  // Routes
  routesByBranch: Record<number, Route[]>;
  
  // Stops
  stopsByRoute: Record<number, Stop[]>;
  
  // Bus Locations
  busLocationsById: Record<number, BusLocation>;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
}

const initialState: SchoolState = {
  plans: [],
  institutions: [],
  institutionsById: {},
  branchesByInstitution: {},
  branchesAll: [],
  busesByBranch: {},
  routesByBranch: {},
  stopsByRoute: {},
  busLocationsById: {},
  isLoading: false,
  error: null,
};

// ========== SUBSCRIPTION PLANS ==========
export const fetchSubscriptionPlans = createAsyncThunk(
  "school/fetchSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(schoolSubscriptionPlansUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch plans");
    }
  }
);

export const createSubscriptionPlan = createAsyncThunk(
  "school/createSubscriptionPlan",
  async (planData: Omit<SchoolSubscriptionPlan, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(schoolSubscriptionPlansUrl, planData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create plan");
    }
  }
);

export const updateSubscriptionPlan = createAsyncThunk(
  "school/updateSubscriptionPlan",
  async ({ id, data }: { id: number; data: Partial<SchoolSubscriptionPlan> }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(schoolSubscriptionPlanByIdUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update plan");
    }
  }
);

export const deleteSubscriptionPlan = createAsyncThunk(
  "school/deleteSubscriptionPlan",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete(schoolSubscriptionPlanByIdUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete plan");
    }
  }
);

// ========== INSTITUTIONS ==========
export const listInstitutions = createAsyncThunk(
  "school/listInstitutions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/institutions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch institutions");
    }
  }
);

export const getInstitution = createAsyncThunk(
  "school/getInstitution",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/institutions/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch institution");
    }
  }
);

export const getInstitutionByUniqueId = createAsyncThunk(
  "school/getInstitutionByUniqueId",
  async (uniqueId: string, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/institutions/unique/${uniqueId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch institution");
    }
  }
);

export const createInstitution = createAsyncThunk(
  "school/createInstitution",
  async (data: Omit<Institution, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${BASE_URL}/institutions`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create institution");
    }
  }
);

export const updateInstitution = createAsyncThunk(
  "school/updateInstitution",
  async ({ id, updates }: { id: number; updates: Partial<Institution> }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${BASE_URL}/institutions/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update institution");
    }
  }
);

export const deleteInstitution = createAsyncThunk(
  "school/deleteInstitution",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`${BASE_URL}/institutions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete institution");
    }
  }
);

// ========== BRANCHES ==========
export const listBranches = createAsyncThunk(
  "school/listBranches",
  async (institutionId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/branches?institutionId=${institutionId}`);
      return { institutionId, branches: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branches");
    }
  }
);

export const listAllBranches = createAsyncThunk(
  "school/listAllBranches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/branches`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branches");
    }
  }
);

export const createBranch = createAsyncThunk(
  "school/createBranch",
  async (data: Omit<Branch, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${BASE_URL}/branches`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create branch");
    }
  }
);

export const updateBranch = createAsyncThunk(
  "school/updateBranch",
  async ({ id, updates }: { id: number; updates: Partial<Branch> }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${BASE_URL}/branches/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update branch");
    }
  }
);

export const deleteBranch = createAsyncThunk(
  "school/deleteBranch",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`${BASE_URL}/branches/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete branch");
    }
  }
);

// ========== BUSES ==========
export const listBuses = createAsyncThunk(
  "school/listBuses",
  async (branchId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/buses?branchId=${branchId}`);
      return { branchId, buses: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch buses");
    }
  }
);

export const createBus = createAsyncThunk(
  "school/createBus",
  async (data: Omit<Bus, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${BASE_URL}/buses`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create bus");
    }
  }
);

export const updateBus = createAsyncThunk(
  "school/updateBus",
  async ({ id, updates }: { id: number; updates: Partial<Bus> }, { rejectWithValue }) => {
    try {
      const response = await adminAxios.put(`${BASE_URL}/buses/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update bus");
    }
  }
);

export const deleteBus = createAsyncThunk(
  "school/deleteBus",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`${BASE_URL}/buses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete bus");
    }
  }
);

export const getBusLocation = createAsyncThunk(
  "school/getBusLocation",
  async (busId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/tracking/bus/${busId}?limit=1`);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { busId, location: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bus location");
    }
  }
);

// ========== ROUTES ==========
export const createRoute = createAsyncThunk(
  "school/createRoute",
  async (data: Omit<Route, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${BASE_URL}/routes`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create route");
    }
  }
);

// ========== STOPS ==========
export const listStops = createAsyncThunk(
  "school/listStops",
  async (routeId: number, { rejectWithValue }) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/stops?routeId=${routeId}`);
      return { routeId, stops: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stops");
    }
  }
);

export const createStop = createAsyncThunk(
  "school/createStop",
  async (data: Omit<Stop, "id">, { rejectWithValue }) => {
    try {
      const response = await adminAxios.post(`${BASE_URL}/stops`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create stop");
    }
  }
);

// ========== SLICE ==========
const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Subscription Plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex((plan) => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      })
      // Institutions
      .addCase(listInstitutions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listInstitutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutions = action.payload;
        state.institutionsById = {};
        action.payload.forEach((inst: Institution) => {
          state.institutionsById[inst.id] = inst;
        });
      })
      .addCase(listInstitutions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getInstitution.fulfilled, (state, action) => {
        const inst = action.payload;
        state.institutionsById[inst.id] = inst;
        const index = state.institutions.findIndex((i) => i.id === inst.id);
        if (index === -1) {
          state.institutions.push(inst);
        } else {
          state.institutions[index] = inst;
        }
      })
      .addCase(getInstitutionByUniqueId.fulfilled, (state, action) => {
        const inst = action.payload;
        state.institutionsById[inst.id] = inst;
        const index = state.institutions.findIndex((i) => i.id === inst.id);
        if (index === -1) {
          state.institutions.push(inst);
        } else {
          state.institutions[index] = inst;
        }
      })
      .addCase(createInstitution.fulfilled, (state, action) => {
        const inst = action.payload;
        state.institutions.push(inst);
        state.institutionsById[inst.id] = inst;
      })
      .addCase(updateInstitution.fulfilled, (state, action) => {
        const inst = action.payload;
        state.institutionsById[inst.id] = inst;
        const index = state.institutions.findIndex((i) => i.id === inst.id);
        if (index !== -1) {
          state.institutions[index] = inst;
        }
      })
      .addCase(deleteInstitution.fulfilled, (state, action) => {
        const id = action.payload;
        state.institutions = state.institutions.filter((i) => i.id !== id);
        delete state.institutionsById[id];
      })
      // Branches
      .addCase(listBranches.fulfilled, (state, action) => {
        state.branchesByInstitution[action.payload.institutionId] = action.payload.branches;
      })
      .addCase(listAllBranches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listAllBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branchesAll = action.payload;
      })
      .addCase(listAllBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        const branch = action.payload;
        const instId = branch.institutionId;
        if (!state.branchesByInstitution[instId]) {
          state.branchesByInstitution[instId] = [];
        }
        state.branchesByInstitution[instId].push(branch);
        state.branchesAll.push(branch);
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        const branch = action.payload;
        const instId = branch.institutionId;
        if (state.branchesByInstitution[instId]) {
          const index = state.branchesByInstitution[instId].findIndex((b) => b.id === branch.id);
          if (index !== -1) {
            state.branchesByInstitution[instId][index] = branch;
          }
        }
        const allIndex = state.branchesAll.findIndex((b) => b.id === branch.id);
        if (allIndex !== -1) {
          state.branchesAll[allIndex] = branch;
        }
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        const id = action.payload;
        Object.keys(state.branchesByInstitution).forEach((instId) => {
          state.branchesByInstitution[Number(instId)] = state.branchesByInstitution[Number(instId)].filter((b) => b.id !== id);
        });
        state.branchesAll = state.branchesAll.filter((b) => b.id !== id);
      })
      // Buses
      .addCase(listBuses.fulfilled, (state, action) => {
        state.busesByBranch[action.payload.branchId] = action.payload.buses;
      })
      .addCase(createBus.fulfilled, (state, action) => {
        const bus = action.payload;
        const branchId = bus.branchId;
        if (!state.busesByBranch[branchId]) {
          state.busesByBranch[branchId] = [];
        }
        state.busesByBranch[branchId].push(bus);
      })
      .addCase(updateBus.fulfilled, (state, action) => {
        const bus = action.payload;
        const branchId = bus.branchId;
        if (state.busesByBranch[branchId]) {
          const index = state.busesByBranch[branchId].findIndex((b) => b.id === bus.id);
          if (index !== -1) {
            state.busesByBranch[branchId][index] = bus;
          }
        }
      })
      .addCase(deleteBus.fulfilled, (state, action) => {
        const id = action.payload;
        Object.keys(state.busesByBranch).forEach((branchId) => {
          state.busesByBranch[Number(branchId)] = state.busesByBranch[Number(branchId)].filter((b) => b.id !== id);
        });
      })
      .addCase(getBusLocation.fulfilled, (state, action) => {
        if (action.payload.location) {
          const loc = action.payload.location;
          state.busLocationsById[action.payload.busId] = {
            busId: action.payload.busId,
            latitude: loc.latitude || loc.lat,
            longitude: loc.longitude || loc.lng,
            timestamp: loc.timestamp,
            etaMinutes: loc.etaMinutes,
            lastUpdated: loc.lastUpdated || loc.timestamp,
            raw: loc,
          };
        }
      })
      // Routes
      .addCase(createRoute.fulfilled, (state, action) => {
        const route = action.payload;
        const branchId = route.branchId;
        if (!state.routesByBranch[branchId]) {
          state.routesByBranch[branchId] = [];
        }
        state.routesByBranch[branchId].push(route);
      })
      // Stops
      .addCase(listStops.fulfilled, (state, action) => {
        state.stopsByRoute[action.payload.routeId] = action.payload.stops;
      })
      .addCase(createStop.fulfilled, (state, action) => {
        const stop = action.payload;
        const routeId = stop.routeId;
        if (!state.stopsByRoute[routeId]) {
          state.stopsByRoute[routeId] = [];
        }
        state.stopsByRoute[routeId].push(stop);
      });
  },
});

export const { clearError } = schoolSlice.actions;
export default schoolSlice.reducer;
