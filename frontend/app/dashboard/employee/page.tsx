import { getEmployeeDashboardMock } from '@/lib/mockData';
import GapChart from '@/components/dashboard/GapChart';
import CourseCards from '@/components/dashboard/CourseCards';
import QuizFeedback from '@/components/dashboard/QuizFeedback';

export default function EmployeeDashboardPage() {
  const data = getEmployeeDashboardMock();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between bg-[#0B1B3D] px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-white p-1">
            {/* Mock Emblem / Logo */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">National Learning Portal</h1>
            <p className="text-[10px] text-slate-300">Government of India</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button className="flex items-center gap-2 border-b-2 border-white pb-1 text-sm font-semibold text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            My Dashboard
          </button>
          <button className="flex items-center gap-2 pb-1 text-sm text-slate-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Learn Hub
          </button>
          <button className="flex items-center gap-2 pb-1 text-sm text-slate-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Assessments
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-300 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-300 border-2 border-slate-400">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Profile" className="h-full w-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Column: Profile & Radar Chart */}
          <div className="space-y-6 lg:col-span-4">

            {/* Profile Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Rahul Sharma" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Rahul Sharma</h2>
                  <p className="text-sm font-medium text-slate-600">Section Officer</p>
                  <p className="text-xs text-slate-500 mt-1">Ministry of Finance</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ID: {data.official_id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Department</p>
                    <p className="text-sm font-bold text-slate-800">Expenditure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Years of Service</p>
                    <p className="text-sm font-bold text-slate-800">6.2 Years</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Radar Chart */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-800">Skill Gap Overview</h3>
              <GapChart gaps={data.gaps} />
            </section>

            {/* Quiz Feedback (Extra data from schema not in image) */}
            {data.latest_grading && (
               <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-800">Recent Assessment</h3>
                  <QuizFeedback grading={data.latest_grading} />
               </section>
            )}

          </div>

          {/* Right Column: Recommendations */}
          <div className="lg:col-span-8">
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">Recommended for You</h2>
                <p className="text-sm text-slate-500">Based on your skill gaps and role</p>
              </div>

              <CourseCards courses={data.recommended} />

              <div className="mt-6 flex justify-center">
                <button className="rounded-lg border border-blue-200 px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                  View All Recommendations &gt;
                </button>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
