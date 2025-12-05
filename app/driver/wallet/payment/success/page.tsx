"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function DriverPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const paymentId = searchParams.get("razorpay_payment_id");
  const paymentLinkId = searchParams.get("razorpay_payment_link_id");
  const paymentLinkStatus = searchParams.get("razorpay_payment_link_status");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (paymentId && paymentLinkStatus === "paid") {
        setStatus("success");
        setMessage("Your driver wallet has been topped up successfully!");
      } else if (paymentId) {
        setStatus("success");
        setMessage("Payment received! Your wallet will be updated shortly.");
      } else {
        setStatus("error");
        setMessage("Payment verification failed. Please contact support.");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [paymentId, paymentLinkStatus]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={60} sx={{ color: "#10B981", mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Payment...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we confirm your payment.
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: "#10B981", mb: 2 }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold" color="#10B981">
              Payment Successful!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            
            {paymentId && (
              <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Payment ID:</strong> {paymentId}
                </Typography>
                {paymentLinkId && (
                  <Typography variant="body2">
                    <strong>Reference:</strong> {paymentLinkId.substring(0, 20)}...
                  </Typography>
                )}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can close this window and return to the app.
            </Typography>

            <Button
              variant="contained"
              onClick={() => window.close()}
              sx={{
                bgcolor: "#10B981",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Close Window
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon
              sx={{ fontSize: 80, color: "#EF4444", mb: 2 }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold" color="#EF4444">
              Payment Failed
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>

            <Button
              variant="contained"
              onClick={() => window.close()}
              sx={{
                bgcolor: "#EF4444",
                "&:hover": { bgcolor: "#DC2626" },
              }}
            >
              Close Window
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

