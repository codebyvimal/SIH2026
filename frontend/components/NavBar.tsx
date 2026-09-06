import Link from "next/link";
import React from "react";

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

export default function NavBar() {
  return (
    <nav className="w-full bg-[#102868] text-white border-b-2 border-orange-500 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <Link href="/" className="flex items-center space-x-3 md:space-x-4 cursor-pointer">
            <div className="h-10 w-10 shrink-0 bg-white rounded-full p-1">
              <IndiaEmblemSVG />
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">Government of India</span>
              <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">MoSPI</span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden md:block mx-1 md:mx-2"></div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm md:text-lg leading-tight whitespace-nowrap">National Learning Portal</span>
              <span className="text-[10px] text-gray-300 leading-tight hidden md:block">Ministry of Statistics & Programme Implementation</span>
            </div>
          </Link>

          {/* Right side */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-orange-400 transition">Home</Link>
            <Link href="/courses" className="hover:text-orange-400 transition">Courses</Link>
            <Link href="/resources" className="hover:text-orange-400 transition">Resources</Link>
            <Link href="/about" className="hover:text-orange-400 transition">About</Link>
            
            <div className="h-4 w-px bg-white/30"></div>
            
            <button className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Search">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            
            <div className="flex items-center space-x-2 text-xs">
              <button className="hover:text-orange-400 transition">A+</button>
              <button className="hover:text-orange-400 transition">A</button>
              <button className="hover:text-orange-400 transition">A-</button>
            </div>
            
            <button className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Accessibility">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </button>
            
            <Link href="/dashboard/employee" className="border border-white/50 hover:border-white px-4 py-1.5 rounded text-sm transition flex items-center space-x-1 cursor-pointer">
              <span>Login</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
             <button className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
