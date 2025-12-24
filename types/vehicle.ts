/**
 * Vehicle Reference Types
 * Based on backend ServiceType enum and vehicle models
 */

export interface ServiceType {
  id: string; // BIKE, MEGA, CAR, SMALL_SEDAN
  name: string;
  displayName: string;
  description: string;
  icon: string;
  vehicleType: 'two_wheeler' | 'three_wheeler' | 'four_wheeler';
  capacity: number;
  isActive: boolean;
  note?: string;
}

export interface VehicleCategory {
  type: string; // BIKE, MEGA, CAR, SMALL_SEDAN
  name: string;
  description: string;
  serviceTypeId: string;
  vehicleType: 'two_wheeler' | 'three_wheeler' | 'four_wheeler';
}

export interface VehicleBrand {
  name: string;
  categoryTypes: string[]; // Array of service type IDs this brand supports
  isActive: boolean;
}

export interface VehicleModel {
  name: string;
  categoryTypes: string[]; // Array of service type IDs this model supports
}

export interface BrandWithModels {
  brand: string;
  models: VehicleModel[];
}

export interface VehicleReferenceData {
  serviceTypes: ServiceType[];
  vehicleCategories: VehicleCategory[];
  vehicleBrands: VehicleBrand[];
  vehicleModels: BrandWithModels[];
}

/**
 * Get service types by vehicle type
 */
export function getServiceTypesByVehicleType(
  data: VehicleReferenceData,
  vehicleType: 'two_wheeler' | 'three_wheeler' | 'four_wheeler'
): ServiceType[] {
  return data.serviceTypes.filter(st => st.vehicleType === vehicleType && st.isActive);
}

/**
 * Get brands for a specific service type
 */
export function getBrandsForServiceType(
  data: VehicleReferenceData,
  serviceTypeId: string
): VehicleBrand[] {
  return data.vehicleBrands.filter(brand => 
    brand.categoryTypes.includes(serviceTypeId) && brand.isActive
  );
}

/**
 * Get models for a specific brand and service type
 */
export function getModelsForBrandAndServiceType(
  data: VehicleReferenceData,
  brandName: string,
  serviceTypeId: string
): string[] {
  const brandData = data.vehicleModels.find(bm => bm.brand === brandName);
  if (!brandData) return [];
  
  return brandData.models
    .filter(model => model.categoryTypes.includes(serviceTypeId))
    .map(model => model.name);
}

/**
 * Get all models for a service type
 */
export function getAllModelsForServiceType(
  data: VehicleReferenceData,
  serviceTypeId: string
): Array<{ brand: string; model: string }> {
  const result: Array<{ brand: string; model: string }> = [];
  
  data.vehicleModels.forEach(brandData => {
    brandData.models
      .filter(model => model.categoryTypes.includes(serviceTypeId))
      .forEach(model => {
        result.push({ brand: brandData.brand, model: model.name });
      });
  });
  
  return result;
}