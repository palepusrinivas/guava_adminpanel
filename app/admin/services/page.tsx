"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBike as BikeIcon,
  DirectionsCar as CarIcon,
  LocalTaxi as TaxiIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
  getServicesList,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  seedDefaultServices,
  getServicesStats,
  ServiceConfig,
} from "@/utils/slices/serviceConfigSlice";
import { config } from "@/utils/config";

const VEHICLE_TYPES = [
  { value: "two_wheeler", label: "Two Wheeler (Bike)" },
  { value: "three_wheeler", label: "Three Wheeler (Auto)" },
  { value: "four_wheeler", label: "Four Wheeler (Car)" },
  { value: "four_wheeler_premium", label: "Four Wheeler Premium" },
];

const CATEGORIES = [
  { value: "economy", label: "Economy" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
];

// Expanded icon list with vehicle and parcel-related icons
const ICONS = [
  // Vehicles
  "🏍️", "🛺", "🚗", "🚘", "🚙", "🚕", "🚐", "🚎",
  // More vehicles with colors
  "🚑", "🚒", "🚓", "🚔", "🚖", "🚛", "🚜", "🏎️",
  // Parcel/Delivery related
  "📦", "📮", "📬", "📭", "📯", "📨", "📧", "📪",
  "🚚", "🚛", "🚜", "🛵", "🛴", "🚲",
  // Business/Delivery
  "🏢", "🏪", "🏬", "🏭", "🏗️", "📦", "📮",
  // Package/Delivery emojis
  "🎁", "📦", "📮", "🚚", "📬", "📭",
];

const initialFormState: Partial<ServiceConfig> = {
  serviceId: "",
  name: "",
  displayName: "",
  description: "",
  icon: "🚗",
  iconUrl: "",
  capacity: 4,
  displayOrder: 0,
  isActive: true,
  vehicleType: "four_wheeler",
  estimatedArrival: "5-10 mins",
  baseFare: 50,
  perKmRate: 15,
  perMinRate: 2,
  minimumFare: 60,
  cancellationFee: 25,
  maxDistance: 50,
  maxWaitTime: 10,
  category: "standard",
};

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const { services, stats, isLoading, error } = useAppSelector((state) => state.serviceConfig);
  
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceConfig>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getServicesList());
    dispatch(getServicesStats());
  }, [dispatch]);

  const handleOpenDialog = (service?: ServiceConfig) => {
    if (service) {
      setFormData(service);
      setSelectedService(service);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setSelectedService(null);
      setIsEditing(false);
    }
    setIconFile(null);
    setIconPreview(null);
    setIconPickerOpen(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.serviceId || !formData.name) {
      toast.error("Service ID and Name are required");
      return;
    }

    try {
      let savedService;
      if (isEditing && selectedService) {
        savedService = await dispatch(updateService({ id: selectedService.id.toString(), data: formData })).unwrap();
        toast.success("Service updated successfully");
      } else {
        savedService = await dispatch(createService(formData)).unwrap();
        toast.success("Service created successfully");
        
        // If icon file was selected for new service, upload it now
        if (iconFile && savedService?.id) {
          const uploadFormData = new FormData();
          uploadFormData.append('icon', iconFile);

          const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
          try {
            const uploadResponse = await fetch(`${config.API_BASE_URL}/api/admin/service-config/${savedService.id}/icon`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: uploadFormData,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              // Update the service with the icon URL
              await dispatch(updateService({ 
                id: savedService.id.toString(), 
                data: { iconUrl: uploadData.iconUrl, icon: "" } 
              })).unwrap();
              toast.success("Icon uploaded successfully");
            }
          } catch (uploadErr) {
            console.error('Icon upload failed:', uploadErr);
            // Don't fail the whole operation if icon upload fails
          }
        }
      }
      handleCloseDialog();
      dispatch(getServicesList());
      dispatch(getServicesStats());
    } catch (err: any) {
      toast.error(err || "Failed to save service");
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    
    try {
      await dispatch(deleteService(selectedService.id.toString())).unwrap();
      toast.success("Service deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedService(null);
      dispatch(getServicesStats());
    } catch (err: any) {
      toast.error(err || "Failed to delete service");
    }
  };

  const handleToggleStatus = async (service: ServiceConfig) => {
    try {
      await dispatch(toggleServiceStatus({ id: service.id.toString(), active: !service.isActive })).unwrap();
      toast.success(`Service ${!service.isActive ? "activated" : "deactivated"}`);
      dispatch(getServicesStats());
    } catch (err: any) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const result = await dispatch(seedDefaultServices()).unwrap();
      toast.success(`Created ${result.created} services, skipped ${result.skipped} existing`);
      dispatch(getServicesList());
      dispatch(getServicesStats());
    } catch (err: any) {
      toast.error(err || "Failed to seed defaults");
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData({ ...formData, icon, iconUrl: "" }); // Clear iconUrl when selecting emoji
    setIconPickerOpen(false);
  };

  const handleIconFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setIconFile(file);
      // Preview the image (but don't store base64 in iconUrl - it's too long)
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store preview URL separately, not in formData.iconUrl
        setIconPreview(e.target?.result as string);
        // Clear emoji icon when file is selected
        setFormData({ ...formData, icon: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconUpload = async () => {
    if (!iconFile) {
      toast.error('Please select an icon file');
      return;
    }

    // For new services, we'll save the icon URL after creating the service
    if (!isEditing || !selectedService) {
      // Store the file to upload after service creation
      toast.info('Icon will be uploaded after service is created');
      return;
    }

    setUploadingIcon(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('icon', iconFile);

      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${config.API_BASE_URL}/api/admin/service-config/${selectedService.id}/icon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to upload icon');
      }

      const data = await response.json();
      setFormData({ ...formData, iconUrl: data.iconUrl, icon: "" });
      setIconPreview(null); // Clear preview after successful upload
      toast.success('Icon uploaded successfully');
      setIconFile(null);
      dispatch(getServicesList());
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload icon');
    } finally {
      setUploadingIcon(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (tabValue === 1) return s.isActive;
    if (tabValue === 2) return !s.isActive;
    return true;
  });

  const safeServices = Array.isArray(filteredServices) ? filteredServices : [];

  if (isLoading && safeServices.length === 0) {
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
            🚗 Service Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ride services - Car, Bike, Auto, Premium, etc.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleSeedDefaults}
          >
            Seed Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: "#120E43" }}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Services</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "4px solid #10B981" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Active</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "4px solid #EF4444" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Inactive</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">{stats.inactive}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Inactive (${stats.inactive})`} />
        </Tabs>
      </Paper>

      {/* Services Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>Icon</TableCell>
              <TableCell>Service ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Vehicle Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Base Fare</TableCell>
              <TableCell>Per KM</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CarIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                  <Typography color="text.secondary">
                    No services found. Click "Seed Defaults" to add default services.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              safeServices.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell>
                    {service.iconUrl ? (
                      <img 
                        src={service.iconUrl} 
                        alt={service.name} 
                        style={{ width: 32, height: 32, objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography fontSize={32}>{service.icon || '🚗'}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={service.serviceId} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{service.displayName || service.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {service.description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={service.vehicleType?.replace("_", " ")} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{service.capacity} persons</TableCell>
                  <TableCell>₹{service.baseFare}</TableCell>
                  <TableCell>₹{service.perKmRate}/km</TableCell>
                  <TableCell>
                    <Switch
                      checked={service.isActive}
                      onChange={() => handleToggleStatus(service)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setSelectedService(service);
                        handleOpenDialog(service);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedService(service);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? "Edit Service" : "Add New Service"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service ID"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value.toUpperCase() })}
                disabled={isEditing}
                placeholder="e.g., BIKE, CAR, AUTO"
                helperText="Unique identifier (cannot be changed)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bike Taxi"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Shown to users"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Box>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ImageIcon />}
                      onClick={() => setIconPickerOpen(!iconPickerOpen)}
                      sx={{ flex: 1 }}
                    >
                      {formData.icon ? `Selected: ${formData.icon}` : formData.iconUrl ? 'Custom Icon' : 'Select Icon'}
                    </Button>
                    <input
                      accept="image/png,image/jpeg,image/jpg"
                      style={{ display: 'none' }}
                      id="icon-upload"
                      type="file"
                      onChange={handleIconFileSelect}
                    />
                    <label htmlFor="icon-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload PNG
                      </Button>
                    </label>
                  </Box>
                  
                  {/* Icon Preview */}
                  {(formData.icon || formData.iconUrl || iconPreview) && (
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1} 
                      p={1} 
                      sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        bgcolor: '#f9f9f9',
                        mb: 1
                      }}
                    >
                      {iconPreview ? (
                        <img 
                          src={iconPreview} 
                          alt="Icon preview" 
                          style={{ width: 32, height: 32, objectFit: 'contain' }}
                        />
                      ) : formData.iconUrl ? (
                        <img 
                          src={formData.iconUrl} 
                          alt="Icon preview" 
                          style={{ width: 32, height: 32, objectFit: 'contain' }}
                        />
                      ) : (
                        <Typography fontSize={32}>{formData.icon}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {iconPreview ? 'New icon (not uploaded yet)' : formData.iconUrl ? 'Uploaded icon' : 'Current icon'}
                      </Typography>
                    </Box>
                  )}

                  {/* Icon Picker Grid */}
                  {iconPickerOpen && (
                    <Paper 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        maxHeight: 300, 
                        overflow: 'auto',
                        border: '1px solid #ddd'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Select an icon:
                      </Typography>
                      <Box 
                        display="grid" 
                        gridTemplateColumns="repeat(8, 1fr)" 
                        gap={1}
                        sx={{ mt: 1 }}
                      >
                        {ICONS.map((icon) => (
                          <Box
                            key={icon}
                            onClick={() => handleIconSelect(icon)}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              borderRadius: 1,
                              border: formData.icon === icon ? '2px solid #1976d2' : '1px solid #ddd',
                              bgcolor: formData.icon === icon ? '#e3f2fd' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                                borderColor: '#1976d2',
                              },
                            }}
                          >
                            {icon}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  )}

                  {/* Upload button for existing services */}
                  {isEditing && selectedService && iconFile && (
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={handleIconUpload}
                      disabled={uploadingIcon}
                      startIcon={uploadingIcon ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      {uploadingIcon ? 'Uploading...' : 'Upload Icon Now'}
                    </Button>
                  )}
                  
                  {/* Info for new services */}
                  {!isEditing && iconFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Icon will be uploaded when you create the service
                    </Typography>
                  )}
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                placeholder="Brief description of this service"
              />
            </Grid>

            {/* Vehicle Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Vehicle Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicleType}
                  label="Vehicle Type"
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  {VEHICLE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                InputProps={{ endAdornment: <InputAdornment position="end">persons</InputAdornment> }}
              />
            </Grid>

            {/* Fare Configuration */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Fare Configuration
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Base Fare"
                value={formData.baseFare}
                onChange={(e) => setFormData({ ...formData, baseFare: parseFloat(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Per KM Rate"
                value={formData.perKmRate}
                onChange={(e) => setFormData({ ...formData, perKmRate: parseFloat(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Per Minute Rate"
                value={formData.perMinRate}
                onChange={(e) => setFormData({ ...formData, perMinRate: parseFloat(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Fare"
                value={formData.minimumFare}
                onChange={(e) => setFormData({ ...formData, minimumFare: parseFloat(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>

            {/* Additional Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Additional Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estimated Arrival"
                value={formData.estimatedArrival}
                onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                placeholder="e.g., 5-10 mins"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Cancellation Fee"
                value={formData.cancellationFee}
                onChange={(e) => setFormData({ ...formData, cancellationFee: parseFloat(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Display Order"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                helperText="Lower = appears first"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active (visible to users)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#120E43" }}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedService?.displayName || selectedService?.name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Users will no longer see this service.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

