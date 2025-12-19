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
// Pricing zones and profiles
export const adminPricingZonesUrl = getApiUrl(config.ENDPOINTS.ADMIN.PRICING_ZONES);
export const adminPricingZonesRulesUrl = (zoneId: string) => getApiUrl(config.ENDPOINTS.ADMIN.PRICING_ZONES_RULES.replace(':zoneId', zoneId));
export const adminPricingProfilesUrl = getApiUrl(config.ENDPOINTS.ADMIN.PRICING_PROFILES);
export const adminPricingProfilesServiceRatesUrl = (profileId: string) => getApiUrl(config.ENDPOINTS.ADMIN.PRICING_PROFILES_SERVICE_RATES.replace(':profileId', profileId));
export const adminPricingProfilesActivateUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.PRICING_PROFILES_ACTIVATE.replace(':id', id));
// Tiered pricing
export const adminPricingTiersUrl = getApiUrl(config.ENDPOINTS.ADMIN.PRICING_TIERS);
export const adminPricingTiersByServiceUrl = (serviceType: string) => getApiUrl(config.ENDPOINTS.ADMIN.PRICING_TIERS_BY_SERVICE.replace(':serviceType', serviceType));
export const adminPricingTiersBulkUpdateUrl = (serviceType: string) => getApiUrl(config.ENDPOINTS.ADMIN.PRICING_TIERS_BULK_UPDATE.replace(':serviceType', serviceType));
export const adminUsersUrl = getApiUrl(config.ENDPOINTS.ADMIN.USERS);
export const adminUserByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.USER_BY_ID.replace(':id', id));
export const adminDriversUrl = getApiUrl(config.ENDPOINTS.ADMIN.DRIVERS);
export const adminDriverByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_BY_ID.replace(':id', id));
export const adminDriverKycUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC.replace(':id', id));
export const adminDriverKycFileUrl = (id: string, name: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC_FILE.replace(':id', id).replace(':name', name));
export const adminDriverKycDownloadUrl = (id: string, name: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_KYC_DOWNLOAD.replace(':id', id).replace(':name', name));
export const adminWalletCreditUserUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_CREDIT_USER.replace(':id', id));
export const adminWalletCreditDriverUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_CREDIT_DRIVER.replace(':id', id));
export const adminWalletManualPaymentUserUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_MANUAL_PAYMENT_USER.replace(':id', id));
export const adminWalletManualPaymentDriverUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WALLET_MANUAL_PAYMENT_DRIVER.replace(':id', id));
export const adminZonesUrl = getApiUrl(config.ENDPOINTS.ADMIN.ZONES);
export const adminZoneByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.ZONE_BY_ID.replace(':id', id));
export const adminFleetLocationsUrl = getApiUrl(config.ENDPOINTS.ADMIN.FLEET_LOCATIONS);
export const adminAnalyticsHeatmapUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_HEATMAP);
// Prefer backend-supported analytics endpoints:
export const adminAnalyticsKpisUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_KPIS);
export const adminAnalyticsZonesUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_ZONES);
// Legacy aliases (kept to avoid import errors if used elsewhere)
export const adminAnalyticsStatsUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_KPIS);
export const adminAnalyticsSummaryUrl = getApiUrl(config.ENDPOINTS.ADMIN.ANALYTICS_ZONES);
export const adminRecentActivitiesUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_ACTIVITIES);
export const adminRecentTransactionsUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_TRANSACTIONS || "");
export const adminRecentTripsUrl = getApiUrl(config.ENDPOINTS.ADMIN.RECENT_TRIPS || "");
export const adminTripFaresUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRIP_FARES || "");
export const adminDashboardStatsUrl = getApiUrl(config.ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const adminLeaderboardUrl = getApiUrl(config.ENDPOINTS.ADMIN.LEADERBOARD);
// Driver access rules
export const adminDriverAccessConfigsUrl = getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_ACCESS_CONFIGS);
export const adminDriverAccessConfigByVehicleUrl = (vehicleType: string) =>
  getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_ACCESS_CONFIG_BY_VEHICLE.replace(':vehicleType', encodeURIComponent(vehicleType)));
export const adminDriverAccessProcessDailyFeesUrl = getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_ACCESS_PROCESS_DAILY_FEES);
export const adminTripsUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRIPS);
export const adminTripByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.TRIP_BY_ID.replace(':id', id));
export const adminCouponsUrl = getApiUrl(config.ENDPOINTS.ADMIN.COUPONS);
export const adminCouponByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.COUPON_BY_ID.replace(':id', id));
export const adminBannersUrl = getApiUrl(config.ENDPOINTS.ADMIN.BANNERS);
export const adminBannerByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.BANNER_BY_ID.replace(':id', id));
export const adminLegalDocumentsUrl = getApiUrl(config.ENDPOINTS.ADMIN.LEGAL_DOCUMENTS);
export const adminLegalDocumentByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.LEGAL_DOCUMENT_BY_ID.replace(':id', id));
export const adminLegalDocumentActiveUrl = getApiUrl(config.ENDPOINTS.ADMIN.LEGAL_DOCUMENT_ACTIVE);
export const adminLegalDocumentActivateUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.LEGAL_DOCUMENT_ACTIVATE.replace(':id', id));
export const adminLegalDocumentDeactivateUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.LEGAL_DOCUMENT_DEACTIVATE.replace(':id', id));
export const adminMailServerUrl = getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER);
export const adminMailServerByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER_BY_ID.replace(':id', id));
export const adminMailServerActiveUrl = getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER_ACTIVE);
export const adminMailServerTestConnectionUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER_TEST_CONNECTION.replace(':id', id));
export const adminMailServerTestEmailUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER_TEST_EMAIL.replace(':id', id));
export const adminMailServerTestConnectionDirectUrl = getApiUrl(config.ENDPOINTS.ADMIN.MAIL_SERVER_TEST_CONNECTION_DIRECT);
export const adminGoogleDriveUrl = getApiUrl(config.ENDPOINTS.ADMIN.GOOGLE_DRIVE);
export const adminGoogleDriveByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.GOOGLE_DRIVE_BY_ID.replace(':id', id));
export const adminGoogleDriveActiveUrl = getApiUrl(config.ENDPOINTS.ADMIN.GOOGLE_DRIVE_ACTIVE);
export const adminGoogleDriveTestUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.GOOGLE_DRIVE_TEST.replace(':id', id));
export const adminInvoicesUrl = getApiUrl(config.ENDPOINTS.ADMIN.INVOICES);
export const adminInvoiceByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.INVOICES_BY_ID.replace(':id', id));
export const adminInvoiceDownloadUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.INVOICES_DOWNLOAD.replace(':id', id));
export const adminInvoicesDateRangeUrl = getApiUrl(config.ENDPOINTS.ADMIN.INVOICES_DATE_RANGE);
export const adminInvoicesRetryUploadsUrl = getApiUrl(config.ENDPOINTS.ADMIN.INVOICES_RETRY_UPLOADS);
export const adminServicesUrl = getApiUrl(config.ENDPOINTS.ADMIN.SERVICES);
export const adminServiceByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.SERVICE_BY_ID.replace(':id', id));
export const adminServicesStatsUrl = getApiUrl(config.ENDPOINTS.ADMIN.SERVICES_STATS);
export const adminServicesSeedUrl = getApiUrl(config.ENDPOINTS.ADMIN.SERVICES_SEED);
export const adminDiscountsUrl = getApiUrl(config.ENDPOINTS.ADMIN.DISCOUNTS);
export const adminDiscountByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DISCOUNT_BY_ID.replace(':id', id));
export const adminDriverLevelsUrl = getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_LEVELS);
export const adminDriverLevelByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.DRIVER_LEVEL_BY_ID.replace(':id', id));
export const adminWithdrawMethodsUrl = getApiUrl(config.ENDPOINTS.ADMIN.WITHDRAW_METHODS);
export const adminWithdrawMethodByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WITHDRAW_METHOD_BY_ID.replace(':id', id));
export const adminWithdrawRequestsUrl = getApiUrl(config.ENDPOINTS.ADMIN.WITHDRAW_REQUESTS);
export const adminWithdrawRequestByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.WITHDRAW_REQUEST_BY_ID.replace(':id', id));
export const adminEmployeeRolesUrl = getApiUrl(config.ENDPOINTS.ADMIN.EMPLOYEE_ROLES);
export const adminEmployeeRoleByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.EMPLOYEE_ROLE_BY_ID.replace(':id', id));
export const adminEmployeesUrl = getApiUrl(config.ENDPOINTS.ADMIN.EMPLOYEES);
export const adminEmployeeByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.EMPLOYEE_BY_ID.replace(':id', id));
export const adminCustomersUrl = getApiUrl(config.ENDPOINTS.ADMIN.CUSTOMERS);
export const adminCustomerByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.CUSTOMER_BY_ID.replace(':id', id));
export const adminCustomerWalletAddFundUrl = getApiUrl(config.ENDPOINTS.ADMIN.CUSTOMER_WALLET_ADD_FUND);
export const adminCustomerWalletTransactionsUrl = getApiUrl(config.ENDPOINTS.ADMIN.CUSTOMER_WALLET_TRANSACTIONS);
export const adminParcelCategoriesUrl = getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_CATEGORIES);
export const adminParcelCategoryByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_CATEGORY_BY_ID.replace(':id', id));
export const adminParcelWeightsUrl = getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_WEIGHTS);
export const adminParcelWeightByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_WEIGHT_BY_ID.replace(':id', id));
export const adminVehicleBrandsUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_BRANDS);
export const adminVehicleBrandByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_BRAND_BY_ID.replace(':id', id));
export const adminVehicleModelsUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_MODELS);
export const adminVehicleModelByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_MODEL_BY_ID.replace(':id', id));
export const adminVehicleCategoriesUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_CATEGORIES);
export const adminVehicleCategoryByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_CATEGORY_BY_ID.replace(':id', id));
export const adminVehiclesUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLES);
export const adminVehicleByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_BY_ID.replace(':id', id));
export const adminVehicleRequestsUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_REQUESTS);
export const adminVehicleRequestByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_REQUEST_BY_ID.replace(':id', id));
export const adminVehicleUpdateRequestsUrl = getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_UPDATE_REQUESTS);
export const adminVehicleUpdateRequestByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.VEHICLE_UPDATE_REQUEST_BY_ID.replace(':id', id));
export const adminTripFareSetupUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRIP_FARE_SETUP);
export const adminTripFareSetupByZoneUrl = (zoneId: string) => getApiUrl(config.ENDPOINTS.ADMIN.TRIP_FARE_SETUP_BY_ZONE.replace(':zoneId', zoneId));
export const adminParcelFareSetupUrl = getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_FARE_SETUP);
export const adminParcelFareSetupByZoneUrl = (zoneId: string) => getApiUrl(config.ENDPOINTS.ADMIN.PARCEL_FARE_SETUP_BY_ZONE.replace(':zoneId', zoneId));
export const adminOperationZonesUrl = getApiUrl(config.ENDPOINTS.ADMIN.OPERATION_ZONES);
export const adminOperationZoneByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.OPERATION_ZONE_BY_ID.replace(':id', id));
export const adminTransactionsUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRANSACTIONS);
export const adminTransactionByIdUrl = (id: string) => getApiUrl(config.ENDPOINTS.ADMIN.TRANSACTION_BY_ID.replace(':id', id));
export const adminEarningReportsUrl = getApiUrl(config.ENDPOINTS.ADMIN.EARNING_REPORTS);
export const adminExpenseReportsUrl = getApiUrl(config.ENDPOINTS.ADMIN.EXPENSE_REPORTS);
export const adminZoneWiseStatisticsUrl = getApiUrl(config.ENDPOINTS.ADMIN.ZONE_WISE_STATISTICS);
export const adminTripWiseEarningUrl = getApiUrl(config.ENDPOINTS.ADMIN.TRIP_WISE_EARNING);
export const adminChattingDriversUrl = getApiUrl(config.ENDPOINTS.ADMIN.CHATTING_DRIVERS);
export const adminChattingMessagesUrl = getApiUrl(config.ENDPOINTS.ADMIN.CHATTING_MESSAGES);
export const adminChattingSendMessageUrl = getApiUrl(config.ENDPOINTS.ADMIN.CHATTING_SEND_MESSAGE);
export const adminBusinessInfoUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_INFO);
export const adminBusinessDriverSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_DRIVER_SETTINGS);
export const adminBusinessCustomerSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_CUSTOMER_SETTINGS);
export const adminBusinessFarePenaltyUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_FARE_PENALTY);
export const adminBusinessTripsSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_TRIPS_SETTINGS);
export const adminBusinessSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_SETTINGS);
export const adminBusinessParcelSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_PARCEL_SETTINGS);
export const adminBusinessRefundSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_REFUND_SETTINGS);
export const adminBusinessSafetySettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_SAFETY_SETTINGS);
export const adminBusinessReferralSettingsUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_REFERRAL_SETTINGS);
export const adminBusinessChattingSetupUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_CHATTING_SETUP);
export const adminBusinessPagesUrl = getApiUrl(config.ENDPOINTS.ADMIN.BUSINESS_PAGES);
export const adminLandingPageSetupUrl = getApiUrl(config.ENDPOINTS.ADMIN.LANDING_PAGE_SETUP);
export const adminSocialMediaLinksUrl = getApiUrl(config.ENDPOINTS.ADMIN.SOCIAL_MEDIA_LINKS);
export const adminNotificationRegularTripUrl = getApiUrl(config.ENDPOINTS.ADMIN.NOTIFICATION_REGULAR_TRIP);
export const adminNotificationParcelUrl = getApiUrl(config.ENDPOINTS.ADMIN.NOTIFICATION_PARCEL);
export const adminNotificationDriverRegistrationUrl = getApiUrl(config.ENDPOINTS.ADMIN.NOTIFICATION_DRIVER_REGISTRATION);
export const adminNotificationOtherUrl = getApiUrl(config.ENDPOINTS.ADMIN.NOTIFICATION_OTHER);
export const adminFirebaseConfigurationUrl = getApiUrl(config.ENDPOINTS.ADMIN.FIREBASE_CONFIGURATION);
export const adminThirdPartyConfigurationUrl = getApiUrl(config.ENDPOINTS.ADMIN.THIRD_PARTY_CONFIGURATION);

// Wallet endpoints
export const walletBalanceUrl = (ownerType: string, ownerId: string) =>
  getApiUrl(`/api/wallet/${ownerType}/${ownerId}`);
export const adminWalletDebitUserUrl = (userId: string) =>
  getApiUrl(`/api/admin/wallet/debit/user/${userId}`);
export const adminWalletDebitDriverUrl = (driverId: string) =>
  getApiUrl(`/api/admin/wallet/debit/driver/${driverId}`);
export const walletTransactionsUrl = (ownerType: string, ownerId: string) =>
  getApiUrl(`/api/wallet/${ownerType}/${ownerId}/transactions`);
export const walletWithdrawUrl = (ownerType: string, ownerId: string) =>
  getApiUrl(`/api/wallet/${ownerType}/${ownerId}/withdraw`);
export const walletTopUpUrl = getApiUrl("/api/admin/wallet/topup");
export const walletVerifyUrl = (transactionId: string) => getApiUrl(`/api/payments/wallet/verify/${transactionId}`);

// School subscription endpoints
export const schoolSubscriptionPlansUrl = getApiUrl("/api/v1/school/subscription/plans");
export const schoolSubscriptionPlanByIdUrl = (id: number) => getApiUrl(`/api/v1/school/subscription/plans/${id}`);
