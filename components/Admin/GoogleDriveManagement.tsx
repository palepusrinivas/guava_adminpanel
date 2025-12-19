"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";
import {
  adminGoogleDriveUrl,
  adminGoogleDriveByIdUrl,
  adminGoogleDriveActiveUrl,
  adminGoogleDriveTestUrl,
} from "@/utils/apiRoutes";

interface GoogleDriveConfig {
  id?: number;
  folderId: string;
  folderName?: string;
  serviceAccountJson: string;
  active?: boolean;
  isDefault?: boolean;
  name?: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt?: string;
  updatedAt?: string;
}

const validationSchema = yup.object({
  folderId: yup.string().required("Folder ID is required"),
  folderName: yup.string(),
  serviceAccountJson: yup.string().required("Service Account JSON is required"),
  name: yup.string(),
});

function GoogleDriveManagement() {
  const [configs, setConfigs] = useState<GoogleDriveConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<GoogleDriveConfig | null>(null);
  const [testingConfig, setTestingConfig] = useState<GoogleDriveConfig | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await adminAxios.get(adminGoogleDriveUrl);
      setConfigs(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toast.error("Error fetching configurations: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<GoogleDriveConfig>({
    initialValues: {
      folderId: "",
      folderName: "",
      serviceAccountJson: "",
      name: "",
      active: true,
      isDefault: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingConfig?.id) {
          const response = await adminAxios.put(adminGoogleDriveByIdUrl(editingConfig.id.toString()), values);
          toast.success("Google Drive configuration updated successfully");
          setDialogOpen(false);
          formik.resetForm();
          setEditingConfig(null);
          fetchConfigs();
        } else {
          const response = await adminAxios.post(adminGoogleDriveUrl, values);
          toast.success("Google Drive configuration created successfully");
          setDialogOpen(false);
          formik.resetForm();
          fetchConfigs();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to save configuration");
      }
    },
  });

  const handleEdit = (config: GoogleDriveConfig) => {
    setEditingConfig(config);
    formik.setValues({
      folderId: config.folderId || "",
      folderName: config.folderName || "",
      serviceAccountJson: config.serviceAccountJson || "",
      name: config.name || "",
      active: config.active !== false,
      isDefault: config.isDefault || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await adminAxios.delete(adminGoogleDriveByIdUrl(id.toString()));
      toast.success("Configuration deleted successfully");
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete configuration");
    }
  };

  const handleTest = async (config: GoogleDriveConfig) => {
    setTestingConfig(config);
    setTesting(true);
    setTestResult(null);

    try {
      const response = await adminAxios.post(adminGoogleDriveTestUrl(config.id!.toString()));
      setTestResult({
        success: response.data.success,
        message: response.data.message || response.data.lastTestResult || "Test completed",
      });
      if (response.data.success) {
        toast.success("Connection test successful!");
      } else {
        toast.error("Connection test failed");
      }
      fetchConfigs(); // Refresh to get updated test results
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || error.message || "Test failed",
      });
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    formik.resetForm();
  };

  if (loading && configs.length === 0) {
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
            📁 Google Drive Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure Google Drive for invoice storage
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingConfig(null);
            formik.resetForm();
            setDialogOpen(true);
          }}
        >
          Add Configuration
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure Google Drive Service Account credentials to automatically upload invoice PDFs. 
        You need to create a Service Account in Google Cloud Console and download the JSON key file.
      </Alert>

      {/* Configurations List */}
      <Grid container spacing={3}>
        {configs.map((config) => (
          <Grid item xs={12} md={6} key={config.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {config.name || "Unnamed Configuration"}
                    </Typography>
                    <Box display="flex" gap={1} mb={1}>
                      {config.active && <Chip label="Active" color="success" size="small" />}
                      {config.isDefault && <Chip label="Default" color="primary" size="small" />}
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleTest(config)}
                      disabled={testing && testingConfig?.id === config.id}
                      title="Test Connection"
                    >
                      {testing && testingConfig?.id === config.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PlayArrowIcon />
                      )}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(config)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(config.id!)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Folder ID:</strong> {config.folderId}
                </Typography>
                {config.folderName && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Folder Name:</strong> {config.folderName}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Service Account:</strong>{" "}
                  {config.serviceAccountJson ? "✓ Configured" : "✗ Not configured"}
                </Typography>

                {config.lastTestedAt && (
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Last tested: {new Date(config.lastTestedAt).toLocaleString()}
                    </Typography>
                    {config.lastTestResult && (
                      <Typography
                        variant="caption"
                        display="block"
                        color={config.lastTestResult.includes("Success") ? "success.main" : "error.main"}
                      >
                        {config.lastTestResult}
                      </Typography>
                    )}
                  </Box>
                )}

                {testingConfig?.id === config.id && testResult && (
                  <Alert
                    severity={testResult.success ? "success" : "error"}
                    sx={{ mt: 2 }}
                  >
                    {testResult.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {configs.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography color="text.secondary">
                No Google Drive configurations found. Click "Add Configuration" to get started.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? "Edit Google Drive Configuration" : "Add Google Drive Configuration"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Configuration Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Google Drive Folder ID"
              name="folderId"
              value={formik.values.folderId}
              onChange={formik.handleChange}
              error={formik.touched.folderId && !!formik.errors.folderId}
              helperText={
                formik.touched.folderId && formik.errors.folderId
                  ? formik.errors.folderId
                  : "The ID of the Google Drive folder where invoices will be stored"
              }
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Folder Name (Optional)"
              name="folderName"
              value={formik.values.folderName}
              onChange={formik.handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Service Account JSON"
              name="serviceAccountJson"
              value={formik.values.serviceAccountJson}
              onChange={formik.handleChange}
              error={formik.touched.serviceAccountJson && !!formik.errors.serviceAccountJson}
              helperText={
                formik.touched.serviceAccountJson && formik.errors.serviceAccountJson
                  ? formik.errors.serviceAccountJson
                  : "Paste the entire JSON content from your Google Service Account key file"
              }
              margin="normal"
              multiline
              rows={8}
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.active !== false}
                  onChange={(e) => formik.setFieldValue("active", e.target.checked)}
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isDefault || false}
                  onChange={(e) => formik.setFieldValue("isDefault", e.target.checked)}
                />
              }
              label="Set as Default"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving..." : editingConfig ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default GoogleDriveManagement;
