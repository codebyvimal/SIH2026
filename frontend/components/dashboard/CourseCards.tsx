import type { RecommendedCourse } from '@/types/schemas';

interface CourseCardsProps {
  courses: RecommendedCourse[];
}

// High-quality contextual images mapping
const COURSE_IMAGES = [
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&h=350&fit=crop", // Legal / Govt
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=350&fit=crop", // Tech / Data
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=350&fit=crop", // Leadership (People)
  "https://images.unsplash.com/photo-1510511459019-5efa37024838?w=500&h=350&fit=crop"  // Cyber / Screen
];

export default function CourseCards({ courses }: CourseCardsProps) {
  return (
    <div className="flex flex-col gap-5">
      {courses.map((c, i) => {
        const imageSrc = COURSE_IMAGES[i % COURSE_IMAGES.length];
        const rating = (4.5 + (c.relevance * 0.4)).toFixed(1);
        const reviews = Math.floor(c.relevance * 1000);
        const hours = Math.max(3, Math.floor(c.relevance * 10));

        return (
          <article
            key={c.course_id}
            className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* Left: Course Image */}
            <div className="h-48 w-full shrink-0 sm:h-auto sm:w-[220px]">
              <img 
                src={imageSrc} 
                alt={c.course} 
                className="h-full w-full rounded-xl object-cover" 
              />
            </div>

            {/* Right: Content Body */}
            <div className="flex flex-1 flex-col py-1">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    COURSE
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-800">
                    {c.course}
                  </h3>
                  
                  {/* Stats Row */}
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1 text-amber-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {rating} <span className="text-slate-500 font-normal">({reviews})</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {hours} Hours
                    </span>
                  </div>
                </div>

                {/* Bookmark Icon */}
                <button className="text-slate-400 hover:text-slate-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
              </div>

              {/* Why Recommended Callout */}
              <div className="mt-auto pt-5">
                <div className="flex items-start gap-3 rounded-xl border border-orange-100 bg-[#FFF9F2] p-4">
                  <div className="mt-0.5 text-orange-500 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#B45309]">Why recommended?</h4>
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
