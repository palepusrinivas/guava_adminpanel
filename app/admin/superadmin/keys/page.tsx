"use client";
import React, { useEffect, useState } from "react";
import adminAxios from "@/utils/axiosConfig";
import { config } from "@/utils/config";
import { useAppSelector } from "@/utils/store/store";

interface ApiKey {
  id?: number;
  name: string;
  value: string;
  description?: string;
}

export default function SuperAdminApiKeysPage() {
  const { admin } = useAppSelector((s) => s.admin);
  const [items, setItems] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ApiKey>({ name: "", value: "", description: "" });

  const canView = admin && admin.role === "SUPER_ADMIN";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAxios.get(config.ENDPOINTS.SUPERADMIN.API_KEYS);
      setItems(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await adminAxios.post(config.ENDPOINTS.SUPERADMIN.API_KEYS, form);
      setForm({ name: "", value: "", description: "" });
      await load();
    } catch (e: any) {
      setError(e?.response?.data || "Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await adminAxios.delete(`${config.ENDPOINTS.SUPERADMIN.API_KEYS}/${id}`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data || "Failed to delete API key");
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Super Admin - API Keys</h2>
        <p className="text-sm text-gray-600">You need SUPER_ADMIN role to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Super Admin - API Keys</h2>
        <p className="text-sm text-gray-600">Create and manage API keys for integrations.</p>
      </div>

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Service name"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Value</label>
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Key value"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
        <div className="md:col-span-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Key"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
          {String(error)}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2 text-sm text-gray-700">{it.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700 break-all">{it.value}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.description}</td>
                <td className="px-4 py-2 text-sm text-right">
                  <button
                    onClick={() => remove(it.id)}
                    className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>No API keys found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


