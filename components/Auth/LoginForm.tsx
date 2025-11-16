"use client";
import { sx } from "@/utils/constants";
import {
  driverProfile,
  loginUser,
  userProfile,
} from "@/utils/reducers/authReducers";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { West, Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import {
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";
import { CircularProgressBar } from "../CustomLoader";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: yup.string().oneOf(["DRIVER", "NORMAL_USER"], "Please select a valid role"),
});

function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

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
      role: "NORMAL_USER",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoginError("");
      const { email, password, role } = values;
      if (formik.isValid) {
        try {
          const response = await dispatch(loginUser({ email, password, role }));
          if (response.payload.error) {
            setLoginError(response.payload.message || "Login failed");
            toast.error(response.payload.message);
          } else if (response.payload === "Internal Server Error") {
            setLoginError("Internal server error. Please try again.");
            toast.error(response.payload);
          } else {
            toast.success(response.payload.message || "Login successful");
          }
        } catch (error) {
          setLoginError("An unexpected error occurred. Please try again.");
          toast.error("An error occurred while logging in");
        }
      }
    },
  });

  const auth = useAppSelector((store) => store.auth);
  useEffect(() => {
    const checkAuthorized = async () => {
      try {
        let response = null;
        if (auth.role && auth.token) {
          if (auth.role === "DRIVER") {
            response = await dispatch(driverProfile(auth.token));
            if (response.payload?.code !== 401) {
              router.replace("/driver/dashboard");
            }
          } else if (auth.role === "NORMAL_USER") {
            dispatch(userProfile(auth.token)).then((response) => {
              if (response.payload.email === "ride@fast.com") {
                router.replace("/company");
              } else if (response.payload?.code !== 401) {
                router.replace("/bookRide");
              }
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkAuthorized();
  }, [auth.token, auth.role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Person className="text-white text-2xl" />
            </div>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
              Welcome Back
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Sign in to your Gauva account
            </Typography>
          </div>

          {loginError && (
            <Alert severity="error" className="mb-4">
              {loginError}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <TextField
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@email.com"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              variant="outlined"
              fullWidth
              margin="normal"
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

            <FormControl component="fieldset" margin="normal" fullWidth>
              <FormLabel component="legend" className="text-gray-700 font-medium">
                Select Account Type
              </FormLabel>
              <RadioGroup
                row
                aria-label="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                className="justify-center mt-2"
              >
                <FormControlLabel
                  value="NORMAL_USER"
                  control={<Radio sx={{ color: "blue" }} />}
                  label="User"
                  className="mr-8"
                />
                <FormControlLabel
                  value="DRIVER"
                  control={<Radio sx={{ color: "blue" }} />}
                  label="Driver"
                />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              type="submit"
              fullWidth
              size="large"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
            >
              {isLoading ? <CircularProgressBar /> : "Sign In"}
            </Button>
          </form>

          <Box className="text-center mt-6">
            <Typography variant="body2" className="text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="text"
                className="text-blue-600 font-semibold normal-case"
                onClick={() => router.push("/register")}
              >
                Create Account
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
