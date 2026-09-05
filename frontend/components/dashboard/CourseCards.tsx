"use client";

import { useState } from 'react';
import { API_BASE } from "@/lib/config";
import type { RecommendedCourse } from '@/types/schemas';

interface CourseCardsProps {
  courses: RecommendedCourse[];
  officialId: string;
}


const CourseCoverSVG = ({ seed }: { seed: number }) => {
  const colors = [
    ['#38bdf8', '#0284c7'],
    ['#34d399', '#059669'],
    ['#fbbf24', '#d97706'],
    ['#a78bfa', '#7c3aed'],
    ['#f472b6', '#db2777'],
  ];
  const [color1, color2] = colors[seed % colors.length];
  
  return (
    <svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" className="h-full w-full rounded-xl object-cover">
      <defs>
        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <pattern id={`pattern-${seed}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="#ffffff" fillOpacity="0.1" />
        </pattern>
      </defs>
      <rect width="500" height="350" fill={`url(#grad-${seed})`} />
      <rect width="500" height="350" fill={`url(#pattern-${seed})`} />
      
      {/* Abstract decorative elements */}
      <circle cx="250" cy="175" r="80" fill="#ffffff" fillOpacity="0.1" />
      <rect x="210" y="135" width="80" height="80" rx="10" fill="#ffffff" fillOpacity="0.2" />
      <polygon points="250,110 300,210 200,210" fill="#ffffff" fillOpacity="0.1" />
    </svg>
  );
};


export default function CourseCards({ courses, officialId }: CourseCardsProps) {
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleEnroll = async (courseId: string) => {
    if (enrolled[courseId] || loading[courseId]) return;
    
    setLoading(prev => ({ ...prev, [courseId]: true }));
    
    try {
      
      const res = await fetch(`${API_BASE}/igot/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          official_id: officialId,
          course_id: courseId,
        }),
      });
      
      if (res.ok) {
        setEnrolled(prev => ({ ...prev, [courseId]: true }));
      } else {
        console.error('Failed to enroll');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {courses.map((c, i) => {
        const isEnrolled = enrolled[c.course_id];
        const isLoading = loading[c.course_id];

        return (
          <article
            key={c.course_id}
            className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* Left: Course Image */}
            <div className="h-48 w-full shrink-0 sm:h-auto sm:w-[220px]">
              <CourseCoverSVG seed={i} />
            </div>

            {/* Right: Content Body */}
            <div className="flex flex-1 flex-col py-1">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-600">
                      #{i + 1}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      COURSE
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-slate-800">
                    {c.course}
                  </h3>

                  {/* Stats Row */}
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {c.duration_hours} Hours
                    </span>
                  </div>
                </div>

                {/* Bookmark Icon */}
                <div className="flex flex-col items-end">
                  <button 
                    onClick={() => handleEnroll(c.course_id)}
                    disabled={isEnrolled || isLoading}
                    className={`transition-colors ${isEnrolled ? 'text-blue-600 cursor-default' : 'text-slate-400 hover:text-slate-700'} ${isLoading ? 'opacity-50 cursor-wait' : ''} disabled:cursor-not-allowed`}
                    title="Bookmark / Enroll"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isEnrolled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                  </button>
                  {isEnrolled && <span className="text-[10px] text-blue-600 font-semibold mt-1">Bookmarked</span>}
                </div>
              </div>

              {/* Why Recommended Callout */}
              <div className="mt-auto pt-5">
                <div className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <div className="mt-0.5 text-orange-500 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700">Why recommended?</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                      {c.why}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
