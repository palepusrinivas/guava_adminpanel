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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import {
  getMailServerConfigs,
  createMailServerConfig,
  updateMailServerConfig,
  deleteMailServerConfig,
  testMailServerConnection,
  testMailServerEmail,
} from "@/utils/reducers/adminReducers";
import toast from "react-hot-toast";

interface MailServerConfig {
  id?: number;
  smtpHost: string;
  smtpPort: number;
  encryption: "TLS" | "SSL";
  username: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  active?: boolean;
  isDefault?: boolean;
  name?: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt?: string;
  updatedAt?: string;
}

const validationSchema = yup.object({
  smtpHost: yup.string().required("SMTP Host is required"),
  smtpPort: yup.number().required("SMTP Port is required").min(1).max(65535),
  encryption: yup.string().oneOf(["TLS", "SSL"]).required("Encryption type is required"),
  username: yup.string().required("Username is required").email("Must be a valid email"),
  password: yup.string().required("Password is required"),
  fromEmail: yup.string().required("From Email is required").email("Must be a valid email"),
  fromName: yup.string(),
  name: yup.string(),
});

function MailServerManagement() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.admin);
  
  const [configs, setConfigs] = useState<MailServerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<MailServerConfig | null>(null);
  const [testingConfig, setTestingConfig] = useState<MailServerConfig | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getMailServerConfigs());
      if (getMailServerConfigs.fulfilled.match(result)) {
        setConfigs(Array.isArray(result.payload) ? result.payload : []);
      } else {
        toast.error(result.payload as string || "Failed to fetch mail server configurations");
      }
    } catch (error: any) {
      toast.error("Error fetching configurations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<MailServerConfig>({
    initialValues: {
      smtpHost: "",
      smtpPort: 587,
      encryption: "TLS",
      username: "",
      password: "",
      fromEmail: "",
      fromName: "",
      name: "",
      active: true,
      isDefault: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingConfig?.id) {
          const result = await dispatch(updateMailServerConfig({ id: editingConfig.id.toString(), data: values }));
          if (updateMailServerConfig.fulfilled.match(result)) {
            toast.success("Mail server configuration updated successfully");
            setDialogOpen(false);
            formik.resetForm();
            setEditingConfig(null);
            fetchConfigs();
          } else {
            toast.error(result.payload as string || "Failed to update configuration");
          }
        } else {
          const result = await dispatch(createMailServerConfig(values));
          if (createMailServerConfig.fulfilled.match(result)) {
            toast.success("Mail server configuration created successfully");
            setDialogOpen(false);
            formik.resetForm();
            fetchConfigs();
          } else {
            toast.error(result.payload as string || "Failed to create configuration");
          }
        }
      } catch (error: any) {
        toast.error("Error saving configuration: " + error.message);
      }
    },
  });

  const handleEdit = (config: MailServerConfig) => {
    setEditingConfig(config);
    formik.setValues({
      smtpHost: config.smtpHost || "",
      smtpPort: config.smtpPort || 587,
      encryption: config.encryption || "TLS",
      username: config.username || "",
      password: config.password || "",
      fromEmail: config.fromEmail || "",
      fromName: config.fromName || "",
      name: config.name || "",
      active: config.active !== undefined ? config.active : true,
      isDefault: config.isDefault !== undefined ? config.isDefault : false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) {
      return;
    }
    try {
      const result = await dispatch(deleteMailServerConfig(id.toString()));
      if (deleteMailServerConfig.fulfilled.match(result)) {
        toast.success("Configuration deleted successfully");
        fetchConfigs();
      } else {
        toast.error(result.payload as string || "Failed to delete configuration");
      }
    } catch (error: any) {
      toast.error("Error deleting configuration: " + error.message);
    }
  };

  const handleTestConnection = async (config: MailServerConfig) => {
    if (!config.id) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await dispatch(testMailServerConnection(config.id.toString()));
      if (testMailServerConnection.fulfilled.match(result)) {
        setTestResult({
          success: result.payload.success,
          message: result.payload.message,
        });
        if (result.payload.success) {
          toast.success("Connection test successful!");
        } else {
          toast.error("Connection test failed: " + result.payload.message);
        }
        fetchConfigs(); // Refresh to get updated test results
      } else {
        toast.error(result.payload as string || "Failed to test connection");
      }
    } catch (error: any) {
      toast.error("Error testing connection: " + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testingConfig?.id || !testEmail) {
      toast.error("Please enter a test email address");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await dispatch(testMailServerEmail({ id: testingConfig.id.toString(), email: testEmail }));
      if (testMailServerEmail.fulfilled.match(result)) {
        setTestResult({
          success: result.payload.success,
          message: result.payload.message,
        });
        if (result.payload.success) {
          toast.success("Test email sent successfully!");
        } else {
          toast.error("Failed to send test email: " + result.payload.message);
        }
        fetchConfigs(); // Refresh to get updated test results
      } else {
        toast.error(result.payload as string || "Failed to send test email");
      }
    } catch (error: any) {
      toast.error("Error sending test email: " + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleOpenTestDialog = (config: MailServerConfig) => {
    setTestingConfig(config);
    setTestEmail("");
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    formik.resetForm();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          📧 Mail Server Configuration
        </Typography>
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
        Configure SMTP settings for sending emails. For Gmail, use an App Password instead of your regular password.
        <br />
        <strong>Gmail Settings:</strong> SMTP Server: smtp.gmail.com | Port (TLS): 587 | Port (SSL): 465
      </Alert>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : configs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No mail server configurations found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingConfig(null);
              formik.resetForm();
              setDialogOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Create First Configuration
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {configs.map((config) => (
            <Grid item xs={12} md={6} key={config.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {config.name || "Unnamed Configuration"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                        {config.isDefault && (
                          <Chip label="Default" color="primary" size="small" />
                        )}
                        {config.active ? (
                          <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />
                        ) : (
                          <Chip label="Inactive" color="default" size="small" icon={<CancelIcon />} />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(config)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => config.id && handleDelete(config.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        SMTP Host
                      </Typography>
                      <Typography variant="body2">{config.smtpHost}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Port
                      </Typography>
                      <Typography variant="body2">{config.smtpPort}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Encryption
                      </Typography>
                      <Typography variant="body2">{config.encryption}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body2">{config.username}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        From Email
                      </Typography>
                      <Typography variant="body2">{config.fromEmail}</Typography>
                    </Grid>
                    {config.fromName && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          From Name
                        </Typography>
                        <Typography variant="body2">{config.fromName}</Typography>
                      </Grid>
                    )}
                    {config.lastTestedAt && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Last Tested
                        </Typography>
                        <Typography variant="body2">
                          {new Date(config.lastTestedAt).toLocaleString()}
                        </Typography>
                        {config.lastTestResult && (
                          <Alert
                            severity={config.lastTestResult.toLowerCase().includes("success") ? "success" : "error"}
                            sx={{ mt: 1 }}
                          >
                            {config.lastTestResult}
                          </Alert>
                        )}
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => config.id && handleTestConnection(config)}
                      disabled={testing}
                    >
                      Test Connection
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleOpenTestDialog(config)}
                    >
                      Send Test Email
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? "Edit Mail Server Configuration" : "Create Mail Server Configuration"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Configuration Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  name="smtpHost"
                  value={formik.values.smtpHost}
                  onChange={formik.handleChange}
                  error={formik.touched.smtpHost && Boolean(formik.errors.smtpHost)}
                  helperText={formik.touched.smtpHost && formik.errors.smtpHost || "e.g., smtp.gmail.com"}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  name="smtpPort"
                  type="number"
                  value={formik.values.smtpPort}
                  onChange={formik.handleChange}
                  error={formik.touched.smtpPort && Boolean(formik.errors.smtpPort)}
                  helperText={formik.touched.smtpPort && formik.errors.smtpPort || "587 (TLS) or 465 (SSL)"}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Encryption</InputLabel>
                  <Select
                    name="encryption"
                    value={formik.values.encryption}
                    onChange={formik.handleChange}
                    label="Encryption"
                  >
                    <MenuItem value="TLS">TLS</MenuItem>
                    <MenuItem value="SSL">SSL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username (Email)"
                  name="username"
                  type="email"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password (App Password for Gmail)"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password || "For Gmail, use App Password"}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="From Email"
                  name="fromEmail"
                  type="email"
                  value={formik.values.fromEmail}
                  onChange={formik.handleChange}
                  error={formik.touched.fromEmail && Boolean(formik.errors.fromEmail)}
                  helperText={formik.touched.fromEmail && formik.errors.fromEmail}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="From Name (Optional)"
                  name="fromName"
                  value={formik.values.fromName}
                  onChange={formik.handleChange}
                  error={formik.touched.fromName && Boolean(formik.errors.fromName)}
                  helperText={formik.touched.fromName && formik.errors.fromName}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.active !== undefined ? formik.values.active : true}
                      onChange={(e) => formik.setFieldValue("active", e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isDefault !== undefined ? formik.values.isDefault : false}
                      onChange={(e) => formik.setFieldValue("isDefault", e.target.checked)}
                    />
                  }
                  label="Set as Default"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : editingConfig ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter email address to send test email"
          />
          {testResult && (
            <Alert severity={testResult.success ? "success" : "error"} sx={{ mt: 2 }}>
              {testResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleTestEmail}
            disabled={testing || !testEmail}
            startIcon={testing ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MailServerManagement;
