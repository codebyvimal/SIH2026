'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LoadingSpinner = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={`animate-spin text-current ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string, target: string) => {
    e.preventDefault();
    setLoadingTarget(target);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      
      

      <NavBar />
      
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-6 mb-12">
          
          {/* Left Side */}
          <div className="flex-1 space-y-6">
            <p className="text-orange-500 font-bold tracking-widest text-sm uppercase">
              — LEARN | BUILD | GROW
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#102868] leading-tight">
              Strengthening Statistical Capacity Through Continuous Learning
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Competency-driven learning and professional development for India&apos;s Official Statistical System.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#102868] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
                Better Data / Better Decisions
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#102868] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                Skilled Workforce / Stronger India
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#102868] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Evidence-Based / Development
              </div>
            </div>
          </div>

          {/* Right Side Image/Placeholder */}
          <div className="flex-1 relative w-full h-[350px] md:h-[450px]">
            <div className="w-full h-full bg-gray-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
              <Image src="/hero-building.png" alt="Parliament Building" fill className="object-cover" priority />
              
              {/* Overlay Box */}
              <div className="absolute bottom-6 right-6 left-6 md:left-auto md:w-72 md:bottom-8 md:right-8 bg-white/95 backdrop-blur rounded-xl p-5 shadow-lg border border-white">
                <p className="text-[#102868] font-bold leading-snug">Building a statistical future for a stronger India</p>
                <div className="w-12 h-1 bg-orange-500 mt-3 rounded-full"></div>
              </div>
            </div>
            
            {/* Decorative dots behind the image */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 opacity-20">
              <svg width="100%" height="100%" fill="none"><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle fill="#102868" cx="2" cy="2" r="2"></circle></pattern><rect width="100%" height="100%" fill="url(#dots)"></rect></svg>
            </div>
          </div>
        </div>

        {/* Lower Section */}
        <div className="mt-12">
          <p className="text-orange-500 font-bold tracking-widest text-sm uppercase mb-6">
            — Access Your Learning Portal
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Officer Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 md:p-8 border-l-[6px] border-orange-500 flex flex-col">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-[#102868] mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Officer Learning Dashboard</h3>
              <p className="text-gray-600 mb-8 flex-1">
                Access personalized learning recommendations, competency insights, assessments, and learning progress.
              </p>
              
              <Link 
                href="/dashboard/employee" 
                onClick={(e) => handleNavigation(e, '/dashboard/employee', 'officer')}
                className="inline-flex w-fit items-center gap-2 bg-[#102868] hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loadingTarget === 'officer' ? (
                  <LoadingSpinner />
                ) : (
                  <>Continue as Officer <span className="text-lg">→</span></>
                )}
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 md:p-8 border-l-[6px] border-orange-500 flex flex-col">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-[#102868] mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Administrator Dashboard</h3>
              <p className="text-gray-600 mb-8 flex-1">
                Monitor organizational competency gaps, training priorities, course effectiveness, and workforce learning progress.
              </p>
              
              <Link 
                href="/dashboard/admin" 
                onClick={(e) => handleNavigation(e, '/dashboard/admin', 'admin')}
                className="inline-flex w-fit items-center gap-2 bg-[#102868] hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loadingTarget === 'admin' ? (
                  <LoadingSpinner />
                ) : (
                  <>Continue as Administrator <span className="text-lg">→</span></>
                )}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            © {new Date().getFullYear()} National Learning Portal | Ministry of Statistics & Programme Implementation
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Powered By</span>
            <div className="flex items-center gap-1 text-black font-bold text-lg">
              <span className="text-red-600 font-black">Digital</span> India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
