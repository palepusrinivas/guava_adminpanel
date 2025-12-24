/**
 * Vehicle Reference Data Utility
 * Provides access to service types, vehicle categories, brands, and models
 */

import type { 
  VehicleReferenceData, 
  ServiceType, 
  VehicleBrand, 
  VehicleCategory,
  BrandWithModels
} from '../types/vehicle';

// Import JSON data - TypeScript will handle this at compile time
// For Next.js, we can import JSON directly if resolveJsonModule is enabled
let data: VehicleReferenceData | null = null;

// Try to import the JSON at module level (works in Node.js/Next.js server-side)
let staticData: VehicleReferenceData | null = null;
try {
  // This will work in Next.js with resolveJsonModule: true
  staticData = require('../data/vehicle-reference.json') as VehicleReferenceData;
} catch (e) {
  // If import fails, data must be loaded dynamically
  console.warn('Could not load vehicle reference data statically. Use loadVehicleReferenceData() or initializeVehicleReferenceData()');
}

// Lazy load the data to avoid SSR issues
function getData(): VehicleReferenceData {
  if (data) {
    return data;
  }
  
  // Try static data if available (server-side)
  if (staticData) {
    return staticData;
  }
  
  // Data must be initialized
  throw new Error('Vehicle reference data not initialized. Call loadVehicleReferenceData() first (client-side) or ensure JSON file is accessible (server-side).');
}

/**
 * Initialize data (call this before using other functions)
 * Or use loadVehicleReferenceData() for async loading
 */
export function initializeVehicleReferenceData(referenceData: VehicleReferenceData): void {
  data = referenceData;
}

/**
 * Load vehicle reference data (async - for client-side)
 * This fetches the JSON from the public folder
 */
export async function loadVehicleReferenceData(): Promise<VehicleReferenceData> {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/data/vehicle-reference.json');
      if (!response.ok) {
        throw new Error(`Failed to load vehicle reference data: ${response.statusText}`);
      }
      const loadedData = await response.json() as VehicleReferenceData;
      if (!loadedData) {
        throw new Error('Vehicle reference data is null or invalid');
      }
      data = loadedData;
      return data;
    } catch (error) {
      console.error('Error loading vehicle reference data:', error);
      throw error;
    }
  }
  // Server-side, try to get from require
  return getData();
}

/**
 * Get all service types
 */
export function getServiceTypes(): ServiceType[] {
  const d = data || getData();
  return d.serviceTypes.filter(st => st.isActive);
}

/**
 * Get service type by ID
 */
export function getServiceTypeById(id: string): ServiceType | undefined {
  const d = data || getData();
  return d.serviceTypes.find(st => st.id === id && st.isActive);
}

/**
 * Get all vehicle categories
 */
export function getVehicleCategories(): VehicleCategory[] {
  const d = data || getData();
  return d.vehicleCategories;
}

/**
 * Get vehicle category by service type
 */
export function getCategoryByServiceType(serviceTypeId: string): VehicleCategory | undefined {
  const d = data || getData();
  return d.vehicleCategories.find(cat => cat.serviceTypeId === serviceTypeId);
}

/**
 * Get all brands
 */
export function getVehicleBrands(): VehicleBrand[] {
  const d = data || getData();
  return d.vehicleBrands.filter(brand => brand.isActive);
}

/**
 * Get brands for a specific service type
 */
export function getBrandsForServiceType(serviceTypeId: string): VehicleBrand[] {
  const d = data || getData();
  return d.vehicleBrands.filter(
    brand => brand.categoryTypes.includes(serviceTypeId) && brand.isActive
  );
}

/**
 * Get models for a specific brand and service type
 */
export function getModelsForBrandAndServiceType(
  brandName: string,
  serviceTypeId: string
): string[] {
  const d = data || getData();
  const brandData = d.vehicleModels.find(bm => bm.brand === brandName);
  if (!brandData) return [];
  
  return brandData.models
    .filter(model => model.categoryTypes.includes(serviceTypeId))
    .map(model => model.name);
}

/**
 * Get all models for a service type (across all brands)
 */
export function getAllModelsForServiceType(
  serviceTypeId: string
): Array<{ brand: string; model: string }> {
  const d = data || getData();
  const result: Array<{ brand: string; model: string }> = [];
  
  d.vehicleModels.forEach(brandData => {
    brandData.models
      .filter(model => model.categoryTypes.includes(serviceTypeId))
      .forEach(model => {
        result.push({ brand: brandData.brand, model: model.name });
      });
  });
  
  return result;
}

/**
 * Get all brands with their models for a service type
 */
export function getBrandsWithModelsForServiceType(
  serviceTypeId: string
): Array<{ brand: string; models: string[] }> {
  const brands = getBrandsForServiceType(serviceTypeId);
  
  return brands.map(brand => ({
    brand: brand.name,
    models: getModelsForBrandAndServiceType(brand.name, serviceTypeId)
  })).filter(item => item.models.length > 0);
}

/**
 * Validate if a service type ID is valid
 */
export function isValidServiceType(serviceTypeId: string): boolean {
  const d = data || getData();
  return d.serviceTypes.some(st => st.id === serviceTypeId && st.isActive);
}

/**
 * Get service type ID from vehicle type
 */
export function getServiceTypesByVehicleType(
  vehicleType: 'two_wheeler' | 'three_wheeler' | 'four_wheeler'
): ServiceType[] {
  const d = data || getData();
  return d.serviceTypes.filter(st => st.vehicleType === vehicleType && st.isActive);
}

/**
 * Get complete vehicle reference data
 */
export function getVehicleReferenceData(): VehicleReferenceData {
  return data || getData();
}

// Export constants for easy access
export const SERVICE_TYPES = {
  BIKE: 'BIKE',
  MEGA: 'MEGA',
  SMALL_SEDAN: 'SMALL_SEDAN',
  CAR: 'CAR'
} as const;

export const VEHICLE_TYPES = {
  TWO_WHEELER: 'two_wheeler',
  THREE_WHEELER: 'three_wheeler',
  FOUR_WHEELER: 'four_wheeler'
} as const;