"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createCustomer, getCustomers } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

const identityTypes = ["Aadhar", "PAN", "Passport", "Driving License", "Voter ID"];

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email address"),
  phone: yup.string().required("Phone is required").matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  identityType: yup.string(),
  identityNumber: yup.string(),
});

export default function AddCustomer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((s) => s.customer);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customerImagePreview, setCustomerImagePreview] = useState<string | null>(null);
  const [identityImagePreview, setIdentityImagePreview] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      identityType: "",
      identityNumber: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);

        const customerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          identityType: values.identityType,
          identityNumber: values.identityNumber,
          status: "ACTIVE",
          profileStatus: 30,
          level: "Level 1",
          totalTrip: 0,
        };

        const result = await dispatch(createCustomer(customerData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Customer created successfully!");
          formik.resetForm();
          setCustomerImage(null);
          setIdentityImage(null);
          setOtherDocuments(null);
          setCustomerImagePreview(null);
          setIdentityImagePreview(null);
          dispatch(getCustomers());
          setTimeout(() => {
            router.push("/admin/customer");
          }, 1500);
        } else {
          throw new Error((result as any).payload || "Failed to create customer");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create customer. Ensure backend API is ready.");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "customer" | "identity" | "other") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "customer") {
        setCustomerImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCustomerImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (type === "identity") {
        setIdentityImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdentityImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setOtherDocuments(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Add Customer</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Top Upload Section - Customer Image */}
        <div className="bg-white rounded-xl shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleImageChange(e, "customer")}
              className="hidden"
              id="customerImage"
            />
            <label htmlFor="customerImage" className="cursor-pointer">
              {customerImagePreview ? (
                <div className="space-y-2">
                  <img src={customerImagePreview} alt="Preview" className="w-32 h-32 mx-auto rounded object-cover" />
                  <p className="text-sm text-gray-600">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="w-12 h-12 mx-auto text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-blue-600 font-medium">Click To Upload Or Drag And Drop</p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">JPG JPEG PNG WEBP. Less Than 1MB</p>
        </div>

        {/* GENERAL INFO Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">GENERAL INFO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: Maximilian"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: Schwarzmüller"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ex: company@company.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identity Type</label>
              <select
                name="identityType"
                value={formik.values.identityType}
                onChange={formik.handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">-- Select identity type --</option>
                {identityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identity Number</label>
              <input
                name="identityNumber"
                value={formik.values.identityNumber}
                onChange={formik.handleChange}
                placeholder="Ex: 3032"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
              />
            </div>
          </div>

          {/* Identity Card Image */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Identity Card Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleImageChange(e, "identity")}
                className="hidden"
                id="identityImage"
              />
              <label htmlFor="identityImage" className="cursor-pointer">
                {identityImagePreview ? (
                  <div className="space-y-2">
                    <img src={identityImagePreview} alt="Preview" className="w-32 h-32 mx-auto rounded object-cover" />
                    <p className="text-sm text-gray-600">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg
                      className="w-12 h-12 mx-auto text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-blue-600 font-medium">Click To Upload Or Drag And Drop</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG JPEG PNG WEBP. Less Than 1MB</p>
          </div>
        </div>

        {/* ACCOUNT INFORMATION Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">ACCOUNT INFORMATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none">
                  <option>+91</option>
                </select>
                <input
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: XXXXX XXXXXX"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: ********"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: ********"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* UPLOAD OTHER DOCUMENTS Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">UPLOAD OTHER DOCUMENTS</h3>
          <div className="mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleImageChange(e, "other")}
                className="hidden"
                id="otherDocuments"
              />
              <label htmlFor="otherDocuments" className="cursor-pointer">
                <div className="space-y-2">
                  <svg
                    className="w-12 h-12 mx-auto text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-blue-600 font-medium">Upload File Or Image</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

