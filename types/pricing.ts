// Zone and Vehicle Category common types
export interface Zone {
  id: string;
  name: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  type: string;
}

// Trip Fare types
export interface TripFare {
  id: string;
  zone?: Zone;
  vehicleCategory?: VehicleCategory;
  baseFare: number;
  baseFarePerKm: number;
  timeRatePerMinOverride?: number;
  waitingFeePerMin?: number;
  cancellationFeePercent?: number;
  minCancellationFee?: number;
  idleFeePerMin?: number;
  tripDelayFeePerMin?: number;
  penaltyFeeForCancel?: number;
  feeAddToNext?: number;
  createdAt: string;
  updatedAt: string;
}

// Request payload for creating/updating trip fares
export interface TripFarePayload {
  // Zone identifier (one of)
  zoneId?: string;
  zoneName?: string;
  
  // Vehicle category identifier (one of)
  vehicleCategoryId?: string;
  categoryType?: string;
  categoryName?: string;
  
  // Fare fields
  baseFare: number;
  baseFarePerKm: number;
  timeRatePerMinOverride?: number;
  waitingFeePerMin?: number;
  cancellationFeePercent?: number;
  minCancellationFee?: number;
  idleFeePerMin?: number;
  tripDelayFeePerMin?: number;
  penaltyFeeForCancel?: number;
  feeAddToNext?: number;
}

// Spring Page response type
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}