with open('frontend/app/dashboard/employee/page.tsx', 'r') as f:
    content = f.read()

import re
import_block = """import { User, ArrowRight, CheckCircle, Target, AlertCircle, PlayCircle, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import GapChart from '@/components/dashboard/GapChart';
import CourseCards from '@/components/dashboard/CourseCards';
"""
content = re.sub(r"import \{ User.*?recharts';\n", import_block, content, flags=re.DOTALL)

middle_row_start = content.find('{/* Middle Row */}')
if middle_row_start != -1:
    new_content = """{/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Panel: Competency Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg"><Target className="text-[#102868]" size={24} /></div>
            <h2 className="text-xl font-bold text-[#102868]">Competency Profile & Skill Gap</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            {/* Visual Radar Chart */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <GapChart gaps={deduplicatedGaps as any} />
            </div>

            {/* Progress Bars */}
            <div className="w-full lg:w-1/2 space-y-5 flex flex-col justify-center">
              {deduplicatedGaps.slice(0, 4).map((gap: any) => {
                const label = domainLabels[gap.domain] || gap.domain;
                const current = gap.current || 0;
                const target = gap.required || 0;
                const progressPct = (current / 4.0) * 100;
                const targetPct = (target / 4.0) * 100;
                
                let status = "On Target";
                let statusColor = "bg-green-100 text-green-800";
                let barColor = "bg-green-500";
                
                if (current < target) {
                  if (target - current > 1.0) {
                    status = "Needs Focus";
                    statusColor = "bg-red-50 text-red-600 border border-red-100";
                    barColor = "bg-red-500";
                  } else {
                    status = "Developing";
                    statusColor = "bg-orange-50 text-orange-600 border border-orange-100";
                    barColor = "bg-orange-500";
                  }
                }

                return (
                  <div key={gap.domain} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-500 font-semibold tracking-wide">TARGET: {target.toFixed(1)}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#102868] mb-4 px-1">Quick Actions</h2>
          
          <Link href="/dashboard/employee/competencies" className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-gray-100 transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 group-hover:bg-[#102868] transition-colors p-3 rounded-xl text-[#102868] group-hover:text-white">
                <Target size={20} />
              </div>
              <span className="font-bold text-gray-800">My Competencies</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#102868]" />
          </Link>
          
          <Link href="/recommendations" className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-gray-100 transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 group-hover:bg-[#E65100] transition-colors p-3 rounded-xl text-[#E65100] group-hover:text-white">
                <PlayCircle size={20} />
              </div>
              <span className="font-bold text-gray-800">Recommended Learning</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#E65100]" />
          </Link>

          <Link href="/dashboard/employee/progress" className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-gray-100 transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 group-hover:bg-green-600 transition-colors p-3 rounded-xl text-green-600 group-hover:text-white">
                <BarChart2 size={20} />
              </div>
              <span className="font-bold text-gray-800">My Progress</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600" />
          </Link>

          <Link href="/assessment" className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-gray-100 transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 group-hover:bg-purple-600 transition-colors p-3 rounded-xl text-purple-600 group-hover:text-white">
                <CheckCircle size={20} />
              </div>
              <span className="font-bold text-gray-800">Take Assessment</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Highest Priority Alert */}
          {deduplicatedGaps.length > 0 && deduplicatedGaps[0].required - deduplicatedGaps[0].current > 1.0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" size={24} />
                <h3 className="text-red-800 font-bold text-lg">Highest Priority Gap: {domainLabels[deduplicatedGaps[0].domain] || deduplicatedGaps[0].domain}</h3>
              </div>
              <div className="bg-white border border-red-200 px-4 py-1.5 rounded-lg text-red-600 font-bold text-sm shadow-sm">
                Gap Score: {(deduplicatedGaps[0].required - deduplicatedGaps[0].current).toFixed(1)} / 4.0
              </div>
            </div>
          )}

          {/* Personalized Learning Recommendations */}
          <div>
            <h2 className="text-xl font-bold text-[#102868] mb-4">Personalized Recommendations</h2>
            <CourseCards courses={dashboardData.recommended} officialId={dashboardData.official_id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-500" /> Why these courses?
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-700 font-medium">Targeted directly to your role as <span className="font-bold">{currentProfile.role}</span></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-700 font-medium">Addresses your largest competency gap from your recent assessment</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-700 font-medium">Highly rated by other {currentProfile.dept} officials</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={100} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Assessment</h3>
            <div className="flex items-center gap-5 mb-5 relative z-10">
              <div className="w-20 h-20 rounded-full border-[5px] border-green-500 flex items-center justify-center text-xl font-extrabold text-green-700 bg-green-50">
                80%
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Score: 12 / 15</p>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                  Strong
                </span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-4 relative z-10">Data Privacy Fundamentals</p>
            <button className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#102868] hover:bg-gray-100 transition-colors relative z-10">
              View Assessment Details
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
"""
    content = content[:middle_row_start] + new_content
    with open('frontend/app/dashboard/employee/page.tsx', 'w') as f:
        f.write(content)
