'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const role = pathname.includes('/admin') ? 'admin' : 'employee';
  return <DashboardLayout role={role}>{children}</DashboardLayout>;
}
