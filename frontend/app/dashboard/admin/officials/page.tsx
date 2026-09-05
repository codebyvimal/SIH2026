import Link from 'next/link';
import { fetchOfficials } from '@/lib/api';
import OfficialsClient from './OfficialsClient';
import NavBar from "@/components/NavBar";
import { API_BASE } from "@/lib/config";

export default async function AdminOfficialsPage() {
  const officials = await fetchOfficials();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <NavBar 
        variant="admin" 
        navItems={[
    { label: "Admin Dashboard", href: "/dashboard/admin", active: false },
    { label: "Officials", href: "/dashboard/admin/officials", active: true }
  ]} 
        switchHref="/dashboard/employee"
        switchLabel="← Switch to Employee"
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Officials Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and view skill gaps for all registered officials</p>
        </div>

        <OfficialsClient officials={officials} />
      </main>
    </div>
  );
}
