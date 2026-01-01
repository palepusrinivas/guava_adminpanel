"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import adminAxios from "@/utils/axiosConfig";

const SERVICE_TYPES = ["BIKE", "CAR", "MEGA", "SMALL_SEDAN"];

interface DiagnosticData {
  serviceType: string;
  status: string;
  issues: string[];
  recommendations: string[];
  serviceConfig?: {
    id: number;
    serviceId: string;
    name: string;
    isActive: boolean;
    // Note: Pricing fields (baseFare, perKmRate, perMinRate) removed - pricing is now managed through PricingTiers
  };
  pricingProfile?: {
    id: number;
    name: string;
    active: boolean;
    baseFare: number;
    perKmRate: number;
    timeRatePerMin: number;
  };
  pricingTiers?: Array<{
    id: number;
    distanceFromKm: number;
    distanceToKm?: number;
    baseFare: number;
    ratePerKm: number;
    isActive: boolean;
  }>;
  tierCount?: number;
  vehicleCategory?: {
    id: string;
    type: string;
    name: string;
  };
  tripFareCount?: number;
}

export default function PricingStatus() {
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagnosticData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    const results: Record<string, DiagnosticData> = {};

    try {
      for (const serviceType of SERVICE_TYPES) {
        try {
          const response = await adminAxios.get(`/api/admin/pricing/diagnostic/service/${serviceType}`);
          results[serviceType] = response.data;
        } catch (err: any) {
          results[serviceType] = {
            serviceType,
            status: "ERROR",
            issues: [`Failed to fetch diagnostic: ${err.message}`],
            recommendations: ["Check API endpoint and network connection"],
          };
        }
      }
      setDiagnostics(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch pricing diagnostics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const toggleRow = (serviceType: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(serviceType)) {
      newExpanded.delete(serviceType);
    } else {
      newExpanded.add(serviceType);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusChip = (status: string, issuesCount: number) => {
    if (status === "OK") {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="OK"
          color="success"
          size="small"
        />
      );
    } else if (status === "ERROR") {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="ERROR"
          color="error"
          size="small"
        />
      );
    } else {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`${issuesCount} Issue${issuesCount > 1 ? "s" : ""}`}
          color="warning"
          size="small"
        />
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Pricing Configuration Status
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDiagnostics}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Service Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Service Config</TableCell>
              <TableCell>Base Fare</TableCell>
              <TableCell>Per Km Rate</TableCell>
              <TableCell>Time Rate</TableCell>
              <TableCell>Tiers</TableCell>
              <TableCell>Zone Pricing</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SERVICE_TYPES.map((serviceType) => {
              const diagnostic = diagnostics[serviceType];
              if (!diagnostic) return null;

              const isExpanded = expandedRows.has(serviceType);
              const serviceConfig = diagnostic.serviceConfig;
              const issuesCount = diagnostic.issues?.length || 0;

              return (
                <React.Fragment key={serviceType}>
                  <TableRow hover>
                    <TableCell>
                      <Typography fontWeight="medium">{serviceType}</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(diagnostic.status, issuesCount)}</TableCell>
                    <TableCell>
                      {serviceConfig ? (
                        <Chip
                          label={serviceConfig.isActive ? "Active" : "Inactive"}
                          color={serviceConfig.isActive ? "success" : "default"}
                          size="small"
                        />
                      ) : (
                        <Chip label="Not Found" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary" variant="caption">
                        Pricing managed via Tiers
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary" variant="caption">
                        Pricing managed via Tiers
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary" variant="caption">
                        Pricing managed via Tiers
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {diagnostic.tierCount !== undefined ? (
                        <Chip
                          label={`${diagnostic.tierCount} tier${diagnostic.tierCount !== 1 ? "s" : ""}`}
                          size="small"
                          color={diagnostic.tierCount > 0 ? "success" : "error"}
                        />
                      ) : (
                        <Typography color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {diagnostic.vehicleCategory ? (
                        <Chip
                          label={`${diagnostic.tripFareCount || 0} zone${(diagnostic.tripFareCount || 0) !== 1 ? "s" : ""}`}
                          size="small"
                          color={(diagnostic.tripFareCount || 0) > 0 ? "info" : "default"}
                        />
                      ) : (
                        <Chip label="Not Configured" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(serviceType)}
                        disabled={issuesCount === 0 && !diagnostic.recommendations?.length}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 2, backgroundColor: "#fafafa" }}>
                        <Grid container spacing={2}>
                          {diagnostic.issues && diagnostic.issues.length > 0 && (
                            <Grid item xs={12}>
                              <Alert severity="warning" sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Issues Found:
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                  {diagnostic.issues.map((issue, idx) => (
                                    <li key={idx}>
                                      <Typography variant="body2">{issue}</Typography>
                                    </li>
                                  ))}
                                </ul>
                              </Alert>
                            </Grid>
                          )}
                          {diagnostic.recommendations && diagnostic.recommendations.length > 0 && (
                            <Grid item xs={12}>
                              <Alert severity="info">
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Recommendations:
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                  {diagnostic.recommendations.map((rec, idx) => (
                                    <li key={idx}>
                                      <Typography variant="body2">{rec}</Typography>
                                    </li>
                                  ))}
                                </ul>
                              </Alert>
                            </Grid>
                          )}
                          {serviceConfig && (
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Service Config Details
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>ID:</strong> {serviceConfig.id}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Name:</strong> {serviceConfig.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Active:</strong> {serviceConfig.isActive ? "Yes" : "No"}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                    <strong>Note:</strong> Pricing is now managed through PricingTiers (Tiered Pricing Management)
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                          {diagnostic.pricingTiers && diagnostic.pricingTiers.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Pricing Tiers ({diagnostic.pricingTiers.length})
                                  </Typography>
                                  {diagnostic.pricingTiers.map((tier, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                      {tier.distanceFromKm}km - {tier.distanceToKm || "∞"}km: ₹
                                      {tier.ratePerKm}/km
                                    </Typography>
                                  ))}
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                          {diagnostic.vehicleCategory && (
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Vehicle Category
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Name:</strong> {diagnostic.vehicleCategory.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Type:</strong> {diagnostic.vehicleCategory.type}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Zone Overrides:</strong> {diagnostic.tripFareCount || 0}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
