"use client";
import React from "react";

export default function AddCustomerLevel() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 shadow-sm" style={{ background: "linear-gradient(90deg,#19d3ac,#16b8a9)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Add Customer Level</h2>
          <button className="px-4 py-2 bg-teal-700/80 text-white rounded-lg shadow hover:bg-teal-700">How it works</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-8">
        <div className="rounded-lg bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 text-sm">
          <strong className="mr-2">ⓘ</strong> At present there is only one level available which is the default level. When a customer logs in to the app for the first time they will automatically be assigned the default level.
        </div>

        <section>
          <h3 className="text-gray-900 font-bold mb-3">Current Level Info</h3>
          <p className="text-sm text-gray-600 mb-4">The Current Level setup automatically assigns customers the default level upon their initial app login</p>
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Level Sequence</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500">
                  <option>2</option>
                  <option>1</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Level Name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" placeholder="Ex: Platinum" />
              </div>
              <div>
                <div className="text-center font-semibold text-gray-800 mb-2">Level Icon</div>
                <div className="border-2 border-dashed rounded-xl p-10 text-center text-sm text-gray-600">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 mb-2 grid place-items-center">⬆</div>
                  <div className="font-semibold text-teal-700">Click to upload</div>
                  <div className="text-gray-500">Or drag and drop</div>
                  <p className="text-xs text-gray-500 mt-4">File Format - png Image Size - Maximum Size 5 MB.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-gray-900 font-bold mb-3">Set A Deserving Reward And Target For Upgrading To The Next Level.</h3>
          <p className="text-sm text-gray-600 mb-4">Setting the Stage for Rewards and Targets. Once a target is completed or fulfilled move on to the next one</p>

          <div className="rounded-xl border border-gray-200 p-6 mb-6">
            <div className="text-center text-gray-700 font-semibold mb-3">Reward Type</div>
            <p className="text-sm text-gray-500 mb-4 text-center">The customer will receive that reward amount while completing this level targets</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500">
              <option>Select reward type</option>
              <option>Flat Amount</option>
              <option>Percentage</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="inline-flex items-center gap-2 text-gray-900 font-medium">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" /> Minimum Ride Complete
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Minimum Ride Number" />
                <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Points" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow">Save Level</button>
        </div>
      </div>
    </div>
  );
}





