"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createBus, listBuses, updateBus, deleteBus } from "@/utils/slices/schoolSlice";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function BusesPage() {
  const { branchId } = useParams() as { branchId: string };
  const id = Number(branchId);
  const dispatch = useAppDispatch();
  const buses = useAppSelector((s) => s.school.busesByBranch[id] || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ [k: string]: string }>({});
  const [form, setForm] = useState({
    busNumber: "",
    capacity: "",
    type: "",
    rcExpiry: "",
    insuranceExpiry: "",
    photoUrl: "",
  });

  useEffect(() => {
    if (id) dispatch(listBuses(id));
  }, [dispatch, id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.busNumber) {
      toast.error("Bus number is required");
      return;
    }
    const payload = {
      branchId: id,
      busNumber: form.busNumber,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      type: form.type || undefined,
      rcExpiry: form.rcExpiry || undefined,
      insuranceExpiry: form.insuranceExpiry || undefined,
      photoUrl: form.photoUrl || undefined,
    };
    const res = await dispatch(createBus(payload as any));
    if (createBus.fulfilled.match(res)) {
      toast.success("Bus created");
      setForm({ busNumber: "", capacity: "", type: "", rcExpiry: "", insuranceExpiry: "", photoUrl: "" });
    } else {
      toast.error("Failed to create bus");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Buses — Branch #{id}</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border p-2 rounded" placeholder="Bus Number *" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Type (morning/evening/both)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <input className="border p-2 rounded" type="date" placeholder="RC Expiry" value={form.rcExpiry} onChange={(e) => setForm({ ...form, rcExpiry: e.target.value })} />
        <input className="border p-2 rounded" type="date" placeholder="Insurance Expiry" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Photo URL" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
        <div className="md:col-span-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Create Bus</button>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border text-left">Bus #</th>
              <th className="p-2 border text-left">Capacity</th>
              <th className="p-2 border text-left">Type</th>
              <th className="p-2 border text-left">RC</th>
              <th className="p-2 border text-left">Insurance</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.busNumber} onChange={(e) => setEditForm((p) => ({ ...p, busNumber: e.target.value }))} />
                  ) : b.busNumber}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={String(b.capacity ?? "")} onChange={(e) => setEditForm((p) => ({ ...p, capacity: e.target.value }))} />
                  ) : (b.capacity ?? "-")}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" defaultValue={b.type ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))} />
                  ) : (b.type ?? "-")}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" type="date" defaultValue={b.rcExpiry ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, rcExpiry: e.target.value }))} />
                  ) : (b.rcExpiry ?? "-")}
                </td>
                <td className="p-2 border">
                  {editingId === b.id ? (
                    <input className="border p-1 rounded w-full" type="date" defaultValue={b.insuranceExpiry ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, insuranceExpiry: e.target.value }))} />
                  ) : (b.insuranceExpiry ?? "-")}
                </td>
                <td className="p-2 border space-x-2">
                  <Link className="text-blue-600 underline" href={`/admin/school/live/${b.id}`}>Live</Link>
                  {editingId === b.id ? (
                    <>
                      <button
                        className="text-green-700 underline"
                        onClick={async () => {
                          const payload = {
                            id: b.id,
                            updates: {
                              ...editForm,
                              capacity: editForm.capacity ? Number(editForm.capacity) : undefined,
                            },
                          } as any;
                          const res = await dispatch(updateBus(payload));
                          if (updateBus.fulfilled.match(res)) {
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
                      <button className="text-red-700 underline" onClick={async () => { await dispatch(deleteBus(b.id)); }}>
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


