"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { createRoute, createStop, listBranches, listStops } from "@/utils/slices/schoolSlice";
import { toast } from "react-hot-toast";

export default function RoutesPage() {
  const { branchId } = useParams() as { branchId: string };
  const id = Number(branchId);
  const dispatch = useAppDispatch();
  const branchesByInstitution = useAppSelector((s) => s.school.branchesByInstitution);
  const routes = useAppSelector((s) => s.school.routesByBranch[id] || []);
  const stopsByRoute = useAppSelector((s) => s.school.stopsByRoute);

  const [routeForm, setRouteForm] = useState({ name: "", isMorning: "true" });
  const [stopForm, setStopForm] = useState({ routeId: "", name: "", latitude: "", longitude: "", stopOrder: "", etaMinutesFromPrev: "" });

  useEffect(() => {
    // routes come in after creates; stops load on selection
  }, []);

  const createRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.name) {
      toast.error("Route name is required");
      return;
    }
    const res = await dispatch(createRoute({ branchId: id, name: routeForm.name, isMorning: routeForm.isMorning === "true" }));
    if (createRoute.fulfilled.match(res)) {
      toast.success("Route created");
      setRouteForm({ name: "", isMorning: "true" });
    } else {
      toast.error("Failed to create route");
    }
  };

  const loadStops = async (routeId: number) => {
    await dispatch(listStops(routeId));
  };

  const createStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const routeId = Number(stopForm.routeId);
    if (!routeId || !stopForm.name) {
      toast.error("Select route and enter stop name");
      return;
    }
    const res = await dispatch(
      createStop({
        routeId,
        name: stopForm.name,
        latitude: stopForm.latitude ? Number(stopForm.latitude) : undefined,
        longitude: stopForm.longitude ? Number(stopForm.longitude) : undefined,
        stopOrder: stopForm.stopOrder ? Number(stopForm.stopOrder) : undefined,
        etaMinutesFromPrev: stopForm.etaMinutesFromPrev ? Number(stopForm.etaMinutesFromPrev) : undefined,
      })
    );
    if (createStop.fulfilled.match(res)) {
      toast.success("Stop added");
      setStopForm({ routeId: stopForm.routeId, name: "", latitude: "", longitude: "", stopOrder: "", etaMinutesFromPrev: "" });
      await loadStops(routeId);
    } else {
      toast.error("Failed to add stop");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Routes & Stops — Branch #{id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Create Route</h2>
          <form onSubmit={createRouteSubmit} className="space-y-3">
            <input className="border p-2 rounded w-full" placeholder="Route Name *" value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} />
            <select className="border p-2 rounded w-full" value={routeForm.isMorning} onChange={(e) => setRouteForm({ ...routeForm, isMorning: e.target.value })}>
              <option value="true">Morning</option>
              <option value="false">Evening</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Create Route</button>
          </form>
          <div className="mt-6">
            <h3 className="font-medium mb-2">Routes</h3>
            <ul className="space-y-2">
              {routes.map((r) => (
                <li key={r.id} className="p-2 border rounded flex items-center justify-between">
                  <span>{r.name} {r.isMorning ? "(Morning)" : "(Evening)"}</span>
                  <button className="text-blue-600 underline" onClick={() => loadStops(r.id)}>Load Stops</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="font-medium mb-2">Add Stop</h2>
          <form onSubmit={createStopSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="border p-2 rounded md:col-span-2" value={stopForm.routeId} onChange={(e) => setStopForm({ ...stopForm, routeId: e.target.value })}>
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name} {r.isMorning ? "(Morning)" : "(Evening)"}</option>
              ))}
            </select>
            <input className="border p-2 rounded" placeholder="Stop Name *" value={stopForm.name} onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Latitude" value={stopForm.latitude} onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Longitude" value={stopForm.longitude} onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Stop Order" value={stopForm.stopOrder} onChange={(e) => setStopForm({ ...stopForm, stopOrder: e.target.value })} />
            <input className="border p-2 rounded" placeholder="ETA Minutes From Previous" value={stopForm.etaMinutesFromPrev} onChange={(e) => setStopForm({ ...stopForm, etaMinutesFromPrev: e.target.value })} />
            <div className="md:col-span-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Stop</button>
            </div>
          </form>
          {stopForm.routeId && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Stops (Route #{stopForm.routeId})</h3>
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border text-left">Order</th>
                    <th className="p-2 border text-left">Name</th>
                    <th className="p-2 border text-left">Lat</th>
                    <th className="p-2 border text-left">Lng</th>
                    <th className="p-2 border text-left">ETA+min</th>
                  </tr>
                </thead>
                <tbody>
                  {(stopsByRoute[Number(stopForm.routeId)] || []).map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-2 border">{s.stopOrder ?? "-"}</td>
                      <td className="p-2 border">{s.name}</td>
                      <td className="p-2 border">{s.latitude ?? "-"}</td>
                      <td className="p-2 border">{s.longitude ?? "-"}</td>
                      <td className="p-2 border">{s.etaMinutesFromPrev ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


