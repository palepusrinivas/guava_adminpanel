# Vehicle Reference Data

This directory contains reference data for service types, vehicle categories, brands, and models.

## Files

- `vehicle-reference.json` - Complete reference data for:
  - Service Types (BIKE, MEGA, CAR, SMALL_SEDAN)
  - Vehicle Categories
  - Vehicle Brands (Hero, Honda, Bajaj, Maruti Suzuki, etc.)
  - Vehicle Models organized by brand

## Usage

Import the utility functions from `utils/vehicleReference.ts`:

```typescript
import { 
  getServiceTypes, 
  getBrandsForServiceType, 
  getModelsForBrandAndServiceType 
} from '@/utils/vehicleReference';

// Get all active service types
const serviceTypes = getServiceTypes();

// Get brands for BIKE service type
const bikeBrands = getBrandsForServiceType('BIKE');

// Get models for Hero brand and BIKE service type
const heroBikeModels = getModelsForBrandAndServiceType('Hero', 'BIKE');
```

## Data Structure

The JSON file follows this structure:

```json
{
  "serviceTypes": [...],        // Service types (BIKE, MEGA, etc.)
  "vehicleCategories": [...],   // Categories linked to service types
  "vehicleBrands": [...],       // Brand names with supported categories
  "vehicleModels": [...]        // Models organized by brand
}
```

## Adding New Data

To add new brands or models, edit `vehicle-reference.json` and ensure:
1. Brand names are added to `vehicleBrands` array
2. Models are added to the appropriate brand in `vehicleModels` array
3. `categoryTypes` arrays correctly map to service type IDs

## Notes

- Service type IDs must match backend `ServiceType` enum (BIKE, MEGA, CAR, SMALL_SEDAN)
- Vehicle types must be: `two_wheeler`, `three_wheeler`, or `four_wheeler`
- All data is currently focused on Indian vehicle market