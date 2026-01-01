"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import adminAxios from "@/utils/axiosConfig";
import { config } from "@/utils/config";
import { adminPricingTiersByServiceUrl, adminPricingTiersUrl, adminPricingTiersBulkUpdateUrl } from "@/utils/apiRoutes";

interface PricingTier {
  id?: number;
  serviceType: "BIKE" | "MEGA" | "SMALL_SEDAN" | "CAR";
  distanceFromKm: number;
  distanceToKm: number | null; // null means "above this"
  ratePerKm: number;
  baseFare: number | null; // Only for 0-2km tier
  displayOrder: number;
  isActive: boolean;
}

const SERVICE_TYPES = [
  { value: "BIKE", label: "🏍️ Bike" },
  { value: "MEGA", label: "🛺 Auto (Three Wheeler)" }, // MEGA = AUTO in backend
  { value: "SMALL_SEDAN", label: "🚙 Small Sedan" },
  { value: "CAR", label: "🚗 Car" },
];

type ServiceTypeValue = "BIKE" | "MEGA" | "SMALL_SEDAN" | "CAR";

export default function TieredPricingManagement() {
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeValue>("BIKE");
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Store tiers for all service types
  const [allTiers, setAllTiers] = useState<{
    BIKE: PricingTier[];
    MEGA: PricingTier[];
    SMALL_SEDAN: PricingTier[];
    CAR: PricingTier[];
  }>({
    BIKE: [],
    MEGA: [],
    SMALL_SEDAN: [],
    CAR: [],
  });

  // Default tiers (MEGA = AUTO/Three Wheeler in backend)
  const defaultTiers: Record<ServiceTypeValue, PricingTier[]> = {
    BIKE: [
      { serviceType: "BIKE", distanceFromKm: 0, distanceToKm: 2, ratePerKm: 0, baseFare: 25, displayOrder: 1, isActive: true },
      { serviceType: "BIKE", distanceFromKm: 2, distanceToKm: 6, ratePerKm: 8, baseFare: null, displayOrder: 2, isActive: true },
      { serviceType: "BIKE", distanceFromKm: 6, distanceToKm: 8, ratePerKm: 9, baseFare: null, displayOrder: 3, isActive: true },
      { serviceType: "BIKE", distanceFromKm: 8, distanceToKm: null, ratePerKm: 10, baseFare: null, displayOrder: 4, isActive: true },
    ],
    MEGA: [ // MEGA = AUTO (Three Wheeler) - backend uses MEGA enum
      { serviceType: "MEGA", distanceFromKm: 0, distanceToKm: 2, ratePerKm: 0, baseFare: 45, displayOrder: 1, isActive: true },
      { serviceType: "MEGA", distanceFromKm: 2, distanceToKm: 6, ratePerKm: 15, baseFare: null, displayOrder: 2, isActive: true },
      { serviceType: "MEGA", distanceFromKm: 6, distanceToKm: 8, ratePerKm: 16, baseFare: null, displayOrder: 3, isActive: true },
      { serviceType: "MEGA", distanceFromKm: 8, distanceToKm: null, ratePerKm: 18, baseFare: null, displayOrder: 4, isActive: true },
    ],
    SMALL_SEDAN: [
      { serviceType: "SMALL_SEDAN", distanceFromKm: 0, distanceToKm: 2, ratePerKm: 0, baseFare: 75, displayOrder: 1, isActive: true },
      { serviceType: "SMALL_SEDAN", distanceFromKm: 2, distanceToKm: 6, ratePerKm: 18, baseFare: null, displayOrder: 2, isActive: true },
      { serviceType: "SMALL_SEDAN", distanceFromKm: 6, distanceToKm: 8, ratePerKm: 20, baseFare: null, displayOrder: 3, isActive: true },
      { serviceType: "SMALL_SEDAN", distanceFromKm: 8, distanceToKm: null, ratePerKm: 22, baseFare: null, displayOrder: 4, isActive: true },
    ],
    CAR: [
      { serviceType: "CAR", distanceFromKm: 0, distanceToKm: 2, ratePerKm: 0, baseFare: 75, displayOrder: 1, isActive: true },
      { serviceType: "CAR", distanceFromKm: 2, distanceToKm: 6, ratePerKm: 18, baseFare: null, displayOrder: 2, isActive: true },
      { serviceType: "CAR", distanceFromKm: 6, distanceToKm: 8, ratePerKm: 20, baseFare: null, displayOrder: 3, isActive: true },
      { serviceType: "CAR", distanceFromKm: 8, distanceToKm: null, ratePerKm: 22, baseFare: null, displayOrder: 4, isActive: true },
    ],
  };

  useEffect(() => {
    fetchAllTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Update current tiers when service type changes
    setTiers(allTiers[selectedServiceType]);
  }, [selectedServiceType, allTiers]);

  const fetchAllTiers = async () => {
    setLoading(true);
    try {
      // Fetch tiers for all service types (MEGA = AUTO in backend)
      const [bikeResponse, megaResponse, sedanResponse, carResponse] = await Promise.all([
        adminAxios.get(adminPricingTiersByServiceUrl("BIKE")).catch(() => ({ data: [] })),
        adminAxios.get(adminPricingTiersByServiceUrl("MEGA")).catch(() => ({ data: [] })),
        adminAxios.get(adminPricingTiersByServiceUrl("SMALL_SEDAN")).catch(() => ({ data: [] })),
        adminAxios.get(adminPricingTiersByServiceUrl("CAR")).catch(() => ({ data: [] })),
      ]);

      const updatedTiers: {
        BIKE: PricingTier[];
        MEGA: PricingTier[];
        SMALL_SEDAN: PricingTier[];
        CAR: PricingTier[];
      } = {
        BIKE: bikeResponse.data && bikeResponse.data.length > 0 ? bikeResponse.data : defaultTiers.BIKE,
        MEGA: megaResponse.data && megaResponse.data.length > 0 ? megaResponse.data : defaultTiers.MEGA,
        SMALL_SEDAN: sedanResponse.data && sedanResponse.data.length > 0 ? sedanResponse.data : defaultTiers.SMALL_SEDAN,
        CAR: carResponse.data && carResponse.data.length > 0 ? carResponse.data : defaultTiers.CAR,
      };

      setAllTiers(updatedTiers);
      setTiers(updatedTiers[selectedServiceType]);
    } catch (error: any) {
      console.error("Error fetching tiers:", error);
      // On error, use default tiers
      setAllTiers(defaultTiers);
      setTiers(defaultTiers[selectedServiceType]);
      toast.error("Using default pricing tiers. Please configure them.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const response = await adminAxios.get(adminPricingTiersByServiceUrl(selectedServiceType));
      if (response.data && response.data.length > 0) {
        const updatedTiers = { ...allTiers, [selectedServiceType]: response.data };
        setAllTiers(updatedTiers);
        setTiers(response.data);
      } else {
        // If no tiers exist, use defaults
        const updatedTiers = { ...allTiers, [selectedServiceType]: defaultTiers[selectedServiceType] };
        setAllTiers(updatedTiers);
        setTiers(defaultTiers[selectedServiceType]);
      }
    } catch (error: any) {
      console.error("Error fetching tiers:", error);
      // On error, use default tiers
      const updatedTiers = { ...allTiers, [selectedServiceType]: defaultTiers[selectedServiceType] };
      setAllTiers(updatedTiers);
      setTiers(defaultTiers[selectedServiceType]);
      toast.error("Using default pricing tiers. Please configure them.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    setEditingTier({
      serviceType: selectedServiceType,
      distanceFromKm: 0,
      distanceToKm: null,
      ratePerKm: 0,
      baseFare: null,
      displayOrder: tiers.length + 1,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditTier = (tier: PricingTier) => {
    setEditingTier({ ...tier });
    setIsDialogOpen(true);
  };

  const handleDeleteTier = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this pricing tier?")) {
      return;
    }
    try {
      await adminAxios.delete(`${adminPricingTiersUrl}/${id}`);
      toast.success("Tier deleted successfully");
      fetchTiers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete tier");
    }
  };

  const handleSaveTier = async () => {
    if (!editingTier) return;

    // Validation
    if (editingTier.distanceFromKm < 0) {
      toast.error("Distance from must be 0 or greater");
      return;
    }
    if (editingTier.distanceToKm !== null && editingTier.distanceToKm <= editingTier.distanceFromKm) {
      toast.error("Distance to must be greater than distance from");
      return;
    }
    if (editingTier.ratePerKm < 0) {
      toast.error("Rate per km must be 0 or greater");
      return;
    }
    if (editingTier.distanceFromKm === 0 && editingTier.baseFare === null) {
      toast.error("Base fare is required for 0-2km tier");
      return;
    }

    setIsSaving(true);
    try {
      await adminAxios.post(adminPricingTiersUrl, editingTier);
      toast.success("Pricing tier saved successfully");
      setIsDialogOpen(false);
      setEditingTier(null);
      fetchTiers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save tier");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (tiers.length === 0) {
      toast.error("No tiers to save");
      return;
    }

    setIsSaving(true);
    try {
      await adminAxios.put(adminPricingTiersBulkUpdateUrl(selectedServiceType), tiers);
      const updatedTiers = { ...allTiers, [selectedServiceType]: tiers };
      setAllTiers(updatedTiers);
      toast.success(`${selectedServiceType} pricing tiers updated successfully`);
      fetchTiers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update tiers");
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceTypeChange = (newType: ServiceTypeValue) => {
    setSelectedServiceType(newType);
    setTiers(allTiers[newType]);
  };

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    const updatedTiers = [...tiers];
    (updatedTiers[index] as any)[field] = value;
    setTiers(updatedTiers);
  };

  const formatDistanceRange = (tier: PricingTier): string => {
    if (tier.distanceFromKm === 0 && tier.distanceToKm === 2) {
      return "0-2 km";
    }
    if (tier.distanceToKm === null) {
      return `Above ${tier.distanceFromKm} km`;
    }
    return `${tier.distanceFromKm}-${tier.distanceToKm} km`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" className="font-bold mb-4">
        💰 Tiered Pricing Management
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Configure tiered kilometer-based pricing rates for local rides. Rates vary by distance range.
      </Typography>

      {/* Service Type Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-3">
            Service Types - Select to Configure Tiered Pricing
          </Typography>
          {/* Use buttons instead of Tabs to avoid SSR issues with Material-UI Tabs */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, pb: 2, borderBottom: 1, borderColor: "divider", flexWrap: "wrap" }}>
            {SERVICE_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={selectedServiceType === type.value ? "contained" : "outlined"}
                onClick={() => handleServiceTypeChange(type.value as ServiceTypeValue)}
                sx={{ 
                  textTransform: "none",
                  position: "relative"
                }}
                startIcon={
                  allTiers[type.value as keyof typeof allTiers]?.length > 0 ? (
                    <Chip
                      label={`${allTiers[type.value as keyof typeof allTiers].length} tiers`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  ) : undefined
                }
              >
                {type.label}
              </Button>
            ))}
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Current Service:</strong> {SERVICE_TYPES.find(t => t.value === selectedServiceType)?.label}
            <br />
            Configure distance-based rates for <strong>{selectedServiceType}</strong> rides. Base fare applies to 0-2km range.
            <br />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              💡 <strong>All service types available:</strong> Click on the tabs above (🏍️ Bike, 🛺 Auto, 🚙 Small Sedan, 🚗 Car) to switch between and configure pricing for each service type.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Tiers Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" className="font-semibold">
              Pricing Tiers for {selectedServiceType}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTier}
                sx={{ mr: 1 }}
              >
                Add Tier
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleBulkSave}
                disabled={isSaving || loading}
                color="primary"
              >
                {isSaving ? "Saving..." : "Save All Changes"}
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography>Loading pricing tiers...</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell className="font-semibold">Distance Range</TableCell>
                    <TableCell className="font-semibold">Base Fare (₹)</TableCell>
                    <TableCell className="font-semibold">Rate per KM (₹)</TableCell>
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell align="right" className="font-semibold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiers.map((tier, index) => (
                    <TableRow key={tier.id || index} hover>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={tier.distanceFromKm}
                          onChange={(e) => handleTierChange(index, "distanceFromKm", parseFloat(e.target.value) || 0)}
                          sx={{ width: 80, mr: 1 }}
                        />
                        <span> - </span>
                        <TextField
                          size="small"
                          type="number"
                          value={tier.distanceToKm || ""}
                          onChange={(e) => handleTierChange(index, "distanceToKm", e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="∞"
                          sx={{ width: 80, ml: 1 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDistanceRange(tier)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {tier.distanceFromKm === 0 ? (
                          <TextField
                            size="small"
                            type="number"
                            value={tier.baseFare || ""}
                            onChange={(e) => handleTierChange(index, "baseFare", e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="Base fare"
                            sx={{ width: 120 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ step: "0.01" }}
                          value={tier.ratePerKm}
                          onChange={(e) => handleTierChange(index, "ratePerKm", parseFloat(e.target.value) || 0)}
                          placeholder="Rate/km"
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tier.isActive ? "Active" : "Inactive"}
                          color={tier.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditTier(tier)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {tier.id && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTier(tier.id!)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tiers.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No pricing tiers configured. Click "Add Tier" to create one.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTier?.id ? "Edit Pricing Tier" : "Add New Pricing Tier"}
        </DialogTitle>
        <DialogContent>
          {editingTier && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Distance From (km)"
                type="number"
                value={editingTier.distanceFromKm}
                onChange={(e) => setEditingTier({ ...editingTier, distanceFromKm: parseFloat(e.target.value) || 0 })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Distance To (km) - Leave empty for 'above'"
                type="number"
                value={editingTier.distanceToKm || ""}
                onChange={(e) => setEditingTier({ ...editingTier, distanceToKm: e.target.value ? parseFloat(e.target.value) : null })}
                margin="normal"
                helperText="Leave empty to indicate 'above this distance'"
              />
              {editingTier.distanceFromKm === 0 && (
                <TextField
                  fullWidth
                  label="Base Fare (₹)"
                  type="number"
                  value={editingTier.baseFare || ""}
                  onChange={(e) => setEditingTier({ ...editingTier, baseFare: e.target.value ? parseFloat(e.target.value) : null })}
                  margin="normal"
                  required
                  helperText="Base fare for 0-2km range"
                />
              )}
              <TextField
                fullWidth
                label="Rate per KM (₹)"
                type="number"
                inputProps={{ step: "0.01" }}
                value={editingTier.ratePerKm}
                onChange={(e) => setEditingTier({ ...editingTier, ratePerKm: parseFloat(e.target.value) || 0 })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={editingTier.displayOrder}
                onChange={(e) => setEditingTier({ ...editingTier, displayOrder: parseInt(e.target.value) || 0 })}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTier}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
