\"use client\";
import React, { useEffect, useState } from \"react\";
import adminAxios from \"@/utils/axiosConfig\";
import { config } from \"@/utils/config\";
import { useAppSelector } from \"@/utils/store/store\";

interface AdminUser {
  id?: number;
  username: string;
  role: string;
}

export default function SuperAdminAdminsPage() {
  const { admin } = useAppSelector((s) => s.admin);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: \"\", password: \"\", role: \"ROLE_ADMIN\" });

  const canView = admin && admin.role === \"SUPER_ADMIN\";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAxios.get(config.ENDPOINTS.SUPERADMIN.ADMINS);
      setItems(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data || \"Failed to load admins\");
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
      await adminAxios.post(config.ENDPOINTS.SUPERADMIN.ADMINS, form);
      setForm({ username: \"\", password: \"\", role: \"ROLE_ADMIN\" });
      await load();
    } catch (e: any) {
      setError(e?.response?.data || \"Failed to create admin\");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await adminAxios.delete(`${config.ENDPOINTS.SUPERADMIN.ADMINS}/${id}`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data || \"Failed to delete admin\");
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <div>
        <h2 className=\"text-xl font-semibold text-gray-900 mb-2\">Super Admin - Admin Users</h2>
        <p className=\"text-sm text-gray-600\">You need SUPER_ADMIN role to access this page.</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      <div>
        <h2 className=\"text-xl font-semibold text-gray-900\">Super Admin - Admin Users</h2>
        <p className=\"text-sm text-gray-600\">Create and manage admin users.</p>
      </div>

      <form onSubmit={create} className=\"grid grid-cols-1 md:grid-cols-4 gap-3 items-end\">
        <div>
          <label className=\"block text-sm font-medium text-gray-700\">Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className=\"mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500\"
            placeholder=\"admin username\"
            required
          />
        </div>
        <div>
          <label className=\"block text-sm font-medium text-gray-700\">Password</label>
          <input
            type=\"password\"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className=\"mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500\"
            placeholder=\"password\"
            required
          />
        </div>
        <div>
          <label className=\"block text-sm font-medium text-gray-700\">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className=\"mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500\"
          >
            <option value=\"ROLE_ADMIN\">ROLE_ADMIN</option>
            <option value=\"SUPER_ADMIN\">SUPER_ADMIN</option>
          </select>
        </div>
        <div className=\"md:col-span-1\">
          <button
            type=\"submit\"
            disabled={loading}
            className=\"inline-flex items-center justify-center w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50\"
          >
            {loading ? \"Saving...\" : \"Create Admin\"}
          </button>
        </div>
      </form>

      {error && (
        <div className=\"p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm\">
          {String(error)}
        </div>
      )}

      <div className=\"overflow-x-auto\">
        <table className=\"min-w-full divide-y divide-gray-200\">
          <thead className=\"bg-gray-50\">
            <tr>
              <th className=\"px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase\">ID</th>
              <th className=\"px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase\">Username</th>
              <th className=\"px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase\">Role</th>
              <th className=\"px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase\">Actions</th>
            </tr>
          </thead>
          <tbody className=\"bg-white divide-y divide-gray-200\">
            {items.map((it) => (
              <tr key={it.id}>
                <td className=\"px-4 py-2 text-sm text-gray-700\">{it.id}</td>
                <td className=\"px-4 py-2 text-sm text-gray-700\">{it.username}</td>
                <td className=\"px-4 py-2 text-sm text-gray-700\">{it.role}</td>
                <td className=\"px-4 py-2 text-sm text-right\">
                  <button
                    onClick={() => remove(it.id)}
                    className=\"px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700\"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className=\"px-4 py-6 text-sm text-gray-500\" colSpan={4}>No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


