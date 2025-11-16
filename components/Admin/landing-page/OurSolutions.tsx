"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getLandingPageSetup, updateLandingPageSetup } from "@/utils/reducers/adminReducers";

interface SolutionItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  status?: boolean;
}

export default function OurSolutions() {
  const dispatch = useAppDispatch();
  const { landingPageSetup, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState({ title: "", subTitle: "" });
  const [solutionForm, setSolutionForm] = useState<SolutionItem>({
    title: "",
    description: "",
    status: true,
  });
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getLandingPageSetup()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (landingPageSetup?.ourSolutions) {
      setSectionTitle(landingPageSetup.ourSolutions.sectionTitle || { title: "", subTitle: "" });
      setSolutions(landingPageSetup.ourSolutions.items || []);
    }
  }, [landingPageSetup]);

  const handleSolutionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSolutionForm({ ...solutionForm, icon: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSectionTitle = async () => {
    try {
      const updateData = {
        ...landingPageSetup,
        ourSolutions: {
          ...landingPageSetup?.ourSolutions,
          sectionTitle,
          items: solutions,
        },
      };
      const result = await dispatch(updateLandingPageSetup(updateData));
      if ((result as any).meta.requestStatus === "fulfilled") {
        setSubmitSuccess("Section title saved successfully!");
        setTimeout(() => setSubmitSuccess(null), 3000);
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to save.");
    }
  };

  const handleSaveSolution = () => {
    if (editingId) {
      setSolutions(solutions.map((s) => (s.id === editingId ? { ...solutionForm, id: editingId } : s)));
      setEditingId(null);
    } else {
      setSolutions([...solutions, { ...solutionForm, id: Date.now().toString() }]);
    }
    setSolutionForm({ title: "", description: "", status: true });
    setSubmitSuccess("Solution added successfully!");
    setTimeout(() => setSubmitSuccess(null), 3000);
  };

  const handleEdit = (solution: SolutionItem) => {
    setSolutionForm(solution);
    setEditingId(solution.id || null);
  };

  const handleDelete = (id: string) => {
    setSolutions(solutions.filter((s) => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setSolutions(
      solutions.map((s) => (s.id === id ? { ...s, status: !s.status } : s))
    );
  };

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">{submitError}</div>
      )}

      {/* Section Title */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Section Title</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sectionTitle.title}
              onChange={(e) => setSectionTitle({ ...sectionTitle, title: e.target.value })}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Book bike, auto & car rides instantly in Amalapuram and nearby towns!"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{sectionTitle.title.length}/100</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sectionTitle.subTitle}
              onChange={(e) => setSectionTitle({ ...sectionTitle, subTitle: e.target.value })}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="GAUVA MOBILITY SERVICES - Your Local Travel Partner! Now available in Amalapuram"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{sectionTitle.subTitle.length}/200</div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSectionTitle({ title: "", subTitle: "" })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              RESET
            </button>
            <button
              onClick={handleSaveSectionTitle}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Section Content</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={solutionForm.title}
                onChange={(e) => setSolutionForm({ ...solutionForm, title: e.target.value })}
                maxLength={255}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: Ride Sharing"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{solutionForm.title.length}/255</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={solutionForm.description}
                onChange={(e) => setSolutionForm({ ...solutionForm, description: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: Section Description"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSolutionForm({ title: "", description: "", status: true })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                RESET
              </button>
              <button
                onClick={handleSaveSolution}
                disabled={!solutionForm.title || !solutionForm.description}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
              >
                SAVE
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon / Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {solutionForm.icon ? (
                <div className="relative">
                  <img src={solutionForm.icon} alt="Icon preview" className="w-full h-auto rounded-lg mb-2" />
                  <button
                    onClick={() => document.getElementById("solutionIconUpload")?.click()}
                    className="absolute top-2 right-2 bg-teal-600 text-white p-1.5 rounded-full hover:bg-teal-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <label
                    htmlFor="solutionIconUpload"
                    className="cursor-pointer mt-4 inline-block text-sm text-gray-600"
                  >
                    Click to upload Or drag and drop
                  </label>
                  <input
                    id="solutionIconUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleSolutionImageUpload}
                    className="hidden"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">290x290 px</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions List */}
      {solutions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Existing Solutions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">SL</th>
                  <th className="text-left py-2 px-3">Image</th>
                  <th className="text-left py-2 px-3">Title</th>
                  <th className="text-left py-2 px-3">Sub Title</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {solutions.map((solution, index) => (
                  <tr key={solution.id} className="border-b">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">
                      {solution.icon ? (
                        <img src={solution.icon} alt={solution.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      )}
                    </td>
                    <td className="py-2 px-3">{solution.title}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 max-w-xs truncate">{solution.description}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => solution.id && handleToggleStatus(solution.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          solution.status ? "bg-teal-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            solution.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(solution)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => solution.id && handleDelete(solution.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

