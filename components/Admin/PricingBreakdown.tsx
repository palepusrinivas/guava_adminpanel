"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material";

interface PricingBreakdownProps {
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    platformFee: number;
    gst: number;
    commission: number;
    nightSurcharge: number;
    subtotal: number;
    discount: number;
    finalTotal: number;
    breakdownText?: string;
  };
  currency?: string;
  isNightTime?: boolean;
  distanceKm?: number;
  durationMin?: number;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  breakdown,
  currency = "₹",
  isNightTime = false,
  distanceKm,
  durationMin,
}) => {
  const rows = [
    {
      label: "Base Fare",
      value: breakdown.baseFare,
      description: "Fixed charge for the ride",
    },
    {
      label: "Distance Fare",
      value: breakdown.distanceFare,
      description: distanceKm ? `${distanceKm.toFixed(2)} km` : "Distance based",
    },
    {
      label: "Time Fare",
      value: breakdown.timeFare,
      description: durationMin ? `${durationMin} minutes` : "Time based",
    },
  ];

  // Add platform fee if applicable
  if (breakdown.platformFee > 0) {
    rows.push({
      label: "Platform Fee",
      value: breakdown.platformFee,
      description: "Service charge",
    });
  }

  // Add night surcharge if applicable
  if (breakdown.nightSurcharge > 0) {
    rows.push({
      label: "Night Surcharge",
      value: breakdown.nightSurcharge,
      description: isNightTime ? "Night time charge" : "",
    });
  }

  // Add GST if applicable
  if (breakdown.gst > 0) {
    rows.push({
      label: "GST",
      value: breakdown.gst,
      description: "Tax",
    });
  }

  // Subtotal
  rows.push({
    label: "Subtotal",
    value: breakdown.subtotal,
    description: "",
    isSubtotal: true,
  });

  // Discount if applicable
  if (breakdown.discount > 0) {
    rows.push({
      label: "Discount",
      value: -breakdown.discount,
      description: "Applied discount",
      isDiscount: true,
    });
  }

  // Commission (for admin view only - not charged to customer)
  if (breakdown.commission > 0) {
    rows.push({
      label: "Commission (Driver)",
      value: breakdown.commission,
      description: "Platform commission (not added to fare)",
      isInfo: true,
    });
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom className="font-semibold">
          💰 Price Breakdown
        </Typography>
        <Divider sx={{ my: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell className="font-semibold">Component</TableCell>
                <TableCell align="right" className="font-semibold">
                  Amount
                </TableCell>
                <TableCell className="font-semibold">Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor:
                      row.isSubtotal || row.isDiscount
                        ? "#f5f5f5"
                        : row.isInfo
                        ? "#f0f9ff"
                        : "transparent",
                    "&:last-child td": { border: 0 },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      className={
                        row.isSubtotal || row.isDiscount
                          ? "font-semibold"
                          : ""
                      }
                    >
                      {row.label}
                      {row.isInfo && (
                        <Chip
                          label="Info"
                          size="small"
                          color="info"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      className={
                        row.isSubtotal || row.isDiscount
                          ? "font-semibold"
                          : row.isDiscount
                          ? "text-green-600"
                          : ""
                      }
                    >
                      {row.value < 0 ? "-" : ""}
                      {currency}
                      {Math.abs(row.value).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {row.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{
                  backgroundColor: "#e3f2fd",
                  "& td": { borderTop: "2px solid #1976d2" },
                }}
              >
                <TableCell>
                  <Typography variant="body1" className="font-bold">
                    Final Total
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" className="font-bold text-blue-600">
                    {currency}
                    {breakdown.finalTotal.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    Amount to be paid
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {breakdown.breakdownText && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "#f9fafb", borderRadius: 1 }}>
            <Typography variant="caption" className="text-gray-600">
              <strong>Breakdown:</strong> {breakdown.breakdownText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingBreakdown;
