"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { adminLogin } from "@/utils/slices/adminSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

function AdminLoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.admin);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const maxAttempts = 5;
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Preserve existing lockout behaviour
    const lockoutEndTime = localStorage.getItem("adminLockoutEndTime");
    if (lockoutEndTime && new Date().getTime() < parseInt(lockoutEndTime)) {
      setIsLocked(true);
      const remainingTime = parseInt(lockoutEndTime) - new Date().getTime();
      setTimeout(() => setIsLocked(false), remainingTime);
    }

    // Remove attributes injected by some browser extensions (e.g. fdprocessedid)
    // These can cause React hydration mismatches because the server HTML doesn't contain them.
    try {
      if (typeof document !== "undefined") {
        const injected = document.querySelectorAll("[fdprocessedid]");
        injected.forEach((el) => el.removeAttribute("fdprocessedid"));
      }
    } catch (e) {
      // Non-fatal: just skip if DOM access fails
      // console.debug("Could not remove injected attributes", e);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isLocked) {
        toast.error("Account is temporarily locked. Please try again later.");
        return;
      }

      try {
        const response = await dispatch(adminLogin(values));
        if (adminLogin.fulfilled.match(response)) {
          setLoginAttempts(0);
          localStorage.removeItem('adminLockoutEndTime');
          toast.success("Login successful");
          router.push("/admin/dashboard");
        } else {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= maxAttempts) {
            const lockoutDuration = 15 * 60 * 1000; // 15 minutes
            const lockoutEndTime = new Date().getTime() + lockoutDuration;
            localStorage.setItem('adminLockoutEndTime', lockoutEndTime.toString());
            setIsLocked(true);
            setTimeout(() => setIsLocked(false), lockoutDuration);
            toast.error(`Too many failed attempts. Account locked for 15 minutes.`);
          } else {
            toast.error(`Login failed. ${maxAttempts - newAttempts} attempts remaining.`);
          }
        }
      } catch (error) {
        toast.error("Network error. Please check your connection and try again.");
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    // suppressHydrationWarning helps avoid React logging hydration mismatch warnings
    // when a browser extension mutates server-rendered HTML before React hydrates.
    <form suppressHydrationWarning onSubmit={formik.handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formik.touched.username && formik.errors.username
              ? "border-red-300"
              : "border-gray-300"
          }`}
          placeholder="Enter your username"
        />
        {formik.touched.username && formik.errors.username && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formik.touched.password && formik.errors.password
                ? "border-red-300"
                : "border-gray-300"
            }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !formik.isValid}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Back to User Login
        </button>
      </div>
    </form>
  );
}

export default AdminLoginForm;
