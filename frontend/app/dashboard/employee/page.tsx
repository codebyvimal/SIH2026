import Link from 'next/link';
import { fetchEmployeeDashboard, fetchOfficials } from '@/lib/api';
import GapChart from '@/components/dashboard/GapChart';
import CourseCards from '@/components/dashboard/CourseCards';
import QuizFeedback from '@/components/dashboard/QuizFeedback';

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams?: { official_id?: string };
}) {
  const officialId = searchParams?.official_id;
  const [data, officials] = await Promise.all([
    fetchEmployeeDashboard(officialId),
    fetchOfficials(),
  ]);

  const currentOfficial = officials.find((o) => o.official_id === data.official_id) || {
    official_id: data.official_id,
    role: 'Analyst',
    dept: 'Statistics',
    experience_years: 3,
    education: 'M.Sc. Statistics',
  };

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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide">National Learning Portal</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Backend Connected
              </span>
            </div>
            <p className="text-[10px] text-slate-300">Government of India — MoSPI</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button className="flex items-center gap-2 border-b-2 border-white pb-1 text-sm font-semibold text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            My Dashboard
          </button>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 pb-1 text-sm text-slate-300 hover:text-white transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Swagger API Docs ↗
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition flex items-center gap-1 border border-white/20"
          >
            Switch to Admin &rarr;
          </Link>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-300 border-2 border-slate-400">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Profile" className="h-full w-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {/* Official Quick Switcher */}
        {officials.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                👤
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Officer Profile in SQLite Database</p>
                <p className="text-[11px] text-slate-500">Select an official to dynamically recalculate skill gaps & FAISS recommendations</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {officials.slice(0, 5).map((o) => {
                const isSelected = o.official_id === data.official_id;
                return (
                  <Link
                    key={o.official_id}
                    href={`/dashboard/employee?official_id=${o.official_id}`}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-blue-100/50 border border-slate-200'
                    }`}
                  >
                    {o.role} ({o.official_id.slice(0, 6)}…)
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Column: Profile & Radar Chart */}
          <div className="space-y-6 lg:col-span-4">

            {/* Profile Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Official" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Officer {currentOfficial.official_id.slice(0, 8).toUpperCase()}</h2>
                  <p className="text-sm font-semibold text-blue-600">{currentOfficial.role}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{currentOfficial.dept} Department</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">ID: {currentOfficial.official_id}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Education</p>
                    <p className="text-sm font-bold text-slate-800">{currentOfficial.education}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Experience</p>
                    <p className="text-sm font-bold text-slate-800">{currentOfficial.experience_years} Years</p>
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
