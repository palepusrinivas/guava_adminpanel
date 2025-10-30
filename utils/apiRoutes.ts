import { config, getApiUrl } from "./config";

// auth routes
export const registerUserUrl = getApiUrl(config.ENDPOINTS.AUTH.REGISTER_USER);
export const registerDriverUrl = getApiUrl(config.ENDPOINTS.AUTH.REGISTER_DRIVER);
export const loginUserUrl = getApiUrl(config.ENDPOINTS.AUTH.LOGIN);
export const userProfileUrl = getApiUrl(config.ENDPOINTS.AUTH.USER_PROFILE);
export const driverProfileUrl = getApiUrl(config.ENDPOINTS.AUTH.DRIVER_PROFILE);

// ride routes
export const requestRideUrl = getApiUrl(config.ENDPOINTS.RIDE.REQUEST);
export const startRideUrl = getApiUrl(config.ENDPOINTS.RIDE.START);
export const acceptRideUrl = getApiUrl(config.ENDPOINTS.RIDE.ACCEPT);
export const completeRideUrl = getApiUrl(config.ENDPOINTS.RIDE.COMPLETE);

// user routes
export const userCompletedRides = getApiUrl(config.ENDPOINTS.USER.COMPLETED_RIDES);
export const userCurrentRides = getApiUrl(config.ENDPOINTS.USER.CURRENT_RIDES);
export const userRequestedRides = getApiUrl(config.ENDPOINTS.USER.REQUESTED_RIDES);

// admin routes
export const adminLoginUrl = getApiUrl(config.ENDPOINTS.ADMIN.LOGIN);
export const adminPricingUrl = getApiUrl(config.ENDPOINTS.ADMIN.PRICING);
export const adminUsersUrl = getApiUrl(config.ENDPOINTS.ADMIN.USERS);
export const adminUserByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.USER_BY_ID.replace(':id', id));
export const adminDriversUrl = getApiUrl(config.ENDPOINTS.ADMIN.DRIVERS);
export const adminDriverByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_BY_ID.replace(':id', id));
export const adminDriverKycUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC.replace(':id', id));
export const adminDriverKycFileUrl = (id: string, name: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC_FILE.replace(':id', id).replace(':name', name));
export const adminDriverKycDownloadUrl = (id: string, name: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC_DOWNLOAD.replace(':id', id).replace(':name', name));
export const adminWalletCreditUserUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_CREDIT_USER.replace(':id', id));
export const adminWalletCreditDriverUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_CREDIT_DRIVER.replace(':id', id));
export const adminZonesUrl = getApiUrl(config.ENDPOINTS.ADMIN.ZONES);
export const adminZoneByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.ZONE_BY_ID.replace(':id', id));
export const adminFleetLocationsUrl = getApiUrl(config.ENDPOINTS.ADMIN.FLEET_LOCATIONS);
export const adminAnalyticsHeatmapUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_HEATMAP);
export const adminAnalyticsStatsUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_STATS);
export const adminAnalyticsSummaryUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_SUMMARY);
export const adminRecentActivitiesUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_ACTIVITIES);
export const adminRecentTransactionsUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_TRANSACTIONS || "");
export const adminRecentTripsUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_TRIPS || "");
export const adminTripFaresUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRIP_FARES || "");
export const adminDashboardStatsUrl = getApiUrl(config.ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const adminLeaderboardUrl = getApiUrl(config.ENDPOINTS.ADMIN.LEADERBOARD);
