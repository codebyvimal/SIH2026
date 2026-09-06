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

  const domains = Array.from(new Set(recommendations.map(r => r.domain))).filter(Boolean);

  const formatDomain = (d: string) => {
    return d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredRecs = activeDomain === "all" 
    ? recommendations 
    : recommendations.filter(r => r.domain === activeDomain);

  const groupedRecs = filteredRecs.reduce((acc, curr) => {
    const d = curr.domain;
    if (!acc[d]) acc[d] = [];
    acc[d].push(curr);
    return acc;
  }, {} as Record<string, CourseWithDomain[]>);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Filter by Domain</span>
        <button
          onClick={() => setActiveDomain("all")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeDomain === "all"
              ? "bg-gov-blue text-white shadow-md ring-2 ring-offset-2 ring-gov-blue/50"
              : "bg-white text-gov-blue border border-gov-blue hover:bg-blue-50"
          }`}
        >
          All Domains
        </button>
        {domains.map(domain => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeDomain === domain
                ? "bg-gov-blue text-white shadow-md ring-2 ring-offset-2 ring-gov-blue/50"
                : "bg-white text-gov-blue border border-gov-blue hover:bg-blue-50"
            }`}
          >
            {formatDomain(domain)}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {Object.entries(groupedRecs).map(([domain, courses]) => (
          <section key={domain} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gov-blue">
                {formatDomain(domain)}
              </h2>
              <span className="bg-blue-50 text-gov-blue py-1 px-3 rounded-lg text-sm font-bold">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>
            
            <div className="grid gap-6">
              <CourseCards courses={courses} officialId={officialId} />
            </div>
          </section>
        ))}

        {Object.keys(groupedRecs).length === 0 && (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-sm font-bold text-gray-800">No recommendations found</h3>
            <p className="mt-1 text-sm text-gray-500">There are no courses matching the selected domain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
