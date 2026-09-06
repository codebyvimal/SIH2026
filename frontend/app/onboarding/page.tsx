"use client";

import React, { useState, useRef, useEffect } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOSPI_DEPARTMENTS = [
  "Ministry of Statistics & Programme Implementation (MoSPI)",
  "Central Statistics Office (CSO)",
  "National Statistical Office (NSO)",
  "National Sample Survey Office (NSSO)",
  "National Statistical Systems Training Academy (NSSTA)",
  "Computer Centre, MoSPI",
  "Economic Advisory Council",
  "Planning & Coordination Division",
  "Data Management & Dissemination Division",
  "Social Statistics Division",
  "Economic Statistics Division",
  "Technical Coordination Division",
  "State Directorate of Economics & Statistics",
  "District Statistics Office",
  "Registrar General of India",
  "Office of the Comptroller & Auditor General",
  "NITI Aayog",
  "Reserve Bank of India",
  "National Informatics Centre (NIC)",
  "Indian Statistical Institute (ISI)",
];

const EDUCATION_OPTIONS = [
  "B.Sc. Statistics",
  "B.Sc. Mathematics",
  "B.Sc. Economics",
  "B.Sc. Computer Science",
  "B.E. / B.Tech. Computer Science",
  "B.E. / B.Tech. Information Technology",
  "B.A. Economics",
  "M.Sc. Statistics",
  "M.Sc. Mathematics",
  "M.Sc. Data Science",
  "M.Sc. Applied Statistics",
  "M.A. Economics",
  "M.Tech. Computer Science",
  "MBA (Finance / Analytics)",
  "M.Phil. Statistics",
  "Ph.D. Statistics",
  "Ph.D. Economics",
  "Ph.D. Mathematics",
  "Post Graduate Diploma in Statistics",
  "Post Graduate Diploma in Data Science",
  "IAS / IFS (with Statistics background)",
  "Indian Statistical Service (ISS)",
];

const PAST_TRAINING_OPTIONS = [
  "Statistical Data Analysis using R",
  "Statistical Data Analysis using Python",
  "Data Science with Machine Learning",
  "Excel for Data Analysis",
  "Power BI / Tableau for Visualization",
  "SQL & Database Management",
  "Big Data Technologies (Hadoop, Spark)",
  "Survey Methodology & Sampling Techniques",
  "Time Series Analysis & Forecasting",
  "National Accounts Statistics",
  "Economic Census Methodology",
  "GIS & Geospatial Data Analysis",
  "Data Governance & Data Quality",
  "Statistical Report Writing",
  "SDG Monitoring Framework",
  "Foundation Course on Statistics (NSSTA)",
  "Advanced Statistical Methods (NSSTA)",
  "iGOT Digital Leadership Programme",
  "Karmayogi Mission Orientation",
  "Office Automation & e-Governance",
  "Cybersecurity Awareness Training",
  "Right to Information (RTI) Act",
  "Government Financial Management",
];

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

  const [deptQuery, setDeptQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  
  const [eduQuery, setEduQuery] = useState("");
  const [showEduDropdown, setShowEduDropdown] = useState(false);

  const filteredDepts = MOSPI_DEPARTMENTS.filter((d) =>
    d.toLowerCase().includes(deptQuery.toLowerCase())
  ).slice(0, 6);

  const filteredEdus = EDUCATION_OPTIONS.filter((e) =>
    e.toLowerCase().includes(eduQuery.toLowerCase())
  ).slice(0, 6);

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
      <div className="min-h-screen bg-gov-bg flex flex-col items-center justify-center font-montserrat text-gray-800">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-white ring-4 ring-gov-blue/30 shadow-lg">
            <svg className="animate-spin h-10 w-10 text-gov-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight animate-pulse text-gov-blue">Personalising your recommendations...</h2>
          <p className="text-gray-500 text-sm max-w-sm text-center">
            Running competency gap analysis against the MoSPI framework and performing semantic search for optimal courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col font-montserrat text-gray-800">
      <header className="bg-gov-blue shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
              <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
                <circle cx="40" cy="40" r="36" stroke="#264092" strokeWidth="3.5" />
                <circle cx="40" cy="40" r="28" stroke="#264092" strokeWidth="1.2" />
                <circle cx="40" cy="40" r="20" stroke="#264092" strokeWidth="1" />
                <circle cx="40" cy="40" r="6" fill="#264092" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * Math.PI) / 12;
                  return (
                    <line
                      key={i}
                      x1={40 + 6 * Math.cos(angle)}
                      y1={40 + 6 * Math.sin(angle)}
                      x2={40 + 28 * Math.cos(angle)}
                      y2={40 + 28 * Math.sin(angle)}
                      stroke="#264092"
                      strokeWidth="1.2"
                    />
                  );
                })}
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-wide leading-tight">
                National Learning Portal
              </h1>
              <p className="text-blue-200 text-xs font-medium tracking-wider uppercase">
                Karmayogi Bharat — MoSPI
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
          <div className="bg-gov-blue rounded-t-2xl p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Officer Registration</h1>
            <p className="text-blue-200 text-sm mt-1">Create your Karmayogi profile to get personalized learning recommendations</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-8 h-8 rounded-full bg-white text-gov-blue text-sm font-bold flex items-center justify-center">1</span>
              <div className="w-12 h-0.5 bg-blue-400"></div>
              <span className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">2</span>
              <div className="w-12 h-0.5 bg-blue-400"></div>
              <span className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">3</span>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white rounded-b-2xl">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    list="mospi-roles"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Statistical Officer"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
                  />
                  <datalist id="mospi-roles">
                    <option value="Statistical Officer" />
                    <option value="Data Analyst" />
                    <option value="Senior Statistician" />
                    <option value="Director" />
                    <option value="Deputy Director" />
                    <option value="Research Officer" />
                  </datalist>
                </div>
                
                <div className="space-y-2 relative">
                  <label htmlFor="dept" className="text-sm font-semibold text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="dept"
                    name="dept"
                    value={formData.dept}
                    onChange={(e) => {
                      setDeptQuery(e.target.value);
                      setFormData(prev => ({...prev, dept: e.target.value}));
                      setShowDeptDropdown(true);
                    }}
                    onFocus={() => setShowDeptDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDeptDropdown(false), 200)}
                    placeholder="e.g. MoSPI, NSO, NSSTA..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
                    required
                    autoComplete="off"
                  />
                  {showDeptDropdown && filteredDepts.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-52 overflow-y-auto">
                      {filteredDepts.map(dept => (
                        <li
                          key={dept}
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-gov-blue cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                          onMouseDown={() => {
                            setFormData(prev => ({...prev, dept}));
                            setDeptQuery(dept);
                            setShowDeptDropdown(false);
                          }}
                        >
                          {dept}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label htmlFor="education" className="text-sm font-semibold text-gray-700">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={(e) => {
                      setEduQuery(e.target.value);
                      setFormData(prev => ({...prev, education: e.target.value}));
                      setShowEduDropdown(true);
                    }}
                    onFocus={() => setShowEduDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEduDropdown(false), 200)}
                    placeholder="e.g. M.Sc. Statistics"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
                    required
                    autoComplete="off"
                  />
                  {showEduDropdown && filteredEdus.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-52 overflow-y-auto">
                      {filteredEdus.map(edu => (
                        <li
                          key={edu}
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-gov-blue cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                          onMouseDown={() => {
                            setFormData(prev => ({...prev, education: edu}));
                            setEduQuery(edu);
                            setShowEduDropdown(false);
                          }}
                        >
                          {edu}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="experience_years" className="text-sm font-semibold text-gray-700">
                    Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="experience_years"
                    name="experience_years"
                    min="0"
                    required
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Past Trainings (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTraining}
                    className="text-xs font-semibold text-gov-blue hover:text-gov-blue-dark transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Training
                  </button>
                </div>
                
                {formData.past_trainings.length === 0 && (
                  <div className="text-xs text-gray-500 italic px-1">
                    No past trainings added. Click &apos;Add Training&apos; to include them.
                  </div>
                )}

                <div className="space-y-3">
                  {formData.past_trainings.map((training, index) => (
                    <div key={index} className="flex items-center gap-3 animate-fade-in-up">
                      <div className="flex-1">
                        <input
                          type="text"
                          list={`past-trainings-list-${index}`}
                          placeholder="e.g. Data Analytics Bootcamp"
                          value={training.course_name}
                          onChange={(e) => handleTrainingChange(index, e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
                          autoComplete="off"
                        />
                        <datalist id={`past-trainings-list-${index}`}>
                          {PAST_TRAINING_OPTIONS.map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTraining(index)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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

              <div className="pt-6 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gov-blue hover:bg-gov-blue-dark text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                    "Create Profile & Start Learning →"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
