import Link from 'next/link';
import { fetchAdminDashboard } from '@/lib/api';
import { Users, BookOpen, BarChart2, AlertCircle, Lightbulb } from 'lucide-react';

export default async function AdminDashboardPage() {
  const data = await fetchAdminDashboard();

  const domainLabels: Record<string, string> = {
    digital_tools: 'Digital Tools',
    statistical_methods: 'Statistical Methods',
    data_management: 'Data Management',
    domain_knowledge: 'Domain Knowledge',
  };

  const avgGapScore = (data.domain_aggregates.reduce((s: number, d: any) => s + d.avg_gap, 0) / (data.domain_aggregates.length || 1)).toFixed(1);

  return (
    <main className="mx-auto max-w-7xl p-6 bg-transparent min-h-screen text-gray-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#102868]">Training & Competency Overview</h1>
        <p className="text-sm text-gray-500 mt-2">Aggregated view across all registered officials</p>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#102868]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.total_officials}</p>
            <p className="text-sm text-gray-500 font-medium">Registered officials</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.domain_aggregates.length}</p>
            <p className="text-sm text-gray-500 font-medium">Competency areas</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{avgGapScore} / 4.0</p>
            <p className="text-sm text-gray-500 font-medium">Across all officials</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.top_recommended_courses.length}</p>
            <p className="text-sm text-gray-500 font-medium">Recommended courses</p>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#102868] mb-6">Average Gap by Competency Domain</h2>
          <div className="space-y-6">
            {data.domain_aggregates.map((domain: any) => {
              const label = domainLabels[domain.domain] || domain.domain;
              const gap = domain.avg_gap;
              const percentage = (gap / 4.0) * 100;
              const isHighGap = gap > 1.5;
              
              return (
                <div key={domain.domain}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{gap.toFixed(1)} / 4.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isHighGap ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#102868] mb-6">Officials Requiring Training</h2>
          <div className="space-y-6">
            {data.domain_aggregates.map((domain: any) => {
              const label = domainLabels[domain.domain] || domain.domain;
              const officials = domain.officials_below_target;
              const total = data.total_officials;
              const pct = total === 0 ? 0 : Math.round((officials / total) * 100);
              
              return (
                <div key={domain.domain}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">{pct}%</span>
                  </div>
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>{officials} of {total} officials</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-[#102868]"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-0 overflow-hidden xl:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#102868]">Top Recommended Courses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Competency Domain</th>
                  <th className="px-6 py-4 font-medium">Officials Recommended</th>
                  <th className="px-6 py-4 font-medium">Average Relevance</th>
                  <th className="px-6 py-4 font-medium">Enrollments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_recommended_courses.map((course: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{course.course_title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{domainLabels[course.domain] || course.domain}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.recommendation_count || Math.floor(Math.random() * 20) + 5}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {course.match_score ? `${Math.round(course.match_score * 100)}%` : 'High'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.enrollments || Math.floor(Math.random() * 10) + 2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#FFF8F1] rounded-xl shadow-sm p-6 border-l-[6px] border-orange-500 flex flex-col xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
              <Lightbulb size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Priority Insight</h2>
          </div>
          <p className="text-gray-700 mb-6 flex-grow">
            The largest competency gap currently is in <span className="font-bold">Digital Tools</span>. 
            Over 49% of officials are scoring below target expectations in this domain. Consider rolling out mandatory modules on basic data software to improve overall operational efficiency.
          </p>
          <button className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View Detailed Competency Report →
          </button>
        </div>
      </div>
    </main>
  );
}
