import Link from 'next/link';
import { User, ArrowRight, CheckCircle, Target, AlertCircle, PlayCircle, BarChart2 } from 'lucide-react';
import type { EmployeeDashboard } from '@/types/schemas';

interface OfficialItem {
  official_id: string;
  role: string;
  dept: string;
  experience_years: number;
  education: string;
}

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams: { official_id?: string }
}) {
  const API_BASE_SERVER = process.env.INTERNAL_API_BASE || 'http://127.0.0.1:8000/api/v1';
  
  let officialsList: OfficialItem[] = [];
  let dashboardData: EmployeeDashboard | null = null;
  let errorMsg: string | null = null;

  try {
    const resOff = await fetch(`${API_BASE_SERVER}/officials`, { cache: 'no-store' });
    if (!resOff.ok) throw new Error('Failed to fetch officials list');
    officialsList = await resOff.json();

    if (officialsList.length === 0) {
      errorMsg = 'No officials found. Please register an official first.';
    } else {
      const officialToLoad = searchParams?.official_id || officialsList[0].official_id;
      const resDash = await fetch(`${API_BASE_SERVER}/dashboard/employee/${officialToLoad}`, { cache: 'no-store' });
      
      if (!resDash.ok) throw new Error('Failed to load dashboard data');
      dashboardData = await resDash.json();
    }
  } catch (err: any) {
    errorMsg = err.message || 'An error occurred while fetching dashboard data.';
  }

  if (errorMsg || !dashboardData) {
    return (
      <div className="min-h-screen bg-transparent font-sans flex items-center justify-center">
        <div className="p-8 text-center text-red-500">
          <p className="font-semibold text-lg">{errorMsg || 'Failed to load dashboard'}</p>
          <Link href="/onboarding" className="mt-6 inline-block px-6 py-2 bg-[#102868] text-white rounded-lg">
            Register a new official
          </Link>
        </div>
      </div>
    );
  }

  const currentProfile = officialsList.find(o => o.official_id === dashboardData!.official_id) || officialsList[0];

  const domainLabels: Record<string, string> = {
    digital_tools: 'Digital Tools',
    statistical_methods: 'Statistical Methods',
    data_management: 'Data Management',
    domain_knowledge: 'Domain Knowledge',
  };

  return (
    <main className="mx-auto max-w-7xl p-6 bg-transparent min-h-screen text-gray-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#102868]">Officer Learning Dashboard</h1>
        <p className="text-sm text-gray-500 mt-2">Track your competencies and personalized learning journey</p>
      </div>

      {/* Top Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 flex flex-col md:flex-row">
        <div className="p-6 flex items-center gap-6 md:w-2/3 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="w-20 h-20 bg-[#102868] text-white rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Officer {currentProfile.official_id.split('-')[0].toUpperCase()}</h2>
            <p className="text-sm font-semibold text-[#102868]">{currentProfile.role}</p>
            <p className="text-sm text-gray-500 mb-2">{currentProfile.dept}</p>
            <div className="flex gap-4 text-sm mt-2">
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-gray-500">Education:</span> <span className="font-semibold">{currentProfile.education}</span>
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-gray-500">Experience:</span> <span className="font-semibold">{currentProfile.experience_years} Year{currentProfile.experience_years !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-6 md:w-1/3 flex flex-col justify-center relative">
          <h3 className="text-[#102868] font-bold mb-2 z-10">Your Learning Journey</h3>
          <p className="text-sm text-blue-800 z-10">Build the right skills to advance your career and contribute to national development.</p>
          <div className="absolute right-4 bottom-4 text-blue-200 opacity-50">
            <ArrowRight size={80} />
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Panel: Competency Profile */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-[#102868] mb-6">Competency Profile</h2>
          <div className="space-y-6 mb-6">
            {dashboardData.gaps.map((gap: any) => {
              const label = domainLabels[gap.domain] || gap.domain;
              const current = gap.current || 0;
              const target = gap.required || 0;
              const progressPct = (current / 4.0) * 100;
              const targetPct = (target / 4.0) * 100;
              
              let status = "On Target";
              let statusColor = "bg-green-100 text-green-800";
              if (current < target) {
                if (target - current > 1.0) {
                  status = "Needs Focus";
                  statusColor = "bg-red-100 text-red-800";
                } else {
                  status = "Developing";
                  statusColor = "bg-orange-100 text-orange-800";
                }
              }

              return (
                <div key={gap.domain}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 mr-2">Target: {target.toFixed(1)}</span>
                        <span className="text-sm font-bold text-gray-900">{current.toFixed(1)} / 4.0</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor} w-24 text-center`}>
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full ${status === 'Needs Focus' ? 'bg-red-500' : status === 'Developing' ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-black z-10"
                      style={{ left: `${targetPct}%` }}
                      title={`Target: ${target}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="font-semibold text-red-900">Highest Priority Gap: Digital Tools</span>
            </div>
            <span className="bg-white px-3 py-1 rounded text-red-700 font-bold border border-red-200">Gap Score: 1.1 / 4.0</span>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#102868] mb-3">Quick Links</h2>
          
          <Link href="#" className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-transparent transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#102868]">
                <Target size={20} />
              </div>
              <span className="font-semibold text-gray-800">My Competencies</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#102868]" />
          </Link>
          
          <Link href="#" className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-transparent transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#102868]">
                <PlayCircle size={20} />
              </div>
              <span className="font-semibold text-gray-800">Recommended Learning</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#102868]" />
          </Link>

          <Link href="#" className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-transparent transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#102868]">
                <BarChart2 size={20} />
              </div>
              <span className="font-semibold text-gray-800">My Progress</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#102868]" />
          </Link>

          <Link href="#" className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-[#102868] border border-transparent transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#102868]">
                <CheckCircle size={20} />
              </div>
              <span className="font-semibold text-gray-800">Assessments</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#102868]" />
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[#102868] mb-2">Personalized Learning Recommendations</h2>
          {dashboardData.recommended.slice(0, 3).map((rec: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{domainLabels[rec.domain] || rec.domain}</span>
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Highly Relevant</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{rec.course_title}</h3>
                <p className="text-sm text-gray-600 mb-2">Addresses your gap in {domainLabels[rec.domain] || rec.domain} to reach the target level of {rec.target_level || '3.5'}.</p>
                <div className="flex gap-4 text-xs text-gray-500 font-medium">
                  <span>⏱️ 2h 30m</span>
                  <span>📊 Intermediate</span>
                </div>
              </div>
              <button className="bg-[#102868] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors whitespace-nowrap">
                View Course
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#F8FAFC] rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Why these recommendations?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span className="text-sm text-gray-700">Targeted to your role as {currentProfile.role}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span className="text-sm text-gray-700">Addresses your largest competency gap</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span className="text-sm text-gray-700">Highly rated by other {currentProfile.dept} officials</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Assessment</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-lg font-bold text-green-700">
                80%
              </div>
              <div>
                <p className="text-sm text-gray-500">Score: 12 / 15</p>
                <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Strong Proficiency</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-4">Data Privacy Fundamentals</p>
            <button className="w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
              View Assessment
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
