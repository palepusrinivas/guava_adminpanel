"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  PlayArrow as TestIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";

interface KeyStatus {
  razorpay: { keyId: boolean; keySecret: boolean; webhookSecret: boolean };
  google: { mapsApiKey: boolean; placesApiKey: boolean };
  firebase: { projectId: boolean; storageBucket: boolean; fcmServerKey: boolean };
  other: { smsApiKey: boolean; locationIqApiKey: boolean };
}

interface ApiKeyConfig {
  name: string;
  displayName: string;
  description: string;
  category: "razorpay" | "google" | "firebase" | "other";
  isSecret: boolean;
}

const API_KEY_CONFIGS: ApiKeyConfig[] = [
  // Razorpay
  { name: "RAZORPAY_KEY_ID", displayName: "Razorpay Key ID", description: "Your Razorpay API Key ID (starts with rzp_)", category: "razorpay", isSecret: false },
  { name: "RAZORPAY_KEY_SECRET", displayName: "Razorpay Key Secret", description: "Your Razorpay API Key Secret", category: "razorpay", isSecret: true },
  { name: "RAZORPAY_WEBHOOK_SECRET", displayName: "Webhook Secret", description: "Secret for verifying Razorpay webhooks", category: "razorpay", isSecret: true },
  // Google
  { name: "GOOGLE_MAPS_API_KEY", displayName: "Maps API Key", description: "Google Maps API Key for maps and directions", category: "google", isSecret: false },
  { name: "GOOGLE_PLACES_API_KEY", displayName: "Places API Key", description: "Google Places API Key for autocomplete (uses Maps key if not set)", category: "google", isSecret: false },
  // Firebase
  { name: "FIREBASE_PROJECT_ID", displayName: "Project ID", description: "Firebase Project ID (e.g., gauva-15d9a)", category: "firebase", isSecret: false },
  { name: "FIREBASE_STORAGE_BUCKET", displayName: "Storage Bucket", description: "Firebase Storage Bucket (e.g., gauva-15d9a.firebasestorage.app) - Used for driver documents, banners, vehicle icons", category: "firebase", isSecret: false },
  { name: "FCM_SERVER_KEY", displayName: "FCM Server Key", description: "Firebase Cloud Messaging Server Key for push notifications", category: "firebase", isSecret: true },
  // Other
  { name: "SMS_API_KEY", displayName: "SMS API Key", description: "SMS Gateway API Key (MSG91, Twilio, etc.)", category: "other", isSecret: true },
  { name: "LOCATIONIQ_API_KEY", displayName: "LocationIQ API Key", description: "LocationIQ API Key for geocoding", category: "other", isSecret: false },
];

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | false>("razorpay");

  useEffect(() => {
    fetchKeyStatus();
  }, []);

  const fetchKeyStatus = async () => {
    setLoading(true);
    try {
      const response = await adminAxios.get("/api/admin/api-keys/status");
      setKeyStatus(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch API key status");
      if (err.response?.status === 403) {
        setError("Access denied. Admin role required.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (keyName: string) => {
    const value = keyValues[keyName];
    if (!value || !value.trim()) {
      toast.error("Please enter a value");
      return;
    }

    setSaving(keyName);
    try {
      await adminAxios.put(`/api/admin/api-keys/${keyName}`, { value: value.trim() });
      toast.success(`${keyName} saved successfully`);
      setKeyValues({ ...keyValues, [keyName]: "" });
      fetchKeyStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save API key");
    } finally {
      setSaving(null);
    }
  };

  const handleTestRazorpay = async () => {
    setTesting("razorpay");
    try {
      const response = await adminAxios.get("/api/admin/api-keys/test/razorpay");
      if (response.data.status === "success") {
        toast.success("Razorpay configuration is valid!");
      } else if (response.data.status === "not_configured") {
        toast.error("Razorpay keys are not configured");
      } else {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      toast.error("Failed to test Razorpay configuration");
    } finally {
      setTesting(null);
    }
  };

  const handleTestGoogleMaps = async () => {
    setTesting("google");
    try {
      const response = await adminAxios.get("/api/admin/api-keys/test/google-maps");
      if (response.data.status === "success") {
        toast.success("Google Maps configuration is valid!");
      } else if (response.data.status === "not_configured") {
        toast.error("Google Maps API key is not configured");
      } else {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      toast.error("Failed to test Google Maps configuration");
    } finally {
      setTesting(null);
    }
  };

  const handleInitDefaults = async () => {
    try {
      const response = await adminAxios.post("/api/admin/api-keys/init-defaults");
      toast.success(`${response.data.created} default entries created`);
      fetchKeyStatus();
    } catch (err: any) {
      toast.error("Failed to initialize defaults");
    }
  };

  const toggleVisibility = (keyName: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyName)) {
      newVisible.delete(keyName);
    } else {
      newVisible.add(keyName);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const isKeyConfigured = (keyName: string): boolean => {
    if (!keyStatus) return false;
    const config = API_KEY_CONFIGS.find((c) => c.name === keyName);
    if (!config) return false;

    const categoryStatus = keyStatus[config.category as keyof KeyStatus];
    if (!categoryStatus) return false;

    // Map key name to status field
    const statusMap: Record<string, string> = {
      RAZORPAY_KEY_ID: "keyId",
      RAZORPAY_KEY_SECRET: "keySecret",
      RAZORPAY_WEBHOOK_SECRET: "webhookSecret",
      GOOGLE_MAPS_API_KEY: "mapsApiKey",
      GOOGLE_PLACES_API_KEY: "placesApiKey",
      FIREBASE_PROJECT_ID: "projectId",
      FIREBASE_STORAGE_BUCKET: "storageBucket",
      FCM_SERVER_KEY: "fcmServerKey",
      SMS_API_KEY: "smsApiKey",
      LOCATIONIQ_API_KEY: "locationIqApiKey",
    };

    const statusKey = statusMap[keyName];
    return statusKey ? (categoryStatus as any)[statusKey] : false;
  };

  const renderKeyInput = (config: ApiKeyConfig) => {
    const isConfigured = isKeyConfigured(config.name);
    const isVisible = visibleKeys.has(config.name);

    return (
      <Box key={config.name} sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle2" fontWeight="medium">
            {config.displayName}
          </Typography>
          {isConfigured ? (
            <Chip icon={<CheckCircleIcon />} label="Configured" size="small" color="success" />
          ) : (
            <Chip icon={<ErrorIcon />} label="Not Set" size="small" color="warning" />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {config.description}
        </Typography>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            type={config.isSecret && !isVisible ? "password" : "text"}
            placeholder={isConfigured ? "••••••••••••" : `Enter ${config.displayName}`}
            value={keyValues[config.name] || ""}
            onChange={(e) => setKeyValues({ ...keyValues, [config.name]: e.target.value })}
            InputProps={{
              endAdornment: config.isSecret && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => toggleVisibility(config.name)}>
                    {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSaveKey(config.name)}
            disabled={saving === config.name || !keyValues[config.name]}
            sx={{ bgcolor: "#120E43", minWidth: 100 }}
          >
            {saving === config.name ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          </Button>
        </Box>
      </Box>
    );
  };

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
            🔑 API Keys Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure Razorpay, Google Maps, Firebase, and other API keys
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchKeyStatus}>
            Refresh
          </Button>
          <Button variant="outlined" onClick={handleInitDefaults}>
            Initialize Defaults
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: "4px solid #3B82F6" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>💳 Razorpay</Typography>
              <Typography variant="h6">
                {keyStatus?.razorpay.keyId && keyStatus?.razorpay.keySecret ? (
                  <Chip label="Configured" size="small" color="success" />
                ) : (
                  <Chip label="Incomplete" size="small" color="warning" />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: "4px solid #10B981" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>🗺️ Google Maps</Typography>
              <Typography variant="h6">
                {keyStatus?.google.mapsApiKey ? (
                  <Chip label="Configured" size="small" color="success" />
                ) : (
                  <Chip label="Not Set" size="small" color="warning" />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: "4px solid #F59E0B" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>🔥 Firebase</Typography>
              <Typography variant="h6">
                {keyStatus?.firebase.projectId ? (
                  <Chip label="Configured" size="small" color="success" />
                ) : (
                  <Chip label="Not Set" size="small" color="warning" />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: "4px solid #8B5CF6" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>🔧 Other Services</Typography>
              <Typography variant="h6">
                {keyStatus?.other.smsApiKey || keyStatus?.other.locationIqApiKey ? (
                  <Chip label="Partially Set" size="small" color="info" />
                ) : (
                  <Chip label="Not Set" size="small" color="warning" />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Configuration Sections */}
      <Box>
        {/* Razorpay */}
        <Accordion expanded={expandedCategory === "razorpay"} onChange={() => setExpandedCategory(expandedCategory === "razorpay" ? false : "razorpay")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Typography variant="h6">💳 Razorpay Payment Gateway</Typography>
              <Box flexGrow={1} />
              <Button
                size="small"
                startIcon={testing === "razorpay" ? <CircularProgress size={16} /> : <TestIcon />}
                onClick={(e) => { e.stopPropagation(); handleTestRazorpay(); }}
                disabled={testing === "razorpay"}
              >
                Test Connection
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              Get your Razorpay API keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener">Razorpay Dashboard → Settings → API Keys</a>
            </Alert>
            {API_KEY_CONFIGS.filter((c) => c.category === "razorpay").map(renderKeyInput)}
          </AccordionDetails>
        </Accordion>

        {/* Google */}
        <Accordion expanded={expandedCategory === "google"} onChange={() => setExpandedCategory(expandedCategory === "google" ? false : "google")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Typography variant="h6">🗺️ Google Maps & Places</Typography>
              <Box flexGrow={1} />
              <Button
                size="small"
                startIcon={testing === "google" ? <CircularProgress size={16} /> : <TestIcon />}
                onClick={(e) => { e.stopPropagation(); handleTestGoogleMaps(); }}
                disabled={testing === "google"}
              >
                Test Connection
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              Get your Google API keys from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console → APIs & Services → Credentials</a>
              <br />
              Make sure to enable: <strong>Maps JavaScript API, Places API, Geocoding API, Directions API</strong>
            </Alert>
            {API_KEY_CONFIGS.filter((c) => c.category === "google").map(renderKeyInput)}
          </AccordionDetails>
        </Accordion>

        {/* Firebase */}
        <Accordion expanded={expandedCategory === "firebase"} onChange={() => setExpandedCategory(expandedCategory === "firebase" ? false : "firebase")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔥 Firebase Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              Get your Firebase configuration from <a href="https://console.firebase.google.com/" target="_blank" rel="noopener">Firebase Console → Project Settings</a>
            </Alert>
            {API_KEY_CONFIGS.filter((c) => c.category === "firebase").map(renderKeyInput)}
          </AccordionDetails>
        </Accordion>

        {/* Other */}
        <Accordion expanded={expandedCategory === "other"} onChange={() => setExpandedCategory(expandedCategory === "other" ? false : "other")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔧 Other Services</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {API_KEY_CONFIGS.filter((c) => c.category === "other").map(renderKeyInput)}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
