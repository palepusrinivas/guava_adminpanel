"use client";
import React, { useState } from "react";

export default function AddDriver() {
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Add Driver</h2>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {success && (<div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{success}</div>)}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-gray-900 font-bold mb-4">GENERAL INFO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Maximilian" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Schwarzmüller" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: company@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identity Type *</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500">
                  <option>-- Select identity type --</option>
                  <option>Passport</option>
                  <option>National ID</option>
                  <option>Driver License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identity Number *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: 3032" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-gray-900 font-semibold mb-2">Identity card image</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-600">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 mb-2 grid place-items-center">⬆</div>
                  <div className="font-semibold text-teal-700">Click To Upload</div>
                  <div className="text-gray-500">Or Drag And Drop</div>
                </div>
                <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-600">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 mb-2 grid place-items-center">⬆</div>
                  <div className="font-semibold text-teal-700">Click To Upload</div>
                  <div className="text-gray-500">Or Drag And Drop</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">JPG JPEG PNG WEBP. Less Than 1MB</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-4 text-center">Driver image</h3>
            <div className="border-2 border-dashed rounded-xl p-10 text-center text-sm text-gray-600">
              <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 mb-2 grid place-items-center">⬆</div>
              <div className="font-semibold text-teal-700">Click to upload</div>
              <div className="text-gray-500">Or drag and drop</div>
              <p className="text-xs text-gray-500 mt-4">JPG JPEG PNG WEBP. Less Than 1MB</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => setSuccess("Driver saved successfully (UI-only)")} className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow">Save</button>
        </div>
      </div>
    </div>
  );
}





