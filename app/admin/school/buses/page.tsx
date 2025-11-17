"use client";
import React, { useState, useEffect } from "react";
import { getAllBuses, getBus, getBusActivation, activateBus } from "@/utils/schoolAdminApi";
import AdminDashboardLayout from "@/components/Admin/AdminDashboardLayout";

interface Bus {
  id: number;
  busNumber: string;
  capacity: number;
  type: string;
  branch?: {
    id: number;
    name: string;
  };
}

interface BusActivation {
  id: number;
  activationFee: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [activation, setActivation] = useState<BusActivation | null>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    loadBuses();
  }, []);

  useEffect(() => {
    if (selectedBus) {
      loadActivation(selectedBus);
    }
  }, [selectedBus]);

  const loadBuses = async () => {
    try {
      const data = await getAllBuses();
      setBuses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  const loadActivation = async (busId: number) => {
    try {
      const data = await getBusActivation(busId);
      if (data.message) {
        setActivation(null);
      } else {
        setActivation(data);
      }
    } catch (err: any) {
      setActivation(null);
    }
  };

  const handleActivate = async (busId: number) => {
    if (!confirm("Activate this bus for ₹354 for 6 months?")) return;
    try {
      setActivating(true);
      await activateBus(busId);
      await loadActivation(busId);
      await loadBuses();
      alert("Bus activated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to activate bus");
    } finally {
      setActivating(false);
    }
  };

  const isActivationActive = (activation: BusActivation | null) => {
    if (!activation) return false;
    if (activation.status !== "active") return false;
    const endDate = new Date(activation.endDate);
    return endDate > new Date();
  };

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Buses Management</h1>
          <button
            onClick={loadBuses}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading buses...</div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{bus.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{bus.busNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {bus.branch ? bus.branch.name : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">{bus.capacity || "-"}</td>
                    <td className="px-4 py-3 text-sm">{bus.type || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBus(bus.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View Activation
                        </button>
                        <button
                          onClick={() => handleActivate(bus.id)}
                          disabled={activating}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          {activating ? "Activating..." : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {buses.length === 0 && (
              <div className="text-center py-8 text-gray-500">No buses found</div>
            )}
          </div>
        )}

        {/* Activation Modal */}
        {selectedBus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Bus {buses.find(b => b.id === selectedBus)?.busNumber} - Activation Status
                </h2>
                <button
                  onClick={() => {
                    setSelectedBus(null);
                    setActivation(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {activation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isActivationActive(activation)
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {activation.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Fee:</span>
                    <span>₹{activation.activationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{new Date(activation.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">End Date:</span>
                    <span>{new Date(activation.endDate).toLocaleDateString()}</span>
                  </div>
                  {!isActivationActive(activation) && (
                    <button
                      onClick={() => {
                        setSelectedBus(null);
                        handleActivate(selectedBus);
                      }}
                      className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Activate Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No active activation found</p>
                  <button
                    onClick={() => {
                      setSelectedBus(null);
                      handleActivate(selectedBus);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Activate Bus (₹354 for 6 months)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    
  );
}

