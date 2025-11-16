"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/utils/store/store";
import {
  listDriverAccessConfigs,
  createDriverAccessConfig,
  updateDriverAccessConfig,
  processDriverDailyFees,
  getDriverAccessConfig,
} from "@/utils/reducers/adminReducers";
import adminAxios from "@/utils/axiosConfig";
import { config } from "@/utils/config";

interface DriverFeeConfiguration {
  id?: number;
  vehicleType: string;
  dailyTargetTrips?: number;
  dailyFee?: number;
  perTripFee?: number;
  minimumWalletBalance?: number;
  welcomePeriodDays?: number;
  maxAllowedCancellations?: number;
  isActive?: boolean;
}

export default function DriverAccessPage() {
  const dispatch = useAppDispatch();
  const [configs, setConfigs] = useState<DriverFeeConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editVehicleType, setEditVehicleType] = useState<string>("");
  const [form, setForm] = useState<DriverFeeConfiguration>({
    vehicleType: "",
    dailyTargetTrips: 0,
    dailyFee: 0,
    perTripFee: 0,
    minimumWalletBalance: 0,
    welcomePeriodDays: 3,
    maxAllowedCancellations: 1,
    isActive: true,
  });
  const [processDate, setProcessDate] = useState<string>("");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAxios.get(config.ENDPOINTS.ADMIN.DRIVER_ACCESS_CONFIGS);
      setConfigs(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditVehicleType("");
    setForm({
      vehicleType: "",
      dailyTargetTrips: 0,
      dailyFee: 0,
      perTripFee: 0,
      minimumWalletBalance: 0,
      welcomePeriodDays: 3,
      maxAllowedCancellations: 1,
      isActive: true,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (editVehicleType) {
        await dispatch(updateDriverAccessConfig({ vehicleType: editVehicleType, payload: form })).unwrap();
      } else {
        await dispatch(createDriverAccessConfig(form as any)).unwrap();
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = async (vehicleType: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dispatch(getDriverAccessConfig(vehicleType)).unwrap();
      setEditVehicleType(vehicleType);
      setForm({
        vehicleType: res.vehicleType,
        dailyTargetTrips: res.dailyTargetTrips ?? 0,
        dailyFee: res.dailyFee ?? 0,
        perTripFee: res.perTripFee ?? 0,
        minimumWalletBalance: res.minimumWalletBalance ?? 0,
        welcomePeriodDays: res.welcomePeriodDays ?? 3,
        maxAllowedCancellations: res.maxAllowedCancellations ?? 1,
        isActive: res.isActive ?? true,
      });
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to fetch configuration");
    } finally {
      setLoading(false);
    }
  };

  const onProcessDailyFees = async () => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(processDriverDailyFees({ date: processDate || undefined })).unwrap();
      // No list update required here; it's a server process action
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to process daily fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Driver Access Rules</h1>
        <p className="text-gray-600">Configure driver daily/per-trip fees per vehicle type and trigger daily fee processing.</p>
      </div>

      {/* Create / Update form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <input
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bike, Auto, Sedan"
              required
              disabled={!!editVehicleType}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Target Trips</label>
            <input
              type="number"
              value={form.dailyTargetTrips ?? 0}
              onChange={(e) => setForm({ ...form, dailyTargetTrips: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Fee</label>
            <input
              type="number"
              step="0.01"
              value={form.dailyFee ?? 0}
              onChange={(e) => setForm({ ...form, dailyFee: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Per Trip Fee</label>
            <input
              type="number"
              step="0.01"
              value={form.perTripFee ?? 0}
              onChange={(e) => setForm({ ...form, perTripFee: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Wallet Balance</label>
            <input
              type="number"
              step="0.01"
              value={form.minimumWalletBalance ?? 0}
              onChange={(e) => setForm({ ...form, minimumWalletBalance: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Welcome Period (days)</label>
            <input
              type="number"
              value={form.welcomePeriodDays ?? 3}
              onChange={(e) => setForm({ ...form, welcomePeriodDays: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Allowed Cancellations</label>
            <input
              type="number"
              value={form.maxAllowedCancellations ?? 1}
              onChange={(e) => setForm({ ...form, maxAllowedCancellations: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Active</label>
            <select
              value={form.isActive ? "true" : "false"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {editVehicleType ? "Update" : "Create"} Configuration
            </button>
            {editVehicleType && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-3 p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
            {String(error)}
          </div>
        )}
      </div>

      {/* Process daily fees */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Process Daily Fees</h3>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date (optional)</label>
            <input
              type="date"
              value={processDate}
              onChange={(e) => setProcessDate(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onProcessDailyFees}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Run Processing
          </button>
        </div>
      </div>

      {/* List existing configurations */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Trips</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Daily Fee</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Per Trip Fee</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Wallet</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Welcome Days</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Cancels</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((c) => (
                <tr key={c.vehicleType}>
                  <td className="px-4 py-2 text-sm text-gray-700 font-medium">{c.vehicleType}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.dailyTargetTrips ?? "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.dailyFee ?? "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.perTripFee ?? "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.minimumWalletBalance ?? "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.welcomePeriodDays ?? "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.maxAllowedCancellations ?? "-"}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    <button
                      onClick={() => onEdit(c.vehicleType)}
                      className="px-3 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {configs.length === 0 && !loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>No configurations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


