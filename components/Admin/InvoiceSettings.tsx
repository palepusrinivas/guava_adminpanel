"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  InputLabel,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Business as BusinessIcon,
  Palette as PaletteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";

interface InvoiceConfig {
  id?: number;
  companyName?: string;
  logoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  footerText?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  footerBgColor?: string;
  footerTextColor?: string;
}

export default function InvoiceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [config, setConfig] = useState<InvoiceConfig>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("/api/admin/invoice-config");
      setConfig(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching invoice config:", err);
      setError("Failed to load invoice configuration");
      toast.error("Failed to load invoice configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof InvoiceConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminAxios.put("/api/admin/invoice-config", config);
      toast.success("Invoice configuration saved successfully!");
      await fetchConfig(); // Refresh to get updated data
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to save configuration";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await adminAxios.post("/api/admin/invoice-config/upload-logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setConfig((prev) => ({ ...prev, logoUrl: response.data.logoUrl }));
      toast.success("Logo uploaded successfully!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to upload logo";
      toast.error(errorMsg);
    } finally {
      setUploadingLogo(false);
      // Reset file input
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Invoice Settings
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Customize invoice header, footer, logo, and company information
        </Typography>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <BusinessIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" className="font-semibold">
                    Company Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={config.companyName || ""}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax ID / GST Number"
                      value={config.taxId || ""}
                      onChange={(e) => handleInputChange("taxId", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={config.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={config.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={config.website || ""}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-3">
                  Address
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={config.addressLine1 || ""}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={config.addressLine2 || ""}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={config.city || ""}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={config.state || ""}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={config.postalCode || ""}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={config.country || ""}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Logo Upload */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-3">
                  Logo
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box mb={2}>
                  {config.logoUrl && (
                    <Box mb={2}>
                      <img
                        src={config.logoUrl}
                        alt="Company Logo"
                        style={{ maxWidth: "200px", maxHeight: "100px", objectFit: "contain" }}
                      />
                    </Box>
                  )}
                  <InputLabel htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </InputLabel>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogoUpload}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                    Recommended: PNG or JPG, max 5MB. Logo will appear in invoice header.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Header Colors */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" className="font-semibold">
                    Header Colors
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Background Color"
                      type="color"
                      value={config.headerBgColor || "#FFFFFF"}
                      onChange={(e) => handleInputChange("headerBgColor", e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Text Color"
                      type="color"
                      value={config.headerTextColor || "#000000"}
                      onChange={(e) => handleInputChange("headerTextColor", e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Footer Colors */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" className="font-semibold">
                    Footer Colors
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Background Color"
                      type="color"
                      value={config.footerBgColor || "#F5F5F5"}
                      onChange={(e) => handleInputChange("footerBgColor", e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Text Color"
                      type="color"
                      value={config.footerTextColor || "#666666"}
                      onChange={(e) => handleInputChange("footerTextColor", e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Footer Text */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" className="font-semibold">
                    Footer Text
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Footer Text"
                  value={config.footerText || ""}
                  onChange={(e) => handleInputChange("footerText", e.target.value)}
                  variant="outlined"
                  placeholder="Thank you for your business! You can add terms, contact info, etc."
                  helperText="This text will appear at the bottom of invoices. You can use multiple lines."
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={fetchConfig}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

