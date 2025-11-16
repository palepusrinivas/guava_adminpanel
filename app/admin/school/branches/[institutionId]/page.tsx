"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createBranch, getInstitution, listBranches, updateBranch, deleteBranch } from "@/utils/slices/schoolSlice";
import { toast } from "react-hot-toast";

export default function BranchesPage() {
  const params = useParams();
  const institutionId = Number(params?.institutionId);
  const dispatch = useAppDispatch();
  const school = useAppSelector((s) => s.school);
  const institution = school.institutionsById[institutionId];
  const branches = school.branchesByInstitution[institutionId] || [];
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ [k: string]: string }>({});
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    subscriptionPlan: "",
  });

  useEffect(() => {
    if (!institution && institutionId) {
      dispatch(getInstitution(institutionId));
    }
    if (institutionId) {
      dispatch(listBranches(institutionId));
    }
  }, [dispatch, institutionId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        institutionId,
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        subscriptionPlan: form.subscriptionPlan || undefined,
      } as any;
      const res = await dispatch(createBranch(payload));
      if (createBranch.fulfilled.match(res)) {
        toast.success("Branch created");
        setForm({ name: "", address: "", city: "", state: "", pincode: "", latitude: "", longitude: "", subscriptionPlan: "" });
      } else {
        toast.error("Failed to create branch");
      }
    } catch {
      toast.error("Failed to create branch");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Branches {institution ? `— ${institution.name}` : ""}</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="border p-2 rounded" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="border p-2 rounded" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Subscription Plan (Basic/Standard/Premium)" value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })} />
        <div className="md:col-span-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Branch</button>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left border">Name</th>
              <th className="p-2 text-left border">City</th>
              <th className="p-2 text-left border">State</th>
              <th className="p-2 text-left border">Plan</th>
              <th className="p-2 text-left border">Geo</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.name ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                  ) : b.name}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.city ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
                  ) : b.city}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.state ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, state: e.target.value }))} />
                  ) : b.state}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.subscriptionPlan ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, subscriptionPlan: e.target.value }))} />
                  ) : b.subscriptionPlan}
                </td>
                <td className="p-2 border">
                  {b.latitude != null && b.longitude != null ? `${b.latitude}, ${b.longitude}` : "-"}
                </td>
                <td className="p-2 border space-x-2">
                  {editingId === b.id ? (
                    <>
                      <button
                        className="text-green-700 underline"
                        onClick={async () => {
                          const res = await dispatch(updateBranch({ id: b.id, updates: editForm as any }));
                          if (updateBranch.fulfilled.match(res)) {
                            setEditingId(null);
                            setEditForm({});
                          }
                        }}
                      >
                        Save
                      </button>
                      <button className="text-gray-600 underline" onClick={() => { setEditingId(null); setEditForm({}); }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="text-blue-700 underline" onClick={() => { setEditingId(b.id); setEditForm({}); }}>
                        Edit
                      </button>
                      <button className="text-red-700 underline" onClick={async () => { await dispatch(deleteBranch(b.id)); }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


