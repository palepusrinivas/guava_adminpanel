"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getAdminNotifications,
  getUnreadAdminNotifications,
  getUnreadAdminNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/utils/reducers/adminReducers";
import { clearError } from "@/utils/slices/adminNotificationsSlice";
import { formatDateTimeIST } from "@/utils/dateUtils";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  MarkEmailRead as MarkEmailReadIcon,
  PersonAdd as PersonAddIcon,
  LocalTaxi as LocalTaxiIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminNotifications() {
  const dispatch = useAppDispatch();
  const { notifications, unreadNotifications, unreadCount, isLoading, error } = useAppSelector(
    (state) => state.adminNotifications
  );
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, activeTab]);

  const fetchNotifications = async () => {
    try {
      if (activeTab === 0) {
        // All notifications
        await dispatch(getAdminNotifications({ page: currentPage, size: pageSize })).unwrap();
      } else {
        // Unread notifications
        await dispatch(getUnreadAdminNotifications({ page: currentPage, size: pageSize })).unwrap();
      }
    } catch (error: any) {
      toast.error(error || "Failed to load notifications");
    }
  };

  const fetchUnreadCount = async () => {
    try {
      await dispatch(getUnreadAdminNotificationsCount()).unwrap();
    } catch (error) {
      // Silently fail for count
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      toast.success("Notification marked as read");
      fetchUnreadCount();
    } catch (error: any) {
      toast.error(error || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success("All notifications marked as read");
      fetchNotifications();
      fetchUnreadCount();
    } catch (error: any) {
      toast.error(error || "Failed to mark all as read");
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "USER_REGISTRATION":
        return <PersonAddIcon sx={{ color: "#10B981" }} />;
      case "DRIVER_REGISTRATION":
        return <LocalTaxiIcon sx={{ color: "#3B82F6" }} />;
      case "RIDE_CANCELLATION":
        return <CancelIcon sx={{ color: "#EF4444" }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "USER_REGISTRATION":
        return "success";
      case "DRIVER_REGISTRATION":
        return "primary";
      case "RIDE_CANCELLATION":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDateTimeIST(dateString, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const displayNotifications = activeTab === 0 ? notifications : unreadNotifications;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Notifications</h2>
            <p className="text-teal-100">Stay updated with user registrations, driver registrations, and ride cancellations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ fontSize: 40, color: "white" }} />
            </Badge>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ bgcolor: "white", color: "teal.600", "&:hover": { bgcolor: "gray.100" } }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error">
                  <span>All Notifications</span>
                </Badge>
              }
            />
            <Tab label="Unread Only" />
          </Tabs>
        </Box>

        {activeTab === 1 && unreadCount > 0 && (
          <Box sx={{ p: 2, bgcolor: "action.hover", display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              size="small"
            >
              Mark All as Read
            </Button>
          </Box>
        )}
      </Card>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : displayNotifications.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <NotificationsNoneIcon sx={{ fontSize: 64, color: "gray.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {activeTab === 0 ? "No notifications yet" : "No unread notifications"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {activeTab === 0
                  ? "You'll see notifications here when users register, drivers register, or rides are cancelled."
                  : "All caught up! No unread notifications."}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayNotifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{
                borderLeft: notification.isRead ? "none" : "4px solid",
                borderLeftColor: notification.isRead ? "transparent" : "primary.main",
                bgcolor: notification.isRead ? "background.paper" : "action.hover",
                transition: "all 0.2s",
                "&:hover": { boxShadow: 3 },
              }}
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Typography variant="h6" component="div">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace("_", " ")}
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                        />
                        {notification.emailSent && (
                          <Chip
                            icon={<MarkEmailReadIcon />}
                            label="Email Sent"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {notification.isRead && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Read"
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        )}
                      </div>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                        {notification.message}
                      </Typography>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.entityType && notification.entityId && (
                          <span>
                            {notification.entityType}: {notification.entityId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <IconButton
                      onClick={() => handleMarkAsRead(notification.id)}
                      size="small"
                      color="primary"
                      title="Mark as read"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {displayNotifications.length > 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
          <Button
            variant="outlined"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          >
            Previous
          </Button>
          <Typography variant="body2">
            Page {currentPage + 1}
          </Typography>
          <Button
            variant="outlined"
            disabled={displayNotifications.length < pageSize}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </div>
  );
}
