# New API Endpoints Added

## Summary
Added new pricing endpoints to match the backend API structure from `admin-pricing-controller`.

## New Endpoints Added

### Pricing Zones
- **GET** `/api/admin/pricing/zones` - List all pricing zones
- **POST** `/api/admin/pricing/zones` - Create a new pricing zone

### Pricing Zone Rules
- **GET** `/api/admin/pricing/zones/{zoneId}/rules` - Get rules for a specific zone
- **POST** `/api/admin/pricing/zones/{zoneId}/rules` - Create rules for a zone

### Pricing Profiles
- **GET** `/api/admin/pricing/profiles` - List all pricing profiles
- **POST** `/api/admin/pricing/profiles` - Create a new pricing profile

### Service Rates
- **GET** `/api/admin/pricing/profiles/{profileId}/service-rates` - Get service rates for a profile
- **POST** `/api/admin/pricing/profiles/{profileId}/service-rates` - Create service rates for a profile

### Profile Activation
- **POST** `/api/admin/pricing/profiles/{id}/activate` - Activate a pricing profile

## Configuration

These endpoints are now configured in `utils/config.ts`:
```typescript
PRICING: "/api/v1/admin/pricing",
PRICING_ZONES: "/api/admin/pricing/zones",
PRICING_ZONES_RULES: "/api/admin/pricing/zones/:zoneId/rules",
PRICING_PROFILES: "/api/admin/pricing/profiles",
PRICING_PROFILES_SERVICE_RATES: "/api/admin/pricing/profiles/:profileId/service-rates",
PRICING_PROFILES_ACTIVATE: "/api/admin/pricing/profiles/:id/activate",
```

## Existing Endpoints

The following endpoints were already configured and remain unchanged:
- `USERS` - `/api/admin/users`
- `USER_BY_ID` - `/api/admin/users/:id`
- `ZONES` - `/api/admin/zones`
- `ZONE_BY_ID` - `/api/admin/zones/:id`

## Usage

To use these endpoints in your components, import from `utils/apiRoutes.ts` after adding the corresponding route exports, or use directly:

```typescript
import { config } from '@/utils/config';
import adminAxios from '@/utils/axiosConfig';

// Example: Get all pricing zones
const getPricingZones = async () => {
  const response = await adminAxios.get(config.ENDPOINTS.ADMIN.PRICING_ZONES);
  return response.data;
};

// Example: Create a pricing profile
const createPricingProfile = async (profileData: any) => {
  const response = await adminAxios.post(
    config.ENDPOINTS.ADMIN.PRICING_PROFILES,
    profileData
  );
  return response.data;
};

// Example: Get rules for a zone
const getZoneRules = async (zoneId: string) => {
  const endpoint = config.ENDPOINTS.ADMIN.PRICING_ZONES_RULES.replace(':zoneId', zoneId);
  const response = await adminAxios.get(endpoint);
  return response.data;
};
```

## Next Steps

1. **Add route exports** in `utils/apiRoutes.ts` for these new endpoints
2. **Create Redux actions** in `utils/reducers/adminReducers.ts` if needed
3. **Update UI components** to use these new endpoints for pricing management

## Files Modified
- ✅ `utils/config.ts` - Added new pricing endpoint constants

