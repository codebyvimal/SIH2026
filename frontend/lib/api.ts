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

import { API_BASE } from "./config";
import fs from 'fs';
import path from 'path';
import type { EmployeeDashboard, AdminDashboard } from '@/types/schemas';



// ─── helpers ──────────────────────────────────────────────────────────────────

function readMock<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'mock_data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// ─── employee ─────────────────────────────────────────────────────────────────

/**
 * Fetches the employee dashboard payload from `/api/v1/dashboard/employee/{official_id}`.
 *
 * Falls back to `mock_data/employee_dashboard.json` if:
 *  - the network is unreachable
 *  - the backend returns a non-2xx status code
 *  - JSON parsing of the response fails
 */
export async function fetchEmployeeDashboard(officialId?: string): Promise<{ payload: EmployeeDashboard, isLive: boolean }> {
  try {
    const url = officialId ? `${API_BASE}/dashboard/employee/${officialId}` : `${API_BASE}/dashboard/employee`;
    const res = await fetch(url, {
      // Next.js 14 Server Component: opt-out of the data cache so we always
      // get the latest data; change to { next: { revalidate: 60 } } if you
      // want ISR-style caching.
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(
        `Backend returned ${res.status} ${res.statusText} for GET ${url}`,
      );
    }

    return { payload: (await res.json()) as EmployeeDashboard, isLive: true };
  } catch (err) {
    // Log so it's visible in the server terminal during development.
    console.warn(
      '[api] fetchEmployeeDashboard – falling back to mock data.',
      err instanceof Error ? err.message : err,
    );
    return { payload: readMock<EmployeeDashboard>('employee_dashboard.json'), isLive: false };
  }
}

export interface OfficialSummary {
  official_id: string;
  role: string;
  dept: string;
  experience_years: number;
  education: string;
}

export async function fetchOfficials(): Promise<OfficialSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/officials`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as OfficialSummary[];
  } catch {
    return [];
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

// ─── assessment & grading ──────────────────────────────────────────────────────

import type { AssessmentOutput, GradingOutput, GradingInput } from '@/types/schemas';

/**
 * Fetches a quiz by ID.
 * Falls back to mock_data/quizzes.json.
 */
export async function fetchQuiz(quizId: string): Promise<AssessmentOutput> {
  try {
    // There is no explicit GET /assessment/{id} in the backend schema yet,
    // so we attempt a generic fetch, and fallback to mock data on 404.
    const res = await fetch(`${API_BASE}/assessment/quiz/${quizId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('No live quiz endpoint');
    return (await res.json()) as AssessmentOutput;
  } catch (err) {
    console.warn('[api] fetchQuiz – falling back to mock data.');
    const quizzes = readMock<AssessmentOutput[]>('quizzes.json');
    const quiz = quizzes.find((q) => q.quiz_id === quizId);
    if (!quiz) throw new Error(`Quiz ${quizId} not found in mock data.`);
    return quiz;
  }
}
