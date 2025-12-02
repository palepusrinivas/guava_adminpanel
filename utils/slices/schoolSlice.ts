import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminAxios from "../axiosConfig";
import {
  schoolSubscriptionPlansUrl,
  schoolSubscriptionPlanByIdUrl,
} from "../apiRoutes";

export interface SchoolSubscriptionPlan {
  id: number;
  name: string;
  amount: number;
  durationDays: number;
  description: string;
  isActive: boolean;
}

interface SchoolState {
  plans: SchoolSubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SchoolState = {
  plans: [],
  isLoading: false,
  error: null,
};

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

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Plans
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
      // Create Plan
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })
      // Update Plan
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex((plan) => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      // Delete Plan
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      });
  },
});

export default schoolSlice.reducer;
