"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getLandingPageSetup, updateLandingPageSetup } from "@/utils/reducers/adminReducers";

interface TestimonialItem {
  id?: string;
  reviewerName: string;
  designation: string;
  rating: string;
  review: string;
  reviewerImage?: string;
  status?: boolean;
}

export default function Testimonial() {
  const dispatch = useAppDispatch();
  const { landingPageSetup, isLoading, error } = useAppSelector((s) => s.pagesMedia);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>({
    reviewerName: "",
    designation: "",
    rating: "",
    review: "",
    status: true,
  });
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getLandingPageSetup()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (landingPageSetup?.testimonials) {
      setTestimonials(landingPageSetup.testimonials);
    }
  }, [landingPageSetup]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTestimonialForm({ ...testimonialForm, reviewerImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (editingId) {
      setTestimonials(
        testimonials.map((t) => (t.id === editingId ? { ...testimonialForm, id: editingId } : t))
      );
      setEditingId(null);
    } else {
      setTestimonials([...testimonials, { ...testimonialForm, id: Date.now().toString() }]);
    }
    setTestimonialForm({
      reviewerName: "",
      designation: "",
      rating: "",
      review: "",
      status: true,
    });
    setSubmitSuccess("Testimonial saved successfully!");
    setTimeout(() => setSubmitSuccess(null), 3000);
  };

  const handleEdit = (testimonial: TestimonialItem) => {
    setTestimonialForm(testimonial);
    setEditingId(testimonial.id || null);
  };

  const handleDelete = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, status: !t.status } : t))
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">TESTIMONIAL</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testimonialForm.reviewerName}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, reviewerName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: Ahmed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testimonialForm.designation}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, designation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: 5 Star"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={testimonialForm.review}
                onChange={(e) => {
                  if (e.target.value.length <= 800) {
                    setTestimonialForm({ ...testimonialForm, review: e.target.value });
                  }
                }}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: review ..."
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{testimonialForm.review.length}/800</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reviewer Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {testimonialForm.reviewerImage ? (
                <div className="relative">
                  <img
                    src={testimonialForm.reviewerImage}
                    alt="Reviewer preview"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <button
                    onClick={() => document.getElementById("testimonialImageUpload")?.click()}
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
                    htmlFor="testimonialImageUpload"
                    className="cursor-pointer mt-4 inline-block text-sm text-gray-600"
                  >
                    Click to upload Or drag and drop
                  </label>
                  <input
                    id="testimonialImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">1:1</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() =>
              setTestimonialForm({
                reviewerName: "",
                designation: "",
                rating: "",
                review: "",
                status: true,
              })
            }
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            RESET
          </button>
          <button
            onClick={handleSave}
            disabled={
              !testimonialForm.reviewerName ||
              !testimonialForm.designation ||
              !testimonialForm.rating ||
              !testimonialForm.review
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            SAVE
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      {testimonials.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Testimonials List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">SL</th>
                  <th className="text-left py-2 px-3">Reviewer Image</th>
                  <th className="text-left py-2 px-3">Reviewer Name</th>
                  <th className="text-left py-2 px-3">Designation</th>
                  <th className="text-left py-2 px-3">Rating</th>
                  <th className="text-left py-2 px-3">Review</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((testimonial, index) => (
                  <tr key={testimonial.id} className="border-b">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">
                      {testimonial.reviewerImage ? (
                        <img
                          src={testimonial.reviewerImage}
                          alt={testimonial.reviewerName}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      )}
                    </td>
                    <td className="py-2 px-3">{testimonial.reviewerName}</td>
                    <td className="py-2 px-3">{testimonial.designation}</td>
                    <td className="py-2 px-3">{testimonial.rating}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 max-w-xs truncate">{testimonial.review}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => testimonial.id && handleToggleStatus(testimonial.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          testimonial.status ? "bg-teal-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            testimonial.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
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
                          onClick={() => testimonial.id && handleDelete(testimonial.id)}
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

