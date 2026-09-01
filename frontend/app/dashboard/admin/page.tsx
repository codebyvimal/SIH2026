import adminData from '@/mock_data/admin_dashboard.json';
import AdminDomainChart from '@/components/dashboard/AdminDomainChart';
import AdminTopCourses from '@/components/dashboard/AdminTopCourses';

export default function AdminDashboardPage() {
  const data = adminData;

  const domainLabels: Record<string, string> = {
    digital_tools: 'Digital Tools',
    statistical_methods: 'Statistical Methods',
    data_management: 'Data Management',
    domain_knowledge: 'Domain Knowledge',
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between bg-[#0B1B3D] px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-white p-1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">National Learning Portal</h1>
            <p className="text-[10px] text-slate-300">Government of India — Admin View</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button className="flex items-center gap-2 border-b-2 border-white pb-1 text-sm font-semibold text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Admin Dashboard
          </button>
          <button className="flex items-center gap-2 pb-1 text-sm text-slate-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Officials
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">ADMIN</span>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-300 border-2 border-amber-400">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Admin"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">

        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Training & Skill Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Aggregated view across all registered officials</p>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Officials</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.total_officials.toLocaleString()}</p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">▲ 12% this quarter</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Domains Tracked</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.domain_aggregates.length}</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">Competency areas</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Gap (All)</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {(data.domain_aggregates.reduce((s, d) => s + d.avg_gap, 0) / (data.domain_aggregates.length || 1)).toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">out of 4.0 scale</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Top Courses</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.top_recommended_courses.length}</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">Recommended platform-wide</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-12 mb-6">

          {/* Domain Gap Bar Chart */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
            <h3 className="mb-1 text-base font-bold text-slate-800">Gap by Competency Domain</h3>
            <p className="mb-4 text-xs text-slate-400">Average skill gap score (0–4) per domain</p>
            <AdminDomainChart aggregates={data.domain_aggregates} domainLabels={domainLabels} />
          </section>

          {/* Officials Below Target */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
            <h3 className="mb-1 text-base font-bold text-slate-800">Officials Below Target</h3>
            <p className="mb-4 text-xs text-slate-400">Count per domain needing immediate training</p>
            <div className="space-y-4">
              {data.domain_aggregates.map((d) => {
                const pct = Math.round((d.officials_below_target / data.total_officials) * 100);
                const label = domainLabels[d.domain] ?? d.domain;
                return (
                  <div key={d.domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                      <span className="text-sm font-bold text-slate-800">
                        {d.officials_below_target.toLocaleString()} <span className="text-xs text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-rose-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Top Courses */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-base font-bold text-slate-800">Top Recommended Courses</h3>
          <p className="mb-4 text-xs text-slate-400">Ranked by enrollment frequency across all officials</p>
          <AdminTopCourses courses={data.top_recommended_courses} />
        </section>

      </main>
    </div>
  );
}
