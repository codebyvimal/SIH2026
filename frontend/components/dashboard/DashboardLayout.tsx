'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const IndiaEmblemSVG = ({ className = "h-full w-full" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="India Emblem">
    <circle cx="40" cy="40" r="36" stroke="#E65100" strokeWidth="3.5" />
    <circle cx="40" cy="40" r="28" stroke="#E65100" strokeWidth="1.2" />
    <circle cx="40" cy="40" r="20" stroke="#E65100" strokeWidth="1" />
    <circle cx="40" cy="40" r="6" fill="#E65100" />
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * Math.PI) / 12;
      return (
        <line key={i} x1={40 + 6 * Math.cos(angle)} y1={40 + 6 * Math.sin(angle)} x2={40 + 28 * Math.cos(angle)} y2={40 + 28 * Math.sin(angle)} stroke="#E65100" strokeWidth="1.2" />
      );
    })}
  </svg>
);

export default function DashboardLayout({ children, role = 'employee' }: { children: React.ReactNode, role?: 'admin' | 'employee' }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminLinks = [
    { name: 'Overview', href: '/dashboard/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Officials', href: '/dashboard/admin/officials', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Competency Gaps', href: '/dashboard/admin/gaps', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Courses', href: '/dashboard/admin/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Assessments', href: '/dashboard/admin/assessments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  const employeeLinks = [
    { name: 'Dashboard', href: '/dashboard/employee', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'My Competencies', href: '/dashboard/employee/competencies', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Recommended Learning', href: '/dashboard/employee/learning', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Assessments', href: '/dashboard/employee/assessments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'My Progress', href: '/dashboard/employee/progress', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Profile', href: '/dashboard/employee/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const links = role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-sans">
      
      {/* Top Fixed Header - MATCHING LANDING PAGE NAV */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#102868] text-white border-b-2 border-orange-500 flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="h-10 w-10 shrink-0 bg-white rounded-full p-1">
            <IndiaEmblemSVG />
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">Government of India</span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">MoSPI</span>
          </div>
          <div className="h-8 w-px bg-white/30 hidden md:block mx-1 md:mx-2"></div>
          <div className="flex flex-col justify-center">
            <span className="font-bold text-sm md:text-lg leading-tight">National Learning Portal</span>
            <span className="text-[10px] text-gray-300 leading-tight">Ministry of Statistics & Programme Implementation</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-semibold text-white border border-white/50 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            Exit Dashboard
          </Link>
          <div className="flex items-center gap-2 cursor-pointer group px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 rounded-full bg-white text-[#102868] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span className="text-sm font-medium text-white">
              {role === 'admin' ? 'Administrator' : 'Officer View'}
            </span>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Left Fixed Sidebar */}
        <aside 
          className={`fixed left-0 top-16 bottom-0 bg-white/95 backdrop-blur-md border-r border-gray-200 z-40 transition-all duration-300 flex flex-col shadow-sm ${sidebarOpen ? 'w-64' : 'w-20'}`}
        >
          {/* Toggle Button */}
          <div className="flex justify-end p-2 border-b border-gray-100">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-[#264092] hover:bg-gray-50 rounded-md transition-colors"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a1 1 0 102 0 1 1 0 00-2 0zm7 0a1 1 0 102 0 1 1 0 00-2 0zm7 0a1 1 0 102 0 1 1 0 00-2 0z"></path>
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col gap-1 px-3 mt-4">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard/admin' && link.href !== '/dashboard/employee' && pathname.startsWith(link.href));
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#102868] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-blue-50 hover:text-[#102868]'
                  } ${!sidebarOpen && 'justify-center px-0'}`}
                  title={!sidebarOpen ? link.name : undefined}
                >
                  <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                  </svg>
                  {sidebarOpen && <span className="truncate">{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main 
          className={`flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
