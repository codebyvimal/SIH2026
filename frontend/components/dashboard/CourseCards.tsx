'use client';

import { useState } from 'react';
import { API_BASE } from "@/lib/config";
import type { RecommendedCourse } from '@/types/schemas';

interface CourseCardsProps {
  courses: RecommendedCourse[];
  officialId: string;
}

export default function CourseCards({ courses, officialId }: CourseCardsProps) {
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleEnroll = async (courseId: string) => {
    if (enrolled[courseId] || loading[courseId]) return;
    
    setLoading(prev => ({ ...prev, [courseId]: true }));
    
    try {
      const res = await fetch(`${API_BASE}/igot/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ official_id: officialId, course_id: courseId })
      });

      if (!res.ok) throw new Error('Failed to enroll');
      setEnrolled(prev => ({ ...prev, [courseId]: true }));
    } catch (error) {
      console.error(error);
      alert("Failed to enroll in course.");
    } finally {
      setLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  if (!courses?.length) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
        No courses recommended currently.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((c, i) => {
        const isEnrolled = enrolled[c.course_id];
        const isLoading = loading[c.course_id];
        const relPercent = Math.round(c.relevance * 100);
        
        return (
          <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#264092] hover:shadow-md transition-all bg-white group">
            {/* Course Icon Placeholder (Clean Gov Style) */}
            <div className="w-full sm:w-32 h-24 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{c.course}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold whitespace-nowrap">
                      {c.duration_hours}h
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-bold whitespace-nowrap border border-green-100">
                      {relPercent}% Match
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 p-2 rounded-md mt-2 flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#FFA730] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  <p className="line-clamp-2">{c.why}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => handleEnroll(c.course_id)}
                  disabled={isEnrolled || isLoading}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    isEnrolled 
                      ? 'bg-green-600 text-white cursor-default' 
                      : 'bg-[#264092] hover:bg-[#1A2C68] text-white'
                  } disabled:opacity-80`}
                >
                  {isEnrolled ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Enrolled
                    </>
                  ) : isLoading ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
