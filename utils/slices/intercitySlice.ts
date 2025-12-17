import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getIntercityDashboard,
  getIntercityVehicles,
  saveIntercityVehicle,
  deleteIntercityVehicle,
  getIntercityRoutes,
  createIntercityRoute,
  updateIntercityRoute,
  deleteIntercityRoute,
  getIntercityTrips,
  getIntercityTripsByStatus,
  dispatchIntercityTrip,
  cancelIntercityTrip,
  getIntercityBookings,
  getIntercityBookingById,
  cancelIntercityBooking,
  confirmIntercityBooking,
  assignDriverToBooking,
  seedIntercityVehicles,
  getIntercityPricingConfig,
  updateIntercityPricingConfig,
} from "../reducers/intercityReducers";

// Enums matching backend
export type IntercityVehicleType = 
  | "CAR_PREMIUM_EXPRESS" 
  | "CAR_NORMAL" 
  | "AUTO_NORMAL" 
  | "TATA_MAGIC_LITE";

export type IntercityTripStatus = 
  | "SCHEDULED" 
  | "FILLING" 
  | "DISPATCHED" 
  | "IN_TRANSIT" 
  | "COMPLETED" 
  | "CANCELLED";

export type IntercityBookingStatus = 
  | "HOLD"
  | "PENDING" 
  | "CONFIRMED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "REFUNDED";

// Interfaces
export interface IntercityVehicleConfig {
  id?: number;
  vehicleType: IntercityVehicleType;
  displayName: string;
  totalPrice: number;
  maxSeats: number;
  minSeats: number;
  description?: string;
  targetCustomer?: string;
  recommendationTag?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface IntercityRoute {
  id?: number;
  routeCode: string;
  originName: string;
  originLatitude: number;
  originLongitude: number;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  distanceKm: number;
  durationMinutes: number;
  priceMultiplier: number;
  isActive: boolean;
  bidirectional: boolean;
}

export interface IntercityPricingConfig {
  id?: number;
  commissionPercent: number;
  platformFeePercent?: number;
  gstPercent?: number;
  minCommissionAmount?: number;
  maxCommissionAmount?: number;
  nightFareMultiplier: number;
  defaultRoutePriceMultiplier: number;
  commissionEnabled: boolean;
  nightFareEnabled: boolean;
  nightFareStartHour: number;
  nightFareEndHour: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntercityTrip {
  id: number;
  tripId?: number; // For DTO compatibility
  tripCode?: string;
  vehicleType: IntercityVehicleType;
  vehicleDisplayName?: string;
  route?: IntercityRoute;
  routeId?: number;
  routeCode?: string;
  originName?: string;
  destinationName?: string;
  status: IntercityTripStatus;
  scheduledDeparture: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  totalSeats: number;
  bookedSeats: number;
  seatsBooked?: number; // For DTO compatibility
  availableSeats?: number;
  totalPrice?: number;
  currentPerHeadPrice?: number;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  driverRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntercityBooking {
  id: number;
  bookingId?: number;
  tripId: number;
  userId: number;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  seatCount: number;
  seatsBooked?: number;
  pricePerSeat: number;
  perSeatAmount?: number;
  totalAmount: number;
  commissionAmount?: number;
  status: IntercityBookingStatus;
  bookingStatus?: IntercityBookingStatus;
  bookingType?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  pickupPoint?: string;
  dropPoint?: string;
  bookingCode?: string;
  otp?: number;
  otpVerified?: boolean;
  otpVerifiedAt?: string;
  passengersOnboarded?: number;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from backend DTO
  otpVerifiedAt?: string;
  // User details (new structure from backend)
  user?: {
    userId: string; // UUID as String
    name: string;
    email: string;
    phone: string;
  };
  // Trip details
  trip?: {
    tripId: number;
    tripCode?: string;
    vehicleType?: string;
    vehicleDisplayName?: string;
    tripStatus?: string;
    pickupAddress?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    dropAddress?: string;
    dropLatitude?: number;
    dropLongitude?: number;
    scheduledDeparture?: string;
    totalSeats?: number;
    seatsBooked?: number;
    availableSeats?: number;
    minSeats?: number;
    minSeatsMet?: boolean;
    totalPrice?: number;
    currentPerHeadPrice?: number;
    driver?: {
      driverId?: number;
      name?: string;
      phone?: string;
      vehicleNumber?: string;
      vehicleModel?: string;
      rating?: number;
      totalTrips?: number;
    };
    route?: {
      routeId?: number;
      routeCode?: string;
      originName?: string;
      destinationName?: string;
      distanceKm?: number;
      estimatedDurationMinutes?: number;
    };
  };
  // Seat details
  seats?: Array<{
    seatNumber: number;
    status: string;
    pricePaid: number;
    passengerName: string;
    passengerPhone: string;
  }>;
}

export interface IntercityDashboardStats {
  bookingsByStatus: Record<string, number>;
  tripsByStatus: Record<string, number>;
  activeVehicleTypes: number;
  activeRoutes: number;
}

// Pagination
export interface PageInfo {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// State Interface
interface IntercityState {
  dashboard: IntercityDashboardStats | null;
  vehicles: IntercityVehicleConfig[];
  routes: IntercityRoute[];
  trips: IntercityTrip[];
  tripsPage: PageInfo | null;
  bookings: IntercityBooking[];
  bookingsPage: PageInfo | null;
  selectedBooking: IntercityBooking | null;
  pricingConfig: IntercityPricingConfig | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: IntercityState = {
  dashboard: null,
  vehicles: [],
  routes: [],
  trips: [],
  tripsPage: null,
  bookings: [],
  bookingsPage: null,
  selectedBooking: null,
  pricingConfig: null,
  isLoading: false,
  error: null,
};

// Intercity Slice
const intercitySlice = createSlice({
  name: "intercity",
  initialState,
  reducers: {
    clearIntercityError: (state) => {
      state.error = null;
    },
    setSelectedBooking: (state, action: PayloadAction<IntercityBooking | null>) => {
      state.selectedBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(getIntercityDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
        state.error = null;
      })
      .addCase(getIntercityDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Vehicles
    builder
      .addCase(getIntercityVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload;
        state.error = null;
      })
      .addCase(getIntercityVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(saveIntercityVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveIntercityVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        } else {
          state.vehicles.push(action.payload);
        }
        state.error = null;
      })
      .addCase(saveIntercityVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteIntercityVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIntercityVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteIntercityVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(seedIntercityVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(seedIntercityVehicles.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(seedIntercityVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Routes
    builder
      .addCase(getIntercityRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = action.payload;
        state.error = null;
      })
      .addCase(getIntercityRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createIntercityRoute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIntercityRoute.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes.push(action.payload);
        state.error = null;
      })
      .addCase(createIntercityRoute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateIntercityRoute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIntercityRoute.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.routes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.routes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateIntercityRoute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteIntercityRoute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIntercityRoute.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = state.routes.filter(r => r.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteIntercityRoute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Trips
    builder
      .addCase(getIntercityTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload.content || action.payload;
        if (action.payload.totalPages !== undefined) {
          state.tripsPage = {
            totalPages: action.payload.totalPages,
            totalElements: action.payload.totalElements,
            size: action.payload.size,
            number: action.payload.number,
          };
        }
        state.error = null;
      })
      .addCase(getIntercityTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getIntercityTripsByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityTripsByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
        state.error = null;
      })
      .addCase(getIntercityTripsByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(dispatchIntercityTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(dispatchIntercityTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const tripId = parseInt(action.payload.tripId);
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index !== -1) {
          state.trips[index].status = "DISPATCHED";
        }
        state.error = null;
      })
      .addCase(dispatchIntercityTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(cancelIntercityTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelIntercityTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const tripId = parseInt(action.payload.tripId);
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index !== -1) {
          state.trips[index].status = "CANCELLED";
        }
        state.error = null;
      })
      .addCase(cancelIntercityTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bookings
    builder
      .addCase(getIntercityBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.content || action.payload;
        if (action.payload.totalPages !== undefined) {
          state.bookingsPage = {
            totalPages: action.payload.totalPages,
            totalElements: action.payload.totalElements,
            size: action.payload.size,
            number: action.payload.number,
          };
        }
        state.error = null;
      })
      .addCase(getIntercityBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getIntercityBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
        state.error = null;
      })
      .addCase(getIntercityBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(cancelIntercityBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelIntercityBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelIntercityBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(confirmIntercityBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmIntercityBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(confirmIntercityBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(assignDriverToBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignDriverToBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(assignDriverToBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pricing Configuration
    builder
      .addCase(getIntercityPricingConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIntercityPricingConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pricingConfig = action.payload;
        state.error = null;
      })
      .addCase(getIntercityPricingConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateIntercityPricingConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIntercityPricingConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pricingConfig = action.payload;
        state.error = null;
      })
      .addCase(updateIntercityPricingConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearIntercityError, setSelectedBooking } = intercitySlice.actions;
export default intercitySlice.reducer;

