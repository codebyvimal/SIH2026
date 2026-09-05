import Link from 'next/link';
import React from 'react';
import NavBar from '@/components/NavBar';

const IndiaEmblem = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-saffron">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4"/>
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1"/>
    <circle cx="50" cy="50" r="8" fill="currentColor"/>
    {/* 24 spokes */}
    {[...Array(24)].map((_, i) => (
      <line 
        key={i} 
        x1="50" 
        y1="50" 
        x2={50 + 38 * Math.cos(i * (Math.PI / 12))} 
        y2={50 + 38 * Math.sin(i * (Math.PI / 12))} 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
    ))}
  </svg>
);

const OfficerIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-saffron">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8l2 2-6 6-2-2 6-6z" />
  </svg>
);

const AdminIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-saffron">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-deep-navy text-white flex flex-col font-sans">
      {/* Header */}
      <NavBar variant="minimal" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-[#1E293B] to-[#1E293B]">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome to your <span className="text-saffron">Learning Journey</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-light">
              Empowering civil servants through continuous learning, capacity building, and competency-driven development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            {/* Officer Card */}
            <Link href="/dashboard/employee" className="group flex flex-col items-center justify-center p-10 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-saffron/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-saffron/10 hover:-translate-y-1">
              <div className="bg-slate-900/50 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <OfficerIcon />
              </div>
              <h3 className="text-2xl font-bold mb-2">I&apos;m an Officer</h3>
              <p className="text-slate-400 text-sm">Access your learning paths, track progress, and take assessments.</p>
            </Link>

            {/* Administrator Card */}
            <Link href="/dashboard/admin" className="group flex flex-col items-center justify-center p-10 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-saffron/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-saffron/10 hover:-translate-y-1">
              <div className="bg-slate-900/50 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <AdminIcon />
              </div>
              <h3 className="text-2xl font-bold mb-2">I&apos;m an Administrator</h3>
              <p className="text-slate-400 text-sm">Manage courses, review gaps, and monitor organizational progress.</p>
            </Link>
          </div>

          <div className="mt-12">
            <Link href="/onboarding" className="text-sm text-slate-400 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-saffron transition-colors">
              New Officer? Register here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-white/5 bg-deep-navy">
        <p>© {new Date().getFullYear()} National Learning Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
