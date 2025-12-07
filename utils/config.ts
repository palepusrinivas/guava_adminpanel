// Application Configuration
export const config = {
  // API Configuration
  //API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net",
  // Uncomment below for local development:
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  LOCATIONIQ_API_KEY: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || "pk.1dca78a113a7c45533e83e6c9f2196ae",
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA4l8wJ5bYRj_iPcaWF1TTuPt5KVDGMFpo", // Temporary hardcoded key

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Gauva",
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
    SUPERADMIN: {
      ADMINS: "/api/superadmin/admins",
      API_KEYS: "/api/superadmin/keys",
    },
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
      // New pricing endpoints
      PRICING_ZONES: "/api/admin/pricing/zones",
      PRICING_ZONES_RULES: "/api/admin/pricing/zones/:zoneId/rules",
      PRICING_PROFILES: "/api/admin/pricing/profiles",
      PRICING_PROFILES_SERVICE_RATES: "/api/admin/pricing/profiles/:profileId/service-rates",
      PRICING_PROFILES_ACTIVATE: "/api/admin/pricing/profiles/:id/activate",
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
      TRIPS: "/api/admin/trip/list/all",
      TRIP_BY_ID: "/api/admin/trip/:id",
      BANNERS: "/api/admin/banners",
      BANNER_BY_ID: "/api/admin/banners/:id",
      SERVICES: "/api/admin/services",
      SERVICE_BY_ID: "/api/admin/services/:id",
      SERVICES_STATS: "/api/admin/services/stats",
      SERVICES_SEED: "/api/admin/services/seed-defaults",
      COUPONS: "/api/admin/coupons",
      COUPON_BY_ID: "/api/admin/coupons/:id",
      DISCOUNTS: "/api/admin/discounts",
      DISCOUNT_BY_ID: "/api/admin/discounts/:id",
      DRIVER_LEVELS: "/api/admin/driver-levels",
      DRIVER_LEVEL_BY_ID: "/api/admin/driver-levels/:id",
      WITHDRAW_METHODS: "/api/admin/driver/withdraw-method",
      WITHDRAW_METHOD_BY_ID: "/api/admin/driver/withdraw-method/:id",
      WITHDRAW_REQUESTS: "/api/admin/driver/withdraw/requests",
      WITHDRAW_REQUEST_BY_ID: "/api/admin/driver/withdraw/requests/:id",
      EMPLOYEE_ROLES: "/api/admin/employee/role",
      EMPLOYEE_ROLE_BY_ID: "/api/admin/employee/role/:id",
      EMPLOYEES: "/api/admin/employee",
      EMPLOYEE_BY_ID: "/api/admin/employee/:id",
      CUSTOMERS: "/api/admin/customer",
      CUSTOMER_BY_ID: "/api/admin/customer/:id",
      CUSTOMER_WALLET_ADD_FUND: "/api/admin/customer/wallet/add-fund",
      CUSTOMER_WALLET_TRANSACTIONS: "/api/admin/customer/wallet/transactions",
      PARCEL_CATEGORIES: "/api/admin/parcel/attribute/category",
      PARCEL_CATEGORY_BY_ID: "/api/admin/parcel/attribute/category/:id",
      PARCEL_WEIGHTS: "/api/admin/parcel/attribute/weight",
      PARCEL_WEIGHT_BY_ID: "/api/admin/parcel/attribute/weight/:id",
      VEHICLE_BRANDS: "/api/admin/vehicle/attribute-setup/brand",
      VEHICLE_BRAND_BY_ID: "/api/admin/vehicle/attribute-setup/brand/:id",
      VEHICLE_MODELS: "/api/admin/vehicle/attribute-setup/model",
      VEHICLE_MODEL_BY_ID: "/api/admin/vehicle/attribute-setup/model/:id",
      VEHICLE_CATEGORIES: "/api/admin/vehicle/attribute-setup/category",
      VEHICLE_CATEGORY_BY_ID: "/api/admin/vehicle/attribute-setup/category/:id",
      VEHICLES: "/api/admin/vehicle",
      VEHICLE_BY_ID: "/api/admin/vehicle/:id",
      VEHICLE_REQUESTS: "/api/admin/vehicle/request",
      VEHICLE_REQUEST_BY_ID: "/api/admin/vehicle/request/:id",
      VEHICLE_UPDATE_REQUESTS: "/api/admin/vehicle/update",
      VEHICLE_UPDATE_REQUEST_BY_ID: "/api/admin/vehicle/update/:id",
      TRIP_FARE_SETUP: "/api/admin/fare/trip",
      TRIP_FARE_SETUP_BY_ZONE: "/api/admin/fare/trip/:zoneId",
      PARCEL_FARE_SETUP: "/api/admin/fare/parcel",
      PARCEL_FARE_SETUP_BY_ZONE: "/api/admin/fare/parcel/:zoneId",
      OPERATION_ZONES: "/api/admin/zones/operation",
      OPERATION_ZONE_BY_ID: "/api/admin/zones/operation/:id",
      TRANSACTIONS: "/api/admin/transactions",
      TRANSACTION_BY_ID: "/api/admin/transactions/:id",
      EARNING_REPORTS: "/api/admin/report/earning",
      EXPENSE_REPORTS: "/api/admin/report/expense",
      ZONE_WISE_STATISTICS: "/api/admin/report/zone-wise",
      TRIP_WISE_EARNING: "/api/admin/report/trip-wise",
      CHATTING_DRIVERS: "/api/admin/chatting/drivers",
      CHATTING_MESSAGES: "/api/admin/chatting/messages",
      CHATTING_SEND_MESSAGE: "/api/admin/chatting/send",
      BUSINESS_INFO: "/api/admin/business/info",
      BUSINESS_DRIVER_SETTINGS: "/api/admin/business/driver",
      BUSINESS_CUSTOMER_SETTINGS: "/api/admin/business/customer",
      BUSINESS_FARE_PENALTY: "/api/admin/business/fare-penalty",
      BUSINESS_TRIPS_SETTINGS: "/api/admin/business/trips",
      BUSINESS_SETTINGS: "/api/admin/business/settings",
      BUSINESS_PARCEL_SETTINGS: "/api/admin/business/parcel",
      BUSINESS_REFUND_SETTINGS: "/api/admin/business/refund",
      BUSINESS_SAFETY_SETTINGS: "/api/admin/business/safety",
      BUSINESS_REFERRAL_SETTINGS: "/api/admin/business/referral",
      BUSINESS_CHATTING_SETUP: "/api/admin/business/chatting-setup",
      BUSINESS_PAGES: "/api/admin/business/pages",
      LANDING_PAGE_SETUP: "/api/admin/business/landing-page",
      SOCIAL_MEDIA_LINKS: "/api/admin/business/social-media",
      NOTIFICATION_REGULAR_TRIP: "/api/admin/business/configuration/notification/regular-trip",
      NOTIFICATION_PARCEL: "/api/admin/business/configuration/notification/parcel",
      NOTIFICATION_DRIVER_REGISTRATION: "/api/admin/business/configuration/notification/driver-registration",
      NOTIFICATION_OTHER: "/api/admin/business/configuration/notification/other",
      FIREBASE_CONFIGURATION: "/api/admin/business/configuration/firebase",
      THIRD_PARTY_CONFIGURATION: "/api/admin/business/configuration/third-party",
      // Analytics endpoints - Note: These endpoints may return 501 if analytics are not enabled
      ANALYTICS_HEATMAP: "/api/admin/analytics/heatmap", // Accepts from and to date params
      // Backend-supported analytics endpoints:
      ANALYTICS_KPIS: "/api/admin/analytics/kpis",
      ANALYTICS_ZONES: "/api/admin/analytics/zones",
      // Legacy keys kept for compatibility in code; prefer using KPIS and ZONES above
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
      // Driver access rules
      DRIVER_ACCESS_CONFIGS: "/api/admin/driver-access/configurations",
      DRIVER_ACCESS_CONFIG_BY_VEHICLE: "/api/admin/driver-access/configurations/:vehicleType",
      DRIVER_ACCESS_PROCESS_DAILY_FEES: "/api/admin/driver-access/process-daily-fees",
      // API Keys management
      API_KEYS: "/api/admin/api-keys",
      API_KEYS_STATUS: "/api/admin/api-keys/status",
      API_KEY_BY_NAME: "/api/admin/api-keys/:name",
      API_KEYS_BULK: "/api/admin/api-keys/bulk",
      API_KEYS_CLEAR_CACHE: "/api/admin/api-keys/clear-cache",
      API_KEYS_INIT_DEFAULTS: "/api/admin/api-keys/init-defaults",
      API_KEYS_TEST_RAZORPAY: "/api/admin/api-keys/test/razorpay",
      API_KEYS_TEST_GOOGLE: "/api/admin/api-keys/test/google-maps",
      // Cashback Management
      CASHBACK_SETTINGS: "/api/admin/cashback/settings",
      CASHBACK_TOGGLE: "/api/admin/cashback/settings/toggle",
      CASHBACK_FESTIVAL: "/api/admin/cashback/settings/festival",
      CASHBACK_DASHBOARD: "/api/admin/cashback/dashboard",
      CASHBACK_ENTRIES: "/api/admin/cashback/entries",
      CASHBACK_USER_ENTRIES: "/api/admin/cashback/entries/user/:userId",
      CASHBACK_EXPIRE_ENTRY: "/api/admin/cashback/entries/:id/expire",
      CASHBACK_PROCESS_EXPIRED: "/api/admin/cashback/process-expired",
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

