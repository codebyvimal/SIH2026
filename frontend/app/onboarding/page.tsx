"use client";

import React, { useState } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "",
    dept: "",
    education: "",
    experience_years: 0,
    past_trainings: [] as { course_name: string }[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience_years" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTraining = () => {
    setFormData((prev) => ({
      ...prev,
      past_trainings: [...prev.past_trainings, { course_name: "" }],
    }));
  };

  const handleRemoveTraining = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      past_trainings: prev.past_trainings.filter((_, i) => i !== index),
    }));
  };

  const handleTrainingChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newTrainings = [...prev.past_trainings];
      newTrainings[index].course_name = value;
      return { ...prev, past_trainings: newTrainings };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      past_trainings: formData.past_trainings.filter(
        (t) => t.course_name.trim() !== ""
      ),
    };

    try {
      
      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create profile. Please check your inputs.");
      }

      const data = await res.json();
      if (data.official_id) {
        setIsPersonalizing(true);
        setTimeout(() => {
          router.push(`/dashboard/employee?official_id=${data.official_id}`);
        }, 2500);
      } else {
        throw new Error("No official_id returned from server.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (isPersonalizing) {
    return (
      <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center font-sans text-slate-200">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-slate-800/50 ring-4 ring-saffron/30">
            <svg className="animate-spin h-10 w-10 text-saffron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight animate-pulse text-white">Personalising your recommendations...</h2>
          <p className="text-slate-400 text-sm max-w-sm text-center">
            Running competency gap analysis against the MoSPI framework and performing semantic search for optimal courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col font-sans text-slate-200">
      <header className="flex items-center justify-center py-6 border-b border-white/10 bg-deep-navy/80 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-3 group">
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            fill="none"
            className="text-saffron group-hover:scale-110 transition-transform"
          >
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            {[...Array(24)].map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 38 * Math.cos(i * (Math.PI / 12))}
                y2={50 + 38 * Math.sin(i * (Math.PI / 12))}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <span className="text-xl font-bold tracking-tight text-white uppercase">
            National Learning Portal
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 animate-fade-in-up">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Officer Registration</h1>
            <p className="text-slate-400 text-sm">
              Create your profile to get personalized learning recommendations.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-300">
                  Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Statistical Officer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dept" className="text-sm font-medium text-slate-300">
                  Department <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="dept"
                  name="dept"
                  required
                  value={formData.dept}
                  onChange={handleChange}
                  placeholder="e.g. MoSPI"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="education" className="text-sm font-medium text-slate-300">
                  Education <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  required
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. M.Sc. Statistics"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="experience_years"
                  className="text-sm font-medium text-slate-300"
                >
                  Experience (Years) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="experience_years"
                  name="experience_years"
                  min="0"
                  required
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Past Trainings (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleAddTraining}
                  className="text-xs font-semibold text-saffron hover:text-orange-500 transition-colors flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Training
                </button>
              </div>
              
              {formData.past_trainings.length === 0 && (
                <div className="text-xs text-slate-500 italic px-1">
                  No past trainings added. Click &apos;Add Training&apos; to include them.
                </div>
              )}

              <div className="space-y-3">
                {formData.past_trainings.map((training, index) => (
                  <div key={index} className="flex items-center gap-3 animate-fade-in-up">
                    <input
                      type="text"
                      placeholder="e.g. Data Analytics Bootcamp"
                      value={training.course_name}
                      onChange={(e) => handleTrainingChange(index, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTraining(index)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                      title="Remove training"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-saffron/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Create Profile & Continue"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
