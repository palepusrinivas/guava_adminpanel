"use client";
import { West } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, FormHelperText } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { sx } from "@/utils/constants";
import toast from "react-hot-toast";
import { registerDriver, registerUser } from "@/utils/reducers/authReducers";
import { CircularProgressBar } from "../CustomLoader";

// Vehicle type options
const VEHICLE_TYPES = [
  { value: "two_wheeler", label: "Two Wheeler (Bike)" },
  { value: "three_wheeler", label: "Three Wheeler (Auto)" },
  { value: "four_wheeler", label: "Four Wheeler (Car)" },
  { value: "four_wheeler_premium", label: "Four Wheeler Premium" },
];

// Service type options
const SERVICE_TYPES = [
  { value: "BIKE", label: "BIKE" },
  { value: "MEGA", label: "MEGA" },
  { value: "SMALL_SEDAN", label: "SMALL_SEDAN" },
  { value: "CAR", label: "CAR" },
];

const validationSchema = yup.object().shape({
  // Required fields (as per backend)
  name: yup.string().required("Name is required"),
  mobile: yup.string().required("Mobile number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .notOneOf(["ride@fast.com"], "You cannot pick this email"),
  password: yup
    .string()
    .min(8, "Password should be at least 8 characters")
    .required("Password is required"),
  
  // Optional fields - License (as per backend documentation)
  licenseNumber: yup.string(),
  licenseState: yup.string(),
  licenseExpirationDate: yup.string(),
  
  // Optional fields - Vehicle (as per backend documentation)
  company: yup.string(),
  model: yup.string(),
  color: yup.string(),
  capacity: yup.number().min(1, "Capacity must be at least 1"),
  year: yup.number().min(1900, "Year must be after 1900").max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  licensePlate: yup.string(),
  vehicleType: yup.string(),
  serviceType: yup.string(),
  
  // Optional fields - Bank Details (as per backend documentation)
  accountHolderName: yup.string(),
  bankName: yup.string(),
  accountNumber: yup.string(),
  ifscCode: yup.string(),
  upiId: yup.string(),
});
function RegisterDriverForm() {
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  
  // Get location on component mount (optional, as per backend)
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location not available:", error.message);
          // Don't block - location is optional
        }
      );
    }
  }, []);
  
  const goBack = () => {
    router.back();
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      name: "",
      mobile: "",
      location: "",
      // License fields (optional)
      licenseNumber: "",
      licenseState: "",
      licenseExpirationDate: "",
      // Vehicle fields (optional)
      company: "",
      model: "",
      color: "",
      year: 0,
      capacity: 0,
      licensePlate: "",
      vehicleType: "",
      serviceType: "",
      // Bank details (optional)
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const {
        email,
        password,
        mobile,
        name,
        licenseExpirationDate,
        licenseNumber,
        licenseState,
        capacity,
        color,
        company,
        model,
        year,
        licensePlate,
        vehicleType,
        serviceType,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        upiId,
      } = values;
      
      if (formik.isValid) {
        // Build driver data according to backend DriverSignUpRequest structure
        const driverData: any = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          mobile: mobile.trim(),
        };
        
        // Add location if available (optional)
        if (location.latitude !== 0 && location.longitude !== 0) {
          driverData.latitude = location.latitude;
          driverData.longitude = location.longitude;
        }
        
        // Add license if provided (optional)
        if (licenseNumber && licenseNumber.trim() !== "") {
          driverData.license = {
            licenseNumber: licenseNumber.trim(),
            licenseState: licenseState?.trim() || "",
            licenseExpirationDate: licenseExpirationDate || null,
          };
        }
        
        // Add vehicle if provided (optional)
        if (licensePlate && licensePlate.trim() !== "") {
          const vehicle: any = {
            licensePlate: licensePlate.trim(),
          };
          
          if (company && company.trim() !== "") vehicle.company = company.trim();
          if (model && model.trim() !== "") vehicle.model = model.trim();
          if (color && color.trim() !== "") vehicle.color = color.trim();
          if (year && year > 0) vehicle.year = year;
          if (capacity && capacity > 0) vehicle.capacity = capacity;
          if (vehicleType && vehicleType.trim() !== "") vehicle.vehicleType = vehicleType.trim();
          if (serviceType && serviceType.trim() !== "") vehicle.serviceType = serviceType.trim();
          
          driverData.vehicle = vehicle;
        }
        
        // Add flat vehicle fields for Flutter compatibility (if vehicle type provided)
        if (vehicleType && vehicleType.trim() !== "") {
          driverData.vehicleType = vehicleType.trim();
        }
        if (serviceType && serviceType.trim() !== "") {
          driverData.serviceType = serviceType.trim();
        }
        if (licensePlate && licensePlate.trim() !== "") {
          driverData.vehicleNumber = licensePlate.trim();
          driverData.licensePlate = licensePlate.trim();
        }
        if (licenseNumber && licenseNumber.trim() !== "") {
          driverData.licenseNumber = licenseNumber.trim();
        }
        
        // Add bank details if provided (optional)
        if (accountHolderName && accountHolderName.trim() !== "") {
          driverData.accountHolderName = accountHolderName.trim();
        }
        if (bankName && bankName.trim() !== "") {
          driverData.bankName = bankName.trim();
        }
        if (accountNumber && accountNumber.trim() !== "") {
          driverData.accountNumber = accountNumber.trim();
        }
        if (ifscCode && ifscCode.trim() !== "") {
          driverData.ifscCode = ifscCode.trim();
        }
        if (upiId && upiId.trim() !== "") {
          driverData.upiId = upiId.trim();
        }
        
        try {
          const response = await dispatch(registerDriver(driverData));
          if (response.payload?.error) {
            toast.error(response.payload.message || "Registration failed");
          } else if (response.payload === "Internal Server Error") {
            toast.error("Internal Server Error");
          } else {
            toast.success(
              response.payload?.message || "Registered Successfully"
            );
            router.push("/login");
          }
        } catch (error: any) {
          toast.error(error?.message || "An error occurred while registering");
        }
      }
    },
  });

  return (
    <div className=" max-h-screen overflow-y-scroll">
      <div className="flex items-center px-2 lg:px-5 py-5 sticky top-0 z-10 bg-white">
        <West className="cursor-pointer" onClick={goBack} />
        <div className="w-full text-center">
          <h1 className="font-semibold text-xl tracking-widest">
            REGISTER HERE
          </h1>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center py-5">
        <form
          className="w-[90vw] sm:w-[60vw] lg:w-[40vw] px-5 md:px-10"
          onSubmit={formik.handleSubmit}
        >
          <label className="flex justify-center my-2 font-semibold">
            Driver Details
          </label>
          <TextField
            label="Name"
            name="name"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="John Doe"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={sx}
          />
          <TextField
            label="Mobile Number"
            name="mobile"
            type="tel"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="+91-0123456789"
            value={formik.values.mobile}
            onChange={formik.handleChange}
            error={formik.touched.mobile && Boolean(formik.errors.mobile)}
            helperText={formik.touched.mobile && formik.errors.mobile}
            sx={sx}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="john@email.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={sx}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="**********"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={sx}
          />
          <label className="flex justify-center my-2 font-semibold">
            Driving License Details <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <TextField
            label="Driving License Number"
            name="licenseNumber"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="DL1234567890"
            value={formik.values.licenseNumber}
            onChange={formik.handleChange}
            error={
              formik.touched.licenseNumber &&
              Boolean(formik.errors.licenseNumber)
            }
            helperText={
              formik.touched.licenseNumber && formik.errors.licenseNumber
            }
            sx={sx}
          />
          <TextField
            label="License State"
            name="licenseState"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Telangana"
            value={formik.values.licenseState}
            onChange={formik.handleChange}
            error={
              formik.touched.licenseState && Boolean(formik.errors.licenseState)
            }
            helperText={
              formik.touched.licenseState && formik.errors.licenseState
            }
            sx={sx}
          />

          <TextField
            label="License Expiration Date"
            name="licenseExpirationDate"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formik.values.licenseExpirationDate}
            onChange={formik.handleChange}
            error={
              formik.touched.licenseExpirationDate &&
              Boolean(formik.errors.licenseExpirationDate)
            }
            helperText={
              formik.touched.licenseExpirationDate &&
              formik.errors.licenseExpirationDate
            }
            sx={sx}
          />

          <label className="flex justify-center my-2 font-semibold">
            Vehicle Details <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <TextField
            label="Vehicle company"
            name="company"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Toyota"
            value={formik.values.company}
            onChange={formik.handleChange}
            error={formik.touched.company && Boolean(formik.errors.company)}
            helperText={formik.touched.company && formik.errors.company}
            sx={sx}
          />
          <TextField
            label="Model"
            name="model"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="SUV300"
            value={formik.values.model}
            onChange={formik.handleChange}
            error={formik.touched.model && Boolean(formik.errors.model)}
            helperText={formik.touched.model && formik.errors.model}
            sx={sx}
          />

          <div className="flex gap-2">
            <TextField
              label="Color"
              name="color"
              type="text"
              variant="outlined"
              fullWidth
              placeholder="Red"
              margin="normal"
              value={formik.values.color}
              onChange={formik.handleChange}
              error={formik.touched.color && Boolean(formik.errors.color)}
              helperText={formik.touched.color && formik.errors.color}
              sx={sx}
            />
            <TextField
              label="Year"
              name="year"
              type="number"
              variant="outlined"
              fullWidth
              placeholder="2010"
              margin="normal"
              value={formik.values.year}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue('year', value ? parseInt(value) : '');
              }}
              error={formik.touched.year && Boolean(formik.errors.year)}
              helperText={formik.touched.year && formik.errors.year}
              sx={sx}
            />
            <TextField
              label="Capacity"
              name="capacity"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="4"
              value={formik.values.capacity}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue('capacity', value ? parseInt(value) : '');
              }}
              error={formik.touched.capacity && Boolean(formik.errors.capacity)}
              helperText={formik.touched.capacity && formik.errors.capacity}
              sx={sx}
            />
          </div>
          <div className="flex gap-2">
            <FormControl
              fullWidth
              margin="normal"
              error={formik.touched.vehicleType && Boolean(formik.errors.vehicleType)}
              sx={sx}
            >
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                name="vehicleType"
                value={formik.values.vehicleType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Vehicle Type"
              >
                {VEHICLE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.vehicleType && formik.errors.vehicleType && (
                <FormHelperText>{formik.errors.vehicleType}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              fullWidth
              margin="normal"
              error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}
              sx={sx}
            >
              <InputLabel>Service Type</InputLabel>
              <Select
                name="serviceType"
                value={formik.values.serviceType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Service Type"
              >
                {SERVICE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.serviceType && formik.errors.serviceType && (
                <FormHelperText>{formik.errors.serviceType}</FormHelperText>
              )}
            </FormControl>
          </div>
          <TextField
            label="Vehicle Plate Number"
            name="licensePlate"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="hdj2354f"
            value={formik.values.licensePlate}
            onChange={formik.handleChange}
            error={
              formik.touched.licensePlate && Boolean(formik.errors.licensePlate)
            }
            helperText={
              formik.touched.licensePlate && formik.errors.licensePlate
            }
            sx={sx}
          />
          
          <label className="flex justify-center my-2 font-semibold">
            Bank Details <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <TextField
            label="Account Holder Name"
            name="accountHolderName"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Driver Name"
            value={formik.values.accountHolderName}
            onChange={formik.handleChange}
            error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
            helperText={formik.touched.accountHolderName && formik.errors.accountHolderName}
            sx={sx}
          />
          <div className="flex gap-2">
            <TextField
              label="Bank Name"
              name="bankName"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="HDFC Bank"
              value={formik.values.bankName}
              onChange={formik.handleChange}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
              sx={sx}
            />
            <TextField
              label="Account Number"
              name="accountNumber"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="1234567890"
              value={formik.values.accountNumber}
              onChange={formik.handleChange}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
              sx={sx}
            />
          </div>
          <div className="flex gap-2">
            <TextField
              label="IFSC Code"
              name="ifscCode"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="HDFC0001234"
              value={formik.values.ifscCode}
              onChange={formik.handleChange}
              error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
              helperText={formik.touched.ifscCode && formik.errors.ifscCode}
              sx={sx}
            />
            <TextField
              label="UPI ID"
              name="upiId"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="driver@upi"
              value={formik.values.upiId}
              onChange={formik.handleChange}
              error={formik.touched.upiId && Boolean(formik.errors.upiId)}
              helperText={formik.touched.upiId && formik.errors.upiId}
              sx={sx}
            />
          </div>
          
          <Button
            sx={{ padding: ".9rem 0rem" }}
            variant="contained"
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 my-3"
          >
            {isLoading ? <CircularProgressBar /> : "Create Account"}
          </Button>
        </form>

        <div className="flex flex-col w-full justify-center items-center">
          <p className="flex items-center text-center text-slate-700 my-2">
            Already have an account ?{" "}
            <Button
              className="font-semibold  text-slate-800 normal-case"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterDriverForm;
