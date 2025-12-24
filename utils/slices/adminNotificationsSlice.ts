import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAdminNotifications,
  getUnreadAdminNotifications,
  getUnreadAdminNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../reducers/adminReducers";

export interface AdminNotification {
  id: number;
  type: "USER_REGISTRATION" | "DRIVER_REGISTRATION" | "RIDE_CANCELLATION";
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  emailSent: boolean;
  emailRecipient: string | null;
  createdAt: string;
  readAt: string | null;
}

interface AdminNotificationsState {
  notifications: AdminNotification[];
  unreadNotifications: AdminNotification[];
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminNotificationsState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  isLoading: false,
  error: null,
};

const adminNotificationsSlice = createSlice({
  name: "adminNotifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = [];
      state.unreadCount = 0;
      state.currentPage = 0;
      state.totalPages = 0;
      state.totalElements = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all notifications
      .addCase(getAdminNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && typeof action.payload === 'object') {
          if (Array.isArray(action.payload.content)) {
            // Spring Data Page response
            state.notifications = action.payload.content;
            state.currentPage = action.payload.number || 0;
            state.totalPages = action.payload.totalPages || 0;
            state.totalElements = action.payload.totalElements || 0;
          } else if (Array.isArray(action.payload)) {
            // Direct array response
            state.notifications = action.payload;
            state.totalElements = action.payload.length;
          }
        }
      })
      .addCase(getAdminNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get unread notifications
      .addCase(getUnreadAdminNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUnreadAdminNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && typeof action.payload === 'object') {
          if (Array.isArray(action.payload.content)) {
            state.unreadNotifications = action.payload.content;
          } else if (Array.isArray(action.payload)) {
            state.unreadNotifications = action.payload;
          }
        }
      })
      .addCase(getUnreadAdminNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get unread count
      .addCase(getUnreadAdminNotificationsCount.pending, (state) => {
        // Don't set loading for count
      })
      .addCase(getUnreadAdminNotificationsCount.fulfilled, (state, action) => {
        if (action.payload && typeof action.payload === 'object' && 'count' in action.payload) {
          state.unreadCount = (action.payload as any).count || 0;
        }
      })
      .addCase(getUnreadAdminNotificationsCount.rejected, (state) => {
        // Silently fail for count
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        // Update in notifications array
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
          notification.isRead = true;
        }
        // Remove from unread array
        state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== id);
        // Decrease count
        if (state.unreadCount > 0) {
          state.unreadCount--;
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.isRead = true;
        });
        state.unreadNotifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { clearError, resetNotifications } = adminNotificationsSlice.actions;
export default adminNotificationsSlice.reducer;
