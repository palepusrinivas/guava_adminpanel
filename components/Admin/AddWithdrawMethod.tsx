"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createWithdrawMethod, getWithdrawMethods } from "@/utils/reducers/adminReducers";
import { useRouter } from "next/navigation";

const fieldSchema = yup.object({
  fieldName: yup.string().required("Field name is required"),
  inputType: yup.string().required("Input type is required"),
  placeholder: yup.string().required("Placeholder is required"),
  isRequired: yup.boolean().default(false),
});

const schema = yup.object({
  methodName: yup.string().required("Method name is required"),
  defaultMethod: yup.boolean().default(false),
  fields: yup.array().of(fieldSchema).min(1, "At least one field is required"),
});

export default function AddWithdrawMethod() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((s) => s.withdraw);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      methodName: "",
      defaultMethod: false,
      fields: [
        {
          fieldName: "",
          inputType: "text",
          placeholder: "",
          isRequired: true,
        },
      ],
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        const methodData = {
          methodName: values.methodName,
          defaultMethod: values.defaultMethod,
          methodFields: values.fields,
          active: true,
        };
        const result = await dispatch(createWithdrawMethod(methodData));
        if ((result as any).meta.requestStatus === "fulfilled") {
          setSubmitSuccess("Withdraw method created successfully!");
          formik.resetForm();
          dispatch(getWithdrawMethods());
          setTimeout(() => {
            router.push("/admin/withdraw/methods");
          }, 1500);
        } else {
          throw new Error((result as any).payload || "Failed to create withdraw method");
        }
      } catch (e: any) {
        setSubmitError(e.message || "Failed to create withdraw method. Ensure backend API is ready.");
      }
    },
  });

  const addField = () => {
    formik.setFieldValue("fields", [
      ...formik.values.fields,
      {
        fieldName: "",
        inputType: "text",
        placeholder: "",
        isRequired: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    const newFields = formik.values.fields.filter((_, i) => i !== index);
    formik.setFieldValue("fields", newFields);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Add New Withdraw Method</h2>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6">
        {submitSuccess && (
          <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
            {submitSuccess}
          </div>
        )}
        {submitError && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{submitError}</div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Setup Method Info
          </h3>
          <button
            onClick={addField}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            + Add More Fields
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Method Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method Name <span className="text-red-500">*</span>
              </label>
              <input
                name="methodName"
                value={formik.values.methodName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Select method name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {formik.touched.methodName && formik.errors.methodName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.methodName as string}</p>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="defaultMethod"
                  checked={formik.values.defaultMethod}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Make This Method Default</span>
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800">Method Fields</h4>
            {formik.values.fields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Field {index + 1}</span>
                  {formik.values.fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input Field Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name={`fields.${index}.inputType`}
                      value={field.inputType}
                      onChange={formik.handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name={`fields.${index}.fieldName`}
                      value={field.fieldName}
                      onChange={formik.handleChange}
                      placeholder="Select field name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      name={`fields.${index}.placeholder`}
                      value={field.placeholder}
                      onChange={formik.handleChange}
                      placeholder="Select placeholder text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={`fields.${index}.isRequired`}
                      checked={field.isRequired}
                      onChange={(e) => {
                        formik.setFieldValue(`fields.${index}.isRequired`, e.target.checked);
                      }}
                      className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Make This Field Required</span>
                  </label>
                </div>
              </div>
            ))}
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
    </div>
  );
}

