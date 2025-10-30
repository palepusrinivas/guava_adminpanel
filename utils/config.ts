// Application Configuration
export const config = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  LOCATIONIQ_API_KEY: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || "pk.1dca78a113a7c45533e83e6c9f2196ae",
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA4l8wJ5bYRj_iPcaWF1TTuPt5KVDGMFpo", // Temporary hardcoded key
  
  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "RideFast",
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A Ride Sharing Application similar to that of Rapido or Ola where a customer can book their ride conveniently",
  
  // Feature Flags
  ENABLE_LOCATION_SERVICES: true,
  ENABLE_PAYMENT_INTEGRATION: true,
  ENABLE_REAL_TIME_TRACKING: true,
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',  // Controls analytics feature availability
  
  // Default Values
  DEFAULT_RIDE_TIMEOUT: 300000, // 5 minutes in milliseconds
  MAX_RIDE_DISTANCE: 100, // km
  MIN_RIDE_DISTANCE: 0.5, // km
  
  // UI Configuration
  THEME: {
    PRIMARY_COLOR: "#120e43e3",
    SECONDARY_COLOR: "#120E43",
    SUCCESS_COLOR: "#10B981",
    ERROR_COLOR: "#EF4444",
    WARNING_COLOR: "#F59E0B",
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER_USER: "/api/v1/auth/register/user",
      REGISTER_DRIVER: "/api/v1/auth/register/driver",
      LOGIN: "/api/v1/auth/login",
      USER_PROFILE: "/api/v1/user/profile",
      DRIVER_PROFILE: "/api/v1/driver/profile",
    },
    RIDE: {
      REQUEST: "/api/v1/ride/request",
      START: "/api/v1/ride/:id/start",
      ACCEPT: "/api/v1/ride/:id/accept",
      COMPLETE: "/api/v1/ride/:id/complete",
      GET_BY_ID: "/api/v1/ride/:id",
    },
    USER: {
      COMPLETED_RIDES: "/api/v1/user/rides/completed",
      CURRENT_RIDES: "/api/v1/user/id/rides/current",
      REQUESTED_RIDES: "/api/v1/user/id/rides/requested",
    },
    ADMIN: {
      LOGIN: "/api/v1/admin/login",
      PRICING: "/api/v1/admin/pricing",
      USERS: "/api/admin/users",
      USER_BY_ID: "/api/admin/users/:id",
      DRIVERS: "/api/admin/drivers",
      DRIVER_BY_ID: "/api/admin/drivers/:id",
      DRIVER_KYC: "/api/admin/kyc/drivers/:id",
      DRIVER_KYC_FILE: "/api/admin/kyc/drivers/:id/files/:name",
      DRIVER_KYC_DOWNLOAD: "/api/admin/kyc/drivers/:id/files/:name/download",
      WALLET_CREDIT_USER: "/api/admin/wallet/credit/user/:id",
      WALLET_CREDIT_DRIVER: "/api/admin/wallet/credit/driver/:id",
      ZONES: "/api/admin/zones",
      ZONE_BY_ID: "/api/admin/zones/:id",
      FLEET_LOCATIONS: "/api/admin/fleet/locations",
      // Analytics endpoints - Note: These endpoints may return 501 if analytics are not enabled
  ANALYTICS_HEATMAP: "/api/admin/analytics/heatmap", // Accepts from and to date params
  ANALYTICS_STATS: "/api/admin/analytics/stats",
  ANALYTICS_SUMMARY: "/api/admin/analytics/summary",
  RECENT_ACTIVITIES: "/api/admin/activities/recent",
  RECENT_TRANSACTIONS: "/api/admin/analytics/recent-transactions", // Accepts limit param
  RECENT_TRIPS: "/api/admin/analytics/recent-trips", // Accepts limit param
  // Pricing endpoints for admin trip fares. These endpoints are used to list, create, and delete
  // trip-fare records. Example usages:
  // GET  /api/admin/pricing/trip-fares?page=0&size=0
  // POST /api/admin/pricing/trip-fares  (JSON body - see README or API docs)
  // DELETE /api/admin/pricing/trip-fares?id=string
  TRIP_FARES: "/api/admin/pricing/trip-fares",
  DASHBOARD_STATS: "/api/admin/dashboard/stats",
  LEADERBOARD: "/api/admin/dashboard/leaderboard",
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to get LocationIQ API URL
export const getLocationIqUrl = (query: string, limit: number = 5): string => {
  return `https://us1.locationiq.com/v1/autocomplete.php?limit=${limit}&key=${config.LOCATIONIQ_API_KEY}&q=${query}`;
};

