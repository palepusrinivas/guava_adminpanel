"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createEmployee, getEmployees, getEmployeeRoles } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

const identityTypes = ["Aadhar", "PAN", "Passport", "Driving License", "Voter ID"];

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phone: yup.string().required("Phone is required").matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  address: yup.string(),
  identityType: yup.string(),
  identityNumber: yup.string(),
  employeeRole: yup.string().required("Employee role is required"),
});

export default function AddEmployee() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, roles } = useAppSelector((s) => s.employee);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [employeeImage, setEmployeeImage] = useState<File | null>(null);
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [employeeImagePreview, setEmployeeImagePreview] = useState<string | null>(null);
  const [identityImagePreview, setIdentityImagePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getEmployeeRoles()).catch(() => {});
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      employeeImage: "",
      identityType: "",
      identityNumber: "",
      identityImage: "",
      employeeRole: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("phone", values.phone);
        formData.append("address", values.address || "");
        formData.append("identityType", values.identityType || "");
        formData.append("identityNumber", values.identityNumber || "");
        formData.append("employeeRole", values.employeeRole);
        if (employeeImage) {
          formData.append("employeeImage", employeeImage);
        }
        if (identityImage) {
          formData.append("identityImage", identityImage);
        }

        // For now, we'll send as JSON (backend can be adjusted)
        const employeeData = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          address: values.address,
          identityType: values.identityType,
          identityNumber: values.identityNumber,
          employeeRole: values.employeeRole,
          employeeRoleId: roles.find((r) => r.roleName === values.employeeRole)?.id,
          status: "ACTIVE",
        };

        const result = await dispatch(createEmployee(employeeData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Employee created successfully!");
          formik.resetForm();
          setEmployeeImage(null);
          setIdentityImage(null);
          setEmployeeImagePreview(null);
          setIdentityImagePreview(null);
          dispatch(getEmployees());
          setTimeout(() => {
            router.push("/admin/employee");
          }, 1500);
        } else {
          throw new Error((result as any).payload || "Failed to create employee");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create employee. Ensure backend API is ready.");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "employee" | "identity") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "employee") {
        setEmployeeImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEmployeeImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setIdentityImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdentityImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-black">Add New Employee</h2>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* EMPLOYEE INFORMATION Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">EMPLOYEE INFORMATION</h3>
          <p className="text-sm text-gray-600 mb-6">
            Setup the necessary information and include the documents of the employee
          </p>

          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h4>
            <p className="text-sm text-gray-600 mb-4">
              Here you can set the primary information of the employee to ensure the basic details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                      placeholder="Ex: xxxxx xxxxxxx"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{formik.errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    placeholder="Ex: Dhaka"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-purple-300"
                  />
                </div>
              </div>

              {/* Employee Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e, "employee")}
                    className="hidden"
                    id="employeeImage"
                  />
                  <label htmlFor="employeeImage" className="cursor-pointer">
                    {employeeImagePreview ? (
                      <div className="space-y-2">
                        <img src={employeeImagePreview} alt="Preview" className="w-32 h-32 mx-auto rounded object-cover" />
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
                        <p className="text-sm text-blue-600 font-medium">Click to upload Or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG JPEG PNG WEBP. Less Than 1MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* IDENTITY INFORMATION Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">IDENTITY INFORMATION</h3>
          <p className="text-sm text-gray-600 mb-6">
            Include the necessary information & upload documents that confirms the employee's identity
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Identity Image</label>
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

        {/* SETUP ROLE AND RESPONSIBILITY Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">SETUP ROLE AND RESPONSIBILITY</h3>
          <p className="text-sm text-gray-600 mb-6">
            Define the employee's role assign tasks and set access levels accordingly.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Role</label>
            <select
              name="employeeRole"
              value={formik.values.employeeRole}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">--Select Employee Role--</option>
              {roles.map((role) => (
                <option key={role.id} value={role.roleName}>
                  {role.roleName}
                </option>
              ))}
            </select>
            {formik.touched.employeeRole && formik.errors.employeeRole && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.employeeRole}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Information"}
          </button>
        </div>
      </form>
    </div>
  );
}

