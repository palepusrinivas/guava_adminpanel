import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/utils/slices/authSlice";
import rideReducer from "@/utils/slices/rideSlice";
import driverReducer from "@/utils/slices/driverSlice";
import adminReducer from "@/utils/slices/adminSlice";
import adminAnalyticsReducer from "@/utils/slices/adminAnalyticsSlice";
import adminDashboardReducer from "@/utils/slices/adminDashboardSlice";
import zoneReducer from "@/utils/slices/zoneSlice";
import fleetReducer from "@/utils/slices/fleetSlice";
import { useDispatch, useSelector } from "react-redux";
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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export default store;
