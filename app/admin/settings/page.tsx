"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Map as MapIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";
import Link from "next/link";

interface SettingConfig {
  key: string;
  label: string;
  description: string;
  type: "text" | "number" | "boolean" | "select" | "json";
  options?: string[];
  category: string;
}

const SETTING_CONFIGS: SettingConfig[] = [
  // Payment Settings
  {
    key: "payment_gateway",
    label: "Payment Gateway",
    description: "Active payment gateway provider",
    type: "select",
    options: ["razorpay", "stripe", "paytm"],
    category: "payment",
  },
  {
    key: "payment_mode",
    label: "Payment Mode",
    description: "Live or Test mode for payments",
    type: "select",
    options: ["live", "test"],
    category: "payment",
  },
  {
    key: "min_wallet_topup",
    label: "Minimum Wallet Top-up",
    description: "Minimum amount for wallet top-up (INR)",
    type: "number",
    category: "payment",
  },
  {
    key: "max_wallet_topup",
    label: "Maximum Wallet Top-up",
    description: "Maximum amount for wallet top-up (INR)",
    type: "number",
    category: "payment",
  },
  {
    key: "commission_rate",
    label: "Platform Commission (%)",
    description: "Commission percentage on each ride",
    type: "number",
    category: "payment",
  },

  // Map Settings
  {
    key: "maps_provider",
    label: "Maps Provider",
    description: "Primary maps service provider",
    type: "select",
    options: ["google", "locationiq", "mapbox"],
    category: "maps",
  },
  {
    key: "geocoding_provider",
    label: "Geocoding Provider",
    description: "Service for address lookup",
    type: "select",
    options: ["google", "locationiq", "nominatim"],
    category: "maps",
  },
  {
    key: "default_city",
    label: "Default City",
    description: "Default city for new users",
    type: "text",
    category: "maps",
  },
  {
    key: "default_country",
    label: "Default Country",
    description: "Default country code",
    type: "text",
    category: "maps",
  },

  // Notification Settings
  {
    key: "push_notifications_enabled",
    label: "Push Notifications",
    description: "Enable push notifications",
    type: "boolean",
    category: "notifications",
  },
  {
    key: "sms_notifications_enabled",
    label: "SMS Notifications",
    description: "Enable SMS notifications",
    type: "boolean",
    category: "notifications",
  },
  {
    key: "email_notifications_enabled",
    label: "Email Notifications",
    description: "Enable email notifications",
    type: "boolean",
    category: "notifications",
  },

  // General Settings
  {
    key: "driver_search_radius_km",
    label: "Driver Search Radius (km)",
    description: "Maximum distance (km) to search for drivers from pickup location. Recommended: 10-20 km for city rides. Maximum allowed: 50 km.",
    type: "number",
    category: "general",
  },
  {
    key: "app_name",
    label: "App Name",
    description: "Application display name",
    type: "text",
    category: "general",
  },
  {
    key: "support_email",
    label: "Support Email",
    description: "Customer support email address",
    type: "text",
    category: "general",
  },
  {
    key: "support_phone",
    label: "Support Phone",
    description: "Customer support phone number",
    type: "text",
    category: "general",
  },
  {
    key: "terms_url",
    label: "Terms & Conditions URL",
    description: "Link to terms and conditions page",
    type: "text",
    category: "general",
  },
  {
    key: "privacy_url",
    label: "Privacy Policy URL",
    description: "Link to privacy policy page",
    type: "text",
    category: "general",
  },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const categories = [
    { id: "payment", label: "Payment", icon: <PaymentIcon /> },
    { id: "maps", label: "Maps & Location", icon: <MapIcon /> },
    { id: "notifications", label: "Notifications", icon: <NotificationsIcon /> },
    { id: "general", label: "General", icon: <SettingsIcon /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const settingsData: Record<string, any> = {};

    for (const config of SETTING_CONFIGS) {
      try {
        const response = await adminAxios.get(`/api/admin/business-config/${config.key}`);
        settingsData[config.key] = {
          value: response.data.liveValues || "",
          testValue: response.data.testValues || "",
          mode: response.data.mode || "live",
          active: response.data.active !== false,
        };
      } catch (err) {
        // Setting doesn't exist yet, use defaults
        settingsData[config.key] = {
          value: "",
          testValue: "",
          mode: "live",
          active: true,
        };
      }
    }

    setSettings(settingsData);
    setLoading(false);
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await adminAxios.put(`/api/admin/business-config/${key}`, {
        liveValues: settings[key]?.value || "",
        testValues: settings[key]?.testValue || "",
        mode: settings[key]?.mode || "live",
        active: settings[key]?.active !== false,
        type: "config",
      });
      toast.success(`${key} saved successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save setting");
    } finally {
      setSaving(null);
    }
  };

  const updateSetting = (key: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const currentCategory = categories[tabValue].id;
  const filteredConfigs = SETTING_CONFIGS.filter(
    (c) => c.category === currentCategory
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            ⚙️ System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure payment, maps, notifications, and general settings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          component={Link}
          href="/admin/settings/api-keys"
          startIcon={<span>🔑</span>}
        >
          Manage API Keys
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Changes are saved individually. Click "Save" next to each setting after making changes.
      </Alert>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": { py: 2 },
          }}
        >
          {categories.map((cat) => (
            <Tab
              key={cat.id}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {cat.icon}
                  {cat.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Settings Grid */}
      <Grid container spacing={3}>
        {filteredConfigs.map((config) => (
          <Grid item xs={12} md={6} key={config.key}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {config.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {config.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={config.key}
                    size="small"
                    sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                  />
                </Box>

                {config.type === "text" && (
                  <TextField
                    fullWidth
                    size="small"
                    value={settings[config.key]?.value || ""}
                    onChange={(e) =>
                      updateSetting(config.key, "value", e.target.value)
                    }
                    placeholder={`Enter ${config.label.toLowerCase()}`}
                  />
                )}

                {config.type === "number" && (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={settings[config.key]?.value || ""}
                    onChange={(e) =>
                      updateSetting(config.key, "value", e.target.value)
                    }
                    placeholder="0"
                  />
                )}

                {config.type === "boolean" && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings[config.key]?.value === "true"}
                        onChange={(e) =>
                          updateSetting(
                            config.key,
                            "value",
                            e.target.checked ? "true" : "false"
                          )
                        }
                      />
                    }
                    label={settings[config.key]?.value === "true" ? "Enabled" : "Disabled"}
                  />
                )}

                {config.type === "select" && config.options && (
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings[config.key]?.value || ""}
                      onChange={(e) =>
                        updateSetting(config.key, "value", e.target.value)
                      }
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select {config.label}
                      </MenuItem>
                      {config.options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    saving === config.key ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={() => handleSave(config.key)}
                  disabled={saving === config.key}
                  sx={{ bgcolor: "#120E43" }}
                >
                  Save
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

