import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getEmployeeRoles,
  getEmployeeRoleById,
  createEmployeeRole,
  updateEmployeeRole,
  deleteEmployeeRole,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../reducers/adminReducers";

export interface EmployeeRole {
  id: string | number;
  roleName: string;
  modules: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string | number;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  employeeImage?: string;
  identityType?: string;
  identityNumber?: string;
  identityImage?: string;
  employeeRole?: string;
  employeeRoleId?: string | number;
  employeePosition?: string;
  moduleAccess?: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeState {
  roles: EmployeeRole[];
  selectedRole: EmployeeRole | null;
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
  roleFilter: "all" | "active" | "inactive";
  roleSearchQuery: string;
  employeeFilter: "all" | "active" | "inactive";
  employeeSearchQuery: string;
}

const initialState: EmployeeState = {
  roles: [],
  selectedRole: null,
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
  roleFilter: "all",
  roleSearchQuery: "",
  employeeFilter: "all",
  employeeSearchQuery: "",
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    setRoleFilter: (state, action: PayloadAction<EmployeeState["roleFilter"]>) => {
      state.roleFilter = action.payload;
    },
    setRoleSearchQuery: (state, action: PayloadAction<string>) => {
      state.roleSearchQuery = action.payload;
    },
    setEmployeeFilter: (state, action: PayloadAction<EmployeeState["employeeFilter"]>) => {
      state.employeeFilter = action.payload;
    },
    setEmployeeSearchQuery: (state, action: PayloadAction<string>) => {
      state.employeeSearchQuery = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<EmployeeRole | null>) => {
      state.selectedRole = action.payload;
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Employee Roles
      .addCase(getEmployeeRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload || [];
      })
      .addCase(getEmployeeRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getEmployeeRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload || null;
      })
      .addCase(getEmployeeRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmployeeRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmployeeRole.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.roles.unshift(action.payload);
      })
      .addCase(createEmployeeRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEmployeeRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmployeeRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.roles.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.roles[idx] = action.payload;
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateEmployeeRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteEmployeeRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployeeRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter((r) => r.id.toString() !== action.payload);
      })
      .addCase(deleteEmployeeRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Employees
      .addCase(getEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload || [];
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getEmployeeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEmployee = action.payload || null;
      })
      .addCase(getEmployeeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.employees.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.employees.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
        if (state.selectedEmployee?.id === action.payload.id) {
          state.selectedEmployee = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = state.employees.filter((e) => e.id.toString() !== action.payload);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearEmployeeError,
  setRoleFilter,
  setRoleSearchQuery,
  setEmployeeFilter,
  setEmployeeSearchQuery,
  setSelectedRole,
  setSelectedEmployee,
} = employeeSlice.actions;
export default employeeSlice.reducer;

