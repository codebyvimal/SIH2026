/**
 * Centralized API utility for fetching dashboard data.
 *
 * All functions attempt a live fetch against the FastAPI backend first.
 * On any network or HTTP error the catch block transparently falls back to
 * the bundled mock-data files so the UI always has something to render —
 * even when the backend is offline (demo / development).
 *
 * @module lib/api
 */

import fs from 'fs';
import path from 'path';
import type { EmployeeDashboard, AdminDashboard } from '@/types/schemas';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api/v1';

// ─── helpers ──────────────────────────────────────────────────────────────────

function readMock<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'mock_data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// ─── employee ─────────────────────────────────────────────────────────────────

/**
 * Fetches the employee dashboard payload from `/api/v1/profiles`.
 *
 * Falls back to `mock_data/employee_dashboard.json` if:
 *  - the network is unreachable
 *  - the backend returns a non-2xx status code
 *  - JSON parsing of the response fails
 */
export async function fetchEmployeeDashboard(): Promise<EmployeeDashboard> {
  try {
    const res = await fetch(`${API_BASE}/profiles`, {
      // Next.js 14 Server Component: opt-out of the data cache so we always
      // get the latest data; change to { next: { revalidate: 60 } } if you
      // want ISR-style caching.
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(
        `Backend returned ${res.status} ${res.statusText} for GET /profiles`,
      );
    }

    return (await res.json()) as EmployeeDashboard;
  } catch (err) {
    // Log so it's visible in the server terminal during development.
    console.warn(
      '[api] fetchEmployeeDashboard – falling back to mock data.',
      err instanceof Error ? err.message : err,
    );
    return readMock<EmployeeDashboard>('employee_dashboard.json');
  }
}

// ─── admin ────────────────────────────────────────────────────────────────────

/**
 * Fetches the admin dashboard payload from `/api/v1/admin/dashboard`.
 *
 * Falls back to `mock_data/admin_dashboard.json` on any error.
 */
export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(
        `Backend returned ${res.status} ${res.statusText} for GET /admin/dashboard`,
      );
    }

    return (await res.json()) as AdminDashboard;
  } catch (err) {
    console.warn(
      '[api] fetchAdminDashboard – falling back to mock data.',
      err instanceof Error ? err.message : err,
    );
    return readMock<AdminDashboard>('admin_dashboard.json');
  }
}
