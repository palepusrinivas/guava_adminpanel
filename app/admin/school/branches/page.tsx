"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { listAllBranches } from "@/utils/slices/schoolSlice";
import Link from "next/link";

export default function AllBranchesPage() {
  const dispatch = useAppDispatch();
  const { branchesAll, isLoading, error } = useAppSelector((s) => s.school);

  useEffect(() => {
    dispatch(listAllBranches());
  }, [dispatch]);

  const renderTable = () => {
    if (!branchesAll || branchesAll.length === 0) {
      return <div className="p-4 text-sm text-gray-600 border rounded">No branches found.</div>;
    }
    const first = (branchesAll[0] as unknown) as Record<string, unknown>;
    const preferred = ["id", "name", "city", "state", "pincode", "subscriptionPlan", "latitude", "longitude", "createdAt"];
    const dynamic = Object.keys(first).filter((k) => !preferred.includes(k) && typeof first[k] !== "object");
    const cols = [...preferred, ...dynamic];
    return (
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-50">
            {cols.map((key) => (
              <th key={key} className="p-2 border text-left">{key}</th>
            ))}
            <th className="p-2 border text-left">actions</th>
          </tr>
        </thead>
        <tbody>
          {branchesAll.map((b) => {
            const row = (b as unknown) as Record<string, any>;
            return (
              <tr key={row.id} className="border-b">
                {cols.map((key) => (
                  <td key={key} className="p-2 border">{row[key] != null ? String(row[key]) : "-"}</td>
                ))}
                <td className="p-2 border space-x-2">
                  <Link className="text-blue-600 underline" href={`/admin/school/buses/${row.id}`}>Buses</Link>
                  <Link className="text-blue-600 underline" href={`/admin/school/routes/${row.id}`}>Routes</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">All Branches</h1>
      {isLoading && <div className="text-sm text-gray-600">Loading...</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
      <div className="overflow-x-auto">{renderTable()}</div>
    </div>
  );
}


