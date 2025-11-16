"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createInstitution, listInstitutions, updateInstitution, deleteInstitution, getInstitutionByUniqueId } from "@/utils/slices/schoolSlice";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function InstitutionsPage() {
  const dispatch = useAppDispatch();
  const { isLoading, institutions } = useAppSelector((s) => s.school);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ [k: string]: string }>({});
  const [searchUniqueId, setSearchUniqueId] = useState("");
  const [form, setForm] = useState({
    name: "",
    primaryContactName: "",
    primaryContactPhone: "",
    email: "",
    gstNumber: "",
  });

  useEffect(() => {
    dispatch(listInstitutions());
  }, [dispatch]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Institution name is required");
      return;
    }
    try {
      const res = await dispatch(createInstitution(form as any));
      if (createInstitution.fulfilled.match(res)) {
        toast.success("Institution created");
        setForm({ name: "", primaryContactName: "", primaryContactPhone: "", email: "", gstNumber: "" });
      } else {
        toast.error("Failed to create institution");
      }
    } catch {
      toast.error("Failed to create institution");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Institutions</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Primary Contact Name" value={form.primaryContactName} onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Primary Contact Phone" value={form.primaryContactPhone} onChange={(e) => setForm({ ...form, primaryContactPhone: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 rounded" placeholder="GST Number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
        <div className="md:col-span-2">
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {isLoading ? "Creating..." : "Create Institution"}
          </button>
        </div>
      </form>
      <p className="text-sm text-gray-500">Use the branches page to add branches for an institution.</p>
      <div className="flex items-center gap-2">
        <input className="border p-2 rounded" placeholder="Search by UniqueId (e.g. INST12345)" value={searchUniqueId} onChange={(e) => setSearchUniqueId(e.target.value)} />
        <button
          className="px-3 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          disabled={!searchUniqueId}
          onClick={async () => {
            const res = await dispatch(getInstitutionByUniqueId(searchUniqueId));
            if (!getInstitutionByUniqueId.fulfilled.match(res)) {
              // eslint-disable-next-line no-alert
              alert("Institution not found");
            }
          }}
        >
          Search
        </button>
      </div>
      <div className="overflow-x-auto">
        {!institutions || institutions.length === 0 ? (
          <div className="p-4 text-sm text-gray-600 border rounded">No institutions found.</div>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-50">
                {/* Build columns dynamically from backend data keys, with a stable preferred order if present */}
                {(() => {
                  const first = (institutions[0] as unknown) as Record<string, unknown>;
                  const preferred = ["id", "uniqueId", "name", "primaryContactName", "primaryContactPhone", "email", "gstNumber", "createdAt"];
                  const dynamic = Object.keys(first).filter((k) => !preferred.includes(k) && typeof first[k] !== "object");
                  const cols = [...preferred, ...dynamic];
                  return cols.map((key) => (
                    <th key={key} className="p-2 border text-left">{key}</th>
                  )).concat(
                    <th key="actions" className="p-2 border text-left">actions</th>
                  );
                })()}
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => {
                const row = (inst as unknown) as Record<string, any>;
                const preferred = ["id", "uniqueId", "name", "primaryContactName", "primaryContactPhone", "email", "gstNumber", "createdAt"];
                const dynamic = Object.keys(row).filter((k) => !preferred.includes(k) && typeof row[k] !== "object");
                const cols = [...preferred, ...dynamic];
                return (
                  <tr key={row.id ?? row.uniqueId ?? Math.random()} className="border-b">
                    {cols.map((key) => {
                      const isEditable = ["name", "primaryContactName", "primaryContactPhone", "email", "gstNumber"].includes(key);
                      return (
                        <td key={key} className="p-2 border">
                          {editingId === row.id && isEditable ? (
                            <input
                              className="border p-1 rounded w-full"
                              defaultValue={row[key] ?? ""}
                              onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                            />
                          ) : (
                            row[key] != null ? String(row[key]) : "-"
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 border space-x-3">
                      <Link className="text-blue-600 underline" href={`/admin/school/branches/${row.id ?? row.uniqueId}`}>Open Branches</Link>
                      {editingId === row.id ? (
                        <>
                          <button
                            className="text-green-700 underline"
                            onClick={async () => {
                              const payload = {
                                id: row.id,
                                updates: editForm,
                              } as any;
                              const res = await dispatch(updateInstitution(payload));
                              if (updateInstitution.fulfilled.match(res)) {
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
                          <button className="text-blue-700 underline" onClick={() => { setEditingId(row.id); setEditForm({}); }}>
                            Edit
                          </button>
                          <button
                            className="text-red-700 underline"
                            onClick={async () => {
                              await dispatch(deleteInstitution(row.id));
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


