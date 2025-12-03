import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/utils/slices/authSlice";
import rideReducer from "@/utils/slices/rideSlice";
import driverReducer from "@/utils/slices/driverSlice";
import adminReducer from "@/utils/slices/adminSlice";
import adminAnalyticsReducer from "@/utils/slices/adminAnalyticsSlice";
import adminDashboardReducer from "@/utils/slices/adminDashboardSlice";
import zoneReducer from "@/utils/slices/zoneSlice";
import fleetReducer from "@/utils/slices/fleetSlice";
import tripManagementReducer from "@/utils/slices/tripManagementSlice";
import bannerReducer from "@/utils/slices/bannerSlice";
import { useDispatch, useSelector } from "react-redux";
import couponReducer from "@/utils/slices/couponSlice";
import discountReducer from "@/utils/slices/discountSlice";
import driverLevelReducer from "@/utils/slices/driverLevelSlice";
import withdrawReducer from "@/utils/slices/withdrawSlice";
import employeeReducer from "@/utils/slices/employeeSlice";
import customerReducer from "@/utils/slices/customerSlice";
import parcelReducer from "@/utils/slices/parcelSlice";
import vehicleReducer from "@/utils/slices/vehicleSlice";
import tripFareReducer from "@/utils/slices/tripFareSlice";
import transactionReducer from "@/utils/slices/transactionSlice";
import reportReducer from "@/utils/slices/reportSlice";
import chattingReducer from "@/utils/slices/chattingSlice";
import businessReducer from "@/utils/slices/businessSlice";
import pagesMediaReducer from "@/utils/slices/pagesMediaSlice";
import notificationReducer from "@/utils/slices/notificationSlice";
import schoolReducer from "@/utils/slices/schoolSlice";
import walletReducer from "@/utils/slices/walletSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    driver: driverReducer,
    admin: adminReducer,
    adminAnalytics: adminAnalyticsReducer,
    adminDashboard: adminDashboardReducer,
    zone: zoneReducer,
    fleet: fleetReducer,
    tripManagement: tripManagementReducer,
    banner: bannerReducer,
    coupon: couponReducer,
    discount: discountReducer,
    driverLevel: driverLevelReducer,
    withdraw: withdrawReducer,
    employee: employeeReducer,
    customer: customerReducer,
    parcel: parcelReducer,
    vehicle: vehicleReducer,
    tripFare: tripFareReducer,
    transaction: transactionReducer,
    report: reportReducer,
    chatting: chattingReducer,
    business: businessReducer,
    pagesMedia: pagesMediaReducer,
    notification: notificationReducer,
    school: schoolReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export default store;
