"use client";

import { useState } from "react";
import CourseCards from "@/components/dashboard/CourseCards";

export type CourseWithDomain = {
  course: string;
  course_id: string;
  relevance: number;
  why: string;
  duration_hours: number;
  domain: string;
  gap_skill?: string;
};

export default function RecommendationsClient({
  officialId,
  recommendations,
}: {
  officialId: string;
  recommendations: CourseWithDomain[];
}) {
  const [activeDomain, setActiveDomain] = useState<string>("all");

  // Get unique domains available in recommendations
  const domains = Array.from(new Set(recommendations.map(r => r.domain))).filter(Boolean);

  const formatDomain = (d: string) => {
    return d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredRecs = activeDomain === "all" 
    ? recommendations 
    : recommendations.filter(r => r.domain === activeDomain);

  // Group by domain for display
  const groupedRecs = filteredRecs.reduce((acc, curr) => {
    const d = curr.domain;
    if (!acc[d]) acc[d] = [];
    acc[d].push(curr);
    return acc;
  }, {} as Record<string, CourseWithDomain[]>);

  return (
    <div className="space-y-10">
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mr-2">Filter by Domain</span>
        <button
          onClick={() => setActiveDomain("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeDomain === "all"
              ? "bg-deep-navy text-white shadow-md ring-2 ring-offset-2 ring-deep-navy/50"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          All Domains
        </button>
        {domains.map(domain => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeDomain === domain
                ? "bg-blue-600 text-white shadow-md ring-2 ring-offset-2 ring-blue-500/50"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {formatDomain(domain)}
          </button>
        ))}
      </div>

      {/* Grid of Groups */}
      <div className="space-y-12">
        {Object.entries(groupedRecs).map(([domain, courses]) => (
          <section key={domain} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-bl-full opacity-50 -z-10 pointer-events-none"></div>
            
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="text-2xl font-bold text-slate-800">
                {formatDomain(domain)}
              </h2>
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>
            
            {/* The prompt says "full grid of CourseCards" but CourseCards is already designed as a column map. 
                We can wrap it in a grid if we want, or just let CourseCards render them in its normal list format. 
                Wait, CourseCards is a vertical stack of articles. Let's use it as is since we need to reuse the component. */}
            <div className="grid gap-6">
              <CourseCards courses={courses} officialId={officialId} />
            </div>
          </section>
        ))}

        {Object.keys(groupedRecs).length === 0 && (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-900">No recommendations found</h3>
            <p className="mt-1 text-sm text-slate-500">There are no courses matching the selected domain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
