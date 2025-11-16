import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminAxios from "@/utils/axiosConfig";

export interface Institution {
  id: number;
  name: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  email?: string;
  gstNumber?: string;
  createdAt?: string;
}

export interface Branch {
  id: number;
  institution: Institution | number;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  subscriptionPlan?: string;
  createdAt?: string;
}

export interface Bus {
  id: number;
  branch: Branch | number;
  busNumber: string;
  capacity?: number;
  type?: string;
  rcExpiry?: string;
  insuranceExpiry?: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface Route {
  id: number;
  branch: Branch | number;
  name?: string;
  isMorning?: boolean;
  createdAt?: string;
}

export interface Stop {
  id: number;
  route: Route | number;
  name?: string;
  latitude?: number;
  longitude?: number;
  stopOrder?: number;
  etaMinutesFromPrev?: number;
  createdAt?: string;
}

export interface BusLocation {
  busId: number;
  latitude?: number;
  longitude?: number;
  etaMinutes?: number;
  lastUpdated?: number;
  raw?: any;
}

type CreateInstitutionPayload = Omit<Institution, "id" | "createdAt"> & { name: string };
type CreateBranchPayload = Omit<Branch, "id" | "createdAt" | "institution"> & { institutionId: number };
type CreateBusPayload = {
  branchId: number;
  busNumber: string;
  capacity?: number;
  type?: string;
  rcExpiry?: string;
  insuranceExpiry?: string;
  photoUrl?: string;
};
type CreateRoutePayload = { branchId: number; name: string; isMorning?: boolean };
type CreateStopPayload = { routeId: number; name: string; latitude?: number; longitude?: number; stopOrder?: number; etaMinutesFromPrev?: number };

export const createInstitution = createAsyncThunk<Institution, CreateInstitutionPayload>(
  "school/createInstitution",
  async (payload) => {
    const { data } = await adminAxios.post("/api/v1/institutions", payload);
    return data;
  }
);

export const getInstitution = createAsyncThunk<Institution, number>(
  "school/getInstitution",
  async (id) => {
    const { data } = await adminAxios.get(`/api/v1/institutions/${id}`);
    return data;
  }
);

export const listInstitutions = createAsyncThunk<Institution[]>(
  "school/listInstitutions",
  async () => {
    const { data } = await adminAxios.get(`/api/v1/institutions/institutes`);
    return data;
  }
);

export const getInstitutionByUniqueId = createAsyncThunk<Institution, string>(
  "school/getInstitutionByUniqueId",
  async (uniqueId) => {
    const { data } = await adminAxios.get(`/api/v1/institutions/${uniqueId}`);
    return data;
  }
);

export const updateInstitution = createAsyncThunk<Institution, { id: number; updates: Partial<Institution> }>(
  "school/updateInstitution",
  async ({ id, updates }) => {
    const { data } = await adminAxios.put(`/api/v1/institutions/${id}`, updates);
    return data;
  }
);

export const deleteInstitution = createAsyncThunk<number, number>(
  "school/deleteInstitution",
  async (id) => {
    await adminAxios.delete(`/api/v1/institutions/${id}`);
    return id;
  }
);

export const listBranches = createAsyncThunk<Branch[], number>(
  "school/listBranches",
  async (institutionId) => {
    const { data } = await adminAxios.get(`/api/v1/institutions/${institutionId}/branches`);
    return data;
  }
);

export const listAllBranches = createAsyncThunk<Branch[]>(
  "school/listAllBranches",
  async () => {
    const { data } = await adminAxios.get(`/api/v1/branches`);
    return data;
  }
);

export const createBranch = createAsyncThunk<Branch, CreateBranchPayload>(
  "school/createBranch",
  async ({ institutionId, ...payload }) => {
    const { data } = await adminAxios.post(`/api/v1/institutions/${institutionId}/branches`, payload);
    return data;
  }
);

export const updateBranch = createAsyncThunk<Branch, { id: number; updates: Partial<Branch> }>(
  "school/updateBranch",
  async ({ id, updates }) => {
    const { data } = await adminAxios.put(`/api/v1/branches/${id}`, updates);
    return data;
  }
);

export const deleteBranch = createAsyncThunk<number, number>(
  "school/deleteBranch",
  async (id) => {
    await adminAxios.delete(`/api/v1/branches/${id}`);
    return id;
  }
);

export const listBuses = createAsyncThunk<Bus[], number>(
  "school/listBuses",
  async (branchId) => {
    const { data } = await adminAxios.get(`/api/v1/branches/${branchId}/buses`);
    return data;
  }
);

export const createBus = createAsyncThunk<Bus, CreateBusPayload>(
  "school/createBus",
  async ({ branchId, ...payload }) => {
    const { data } = await adminAxios.post(`/api/v1/branches/${branchId}/buses`, payload);
    return data;
  }
);

export const updateBus = createAsyncThunk<Bus, { id: number; updates: Partial<Bus> }>(
  "school/updateBus",
  async ({ id, updates }) => {
    const { data } = await adminAxios.put(`/api/v1/buses/${id}`, updates);
    return data;
  }
);

export const deleteBus = createAsyncThunk<number, number>(
  "school/deleteBus",
  async (id) => {
    await adminAxios.delete(`/api/v1/buses/${id}`);
    return id;
  }
);

export const createRoute = createAsyncThunk<Route, CreateRoutePayload>(
  "school/createRoute",
  async ({ branchId, ...payload }) => {
    const { data } = await adminAxios.post(`/api/v1/branches/${branchId}/routes`, payload);
    return data;
  }
);

export const listStops = createAsyncThunk<Stop[], number>(
  "school/listStops",
  async (routeId) => {
    const { data } = await adminAxios.get(`/api/v1/routes/${routeId}/stops`);
    return data;
  }
);

export const createStop = createAsyncThunk<Stop, CreateStopPayload>(
  "school/createStop",
  async ({ routeId, ...payload }) => {
    const { data } = await adminAxios.post(`/api/v1/routes/${routeId}/stops`, payload);
    return data;
  }
);

export const getBusLocation = createAsyncThunk<BusLocation, number>(
  "school/getBusLocation",
  async (busId) => {
    const { data } = await adminAxios.get(`/api/v1/buses/${busId}/location`);
    const latitude = data?.lat ?? data?.latitude;
    const longitude = data?.lng ?? data?.longitude;
    const etaMinutes = data?.etaMinutes ?? data?.eta_minutes ?? undefined;
    return {
      busId,
      latitude,
      longitude,
      etaMinutes,
      lastUpdated: Date.now(),
      raw: data,
    };
  }
);

interface SchoolState {
  institutionsById: Record<number, Institution>;
  institutions: Institution[];
  branchesByInstitution: Record<number, Branch[]>;
  branchesAll: Branch[];
  busesByBranch: Record<number, Bus[]>;
  routesByBranch: Record<number, Route[]>;
  stopsByRoute: Record<number, Stop[]>;
  busLocationsById: Record<number, BusLocation>;
  isLoading: boolean;
  error?: string;
}

const initialState: SchoolState = {
  institutionsById: {},
  institutions: [],
  branchesByInstitution: {},
  branchesAll: [],
  busesByBranch: {},
  routesByBranch: {},
  stopsByRoute: {},
  busLocationsById: {},
  isLoading: false,
};

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInstitution.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutionsById[action.payload.id] = action.payload;
      })
      .addCase(createInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getInstitution.fulfilled, (state, action) => {
        state.institutionsById[action.payload.id] = action.payload;
      })
      .addCase(listInstitutions.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(listInstitutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutions = action.payload;
        for (const inst of action.payload) {
          state.institutionsById[inst.id] = inst;
        }
      })
      .addCase(listInstitutions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getInstitutionByUniqueId.fulfilled, (state, action) => {
        // place/update in map and list to show immediately
        state.institutionsById[action.payload.id] = action.payload;
        const exists = state.institutions.find((i) => i.id === action.payload.id);
        if (!exists) state.institutions = [action.payload, ...state.institutions];
      })
      .addCase(updateInstitution.fulfilled, (state, action) => {
        state.institutionsById[action.payload.id] = action.payload;
        state.institutions = state.institutions.map((i) => (i.id === action.payload.id ? action.payload : i));
      })
      .addCase(deleteInstitution.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.institutionsById[id];
        state.institutions = state.institutions.filter((i) => i.id !== id);
      })
      .addCase(listBranches.fulfilled, (state, action) => {
        const institutionId = action.meta.arg;
        state.branchesByInstitution[institutionId] = action.payload;
      })
      .addCase(listAllBranches.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(listAllBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branchesAll = action.payload;
      })
      .addCase(listAllBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        const institutionId =
          typeof action.payload.institution === "number" ? action.payload.institution : action.payload.institution.id;
        const list = state.branchesByInstitution[institutionId] || [];
        state.branchesByInstitution[institutionId] = [action.payload, ...list];
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        // Update across all institutions lists as we don't know which one is active
        Object.keys(state.branchesByInstitution).forEach((k) => {
          const bid = Number(k);
          state.branchesByInstitution[bid] = (state.branchesByInstitution[bid] || []).map((b) =>
            b.id === action.payload.id ? action.payload : b
          );
        });
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        const id = action.payload;
        Object.keys(state.branchesByInstitution).forEach((k) => {
          const bid = Number(k);
          state.branchesByInstitution[bid] = (state.branchesByInstitution[bid] || []).filter((b) => b.id !== id);
        });
      })
      .addCase(listBuses.fulfilled, (state, action) => {
        const branchId = action.meta.arg;
        state.busesByBranch[branchId] = action.payload;
      })
      .addCase(createBus.fulfilled, (state, action) => {
        const branchId = typeof action.payload.branch === "number" ? action.payload.branch : action.payload.branch.id;
        const list = state.busesByBranch[branchId] || [];
        state.busesByBranch[branchId] = [action.payload, ...list];
      })
      .addCase(updateBus.fulfilled, (state, action) => {
        const branchId = typeof action.payload.branch === "number" ? action.payload.branch : action.payload.branch.id;
        state.busesByBranch[branchId] = (state.busesByBranch[branchId] || []).map((b) =>
          b.id === action.payload.id ? action.payload : b
        );
      })
      .addCase(deleteBus.fulfilled, (state, action) => {
        const id = action.payload;
        Object.keys(state.busesByBranch).forEach((k) => {
          const bid = Number(k);
          state.busesByBranch[bid] = (state.busesByBranch[bid] || []).filter((b) => b.id !== id);
        });
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        const branchId = typeof action.payload.branch === "number" ? action.payload.branch : action.payload.branch.id;
        const list = state.routesByBranch[branchId] || [];
        state.routesByBranch[branchId] = [action.payload, ...list];
      })
      .addCase(listStops.fulfilled, (state, action) => {
        const routeId = action.meta.arg;
        state.stopsByRoute[routeId] = action.payload;
      })
      .addCase(createStop.fulfilled, (state, action) => {
        const routeId = typeof action.payload.route === "number" ? action.payload.route : action.payload.route.id;
        const list = state.stopsByRoute[routeId] || [];
        state.stopsByRoute[routeId] = [action.payload, ...list];
      })
      .addCase(getBusLocation.fulfilled, (state, action) => {
        state.busLocationsById[action.payload.busId] = action.payload;
      });
  },
});

export default schoolSlice.reducer;


