"use client";
import { West, Person, Phone, Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Box, 
  InputAdornment, 
  IconButton 
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { sx } from "@/utils/constants";
import toast from "react-hot-toast";
import { registerUser } from "@/utils/reducers/authReducers";
import { CircularProgressBar } from "../CustomLoader";

const validationSchema = yup.object().shape({
  fullName: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .notOneOf(["ride@fast.com"], "This email is not allowed"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
});

function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const goBack = () => {
    router.back();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      fullName: "",
      mobile: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setRegisterError("");
      const { email, password, mobile, fullName } = values;
      if (formik.isValid) {
        try {
          const response = await dispatch(
            registerUser({ email, password, mobile, fullName })
          );
          if (response.payload.error) {
            setRegisterError(response.payload.message || "Registration failed");
            toast.error(response.payload.message);
          } else if (response.payload === "Internal Server Error") {
            setRegisterError("Internal server error. Please try again.");
            toast.error(response.payload);
          } else {
            toast.success(
              response.payload.message || "Registered Successfully"
            );
            router.push("/login");
          }
        } catch (error) {
          setRegisterError("An unexpected error occurred. Please try again.");
          toast.error("An error occurred while registering");
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-8">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Person className="text-white text-2xl" />
            </div>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
              Create Account
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Join RideFast and start your journey
            </Typography>
          </div>

          {registerError && (
            <Alert severity="error" className="mb-4">
              {registerError}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <TextField
              label="Full Name"
              name="fullName"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="John Doe"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...sx,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />

            <TextField
              label="Mobile Number"
              name="mobile"
              type="tel"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="9876543210"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...sx,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="john@email.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...sx,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Enter a strong password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...sx,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              size="large"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
            >
              {isLoading ? <CircularProgressBar /> : "Create Account"}
            </Button>
          </form>

          <Box className="text-center mt-6 space-y-3">
            <Button
              variant="outlined"
              fullWidth
              className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl"
              onClick={() => router.push("/driver/register")}
            >
              Register as a Driver
            </Button>
            
            <Typography variant="body2" className="text-gray-600">
              Already have an account?{" "}
              <Button
                variant="text"
                className="text-green-600 font-semibold normal-case"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterForm;
