import Link from 'next/link';
import { fetchAdminDashboard } from '@/lib/api';
import AdminDomainChart from '@/components/dashboard/AdminDomainChart';
import AdminTopCourses from '@/components/dashboard/AdminTopCourses';
import NavBar from "@/components/NavBar";
import { API_BASE } from "@/lib/config";

export default async function AdminDashboardPage() {
  const data = await fetchAdminDashboard();

  const domainLabels: Record<string, string> = {
    digital_tools: 'Digital Tools',
    statistical_methods: 'Statistical Methods',
    data_management: 'Data Management',
    domain_knowledge: 'Domain Knowledge',
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <NavBar 
        variant="admin" 
        navItems={[
    { label: "Admin Dashboard", href: "/dashboard/admin", active: true },
    { label: "Officials", href: "/dashboard/admin/officials", active: false }
  ]} 
        switchHref="/dashboard/employee"
        switchLabel="← Switch to Employee"
      />

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
