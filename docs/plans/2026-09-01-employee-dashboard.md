# Employee Dashboard (System 7) Implementation Plan

> **For Claude:** Use the `executing-plans` skill to implement this plan task-by-task.

**Goal:** Build a production-grade, read-only Employee Dashboard in Next.js that renders an official's skill gaps, recommended courses, and latest quiz feedback — working entirely from `frontend/mock_data/employee_dashboard.json` without any backend running.

**Architecture:** A Next.js App Router page at `frontend/app/dashboard/employee/page.tsx` reads the mock JSON at build/request time and renders three distinct panels: a Recharts radar/bar chart for skill gaps, course recommendation cards, and a quiz score summary with per-question feedback. All TypeScript types are imported from the already-existing `frontend/types/schemas.ts` — no new types invented.

**Tech Stack:** Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Recharts, Google Fonts (via `next/font`), CSS animations.

---

## Prerequisites / Assumptions

- No Next.js project exists yet under `frontend/` — this plan scaffolds one from scratch.
- Node.js 18+ is installed.
- The repo root is `c:/Users/subha/SIH2026`.
- Mock data file `frontend/mock_data/employee_dashboard.json` already exists and is correct.
- TypeScript types already exist in `frontend/types/schemas.ts`.

---

## Task 1: Scaffold the Next.js Project

**Files:**
- Create: `frontend/` (Next.js project root)

**Step 1: Initialise the project**

Run from `c:/Users/subha/SIH2026`:
```bash
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```
When prompted, accept all defaults (overwrite existing files when asked about `types/` and `mock_data/` — those exist already and won't be touched).

**Step 2: Install additional dependencies**
```bash
cd frontend
npm install recharts
npm install -D prettier eslint-config-prettier
```

**Step 3: Verify the scaffold boots**
```bash
npm run dev
```
Expected: `Ready on http://localhost:3000` — open in browser, see default Next.js page. Kill the server after confirming.

**Step 4: Commit**
```bash
git add frontend/
git commit -m "chore(dashboard): scaffold Next.js 14 app for frontend"
```

---

## Task 2: Verify TypeScript Types Compile

**Files:**
- Keep: `frontend/types/schemas.ts` (already correct — do NOT modify)

**Step 1: Confirm types compile**
```bash
cd frontend
npx tsc --noEmit
```
Expected: zero errors.

> `EmployeeDashboard`, `SkillGap`, `RecommendedCourse`, `GradingOutput`, `QuestionFeedback`, `Domain`, `SkillLevel` are all defined in `frontend/types/schemas.ts`. Import from `@/types/schemas` everywhere. **Never re-declare these types.**

---

## Task 3: Enrich the Mock Data

**Files:**
- Modify: `frontend/mock_data/employee_dashboard.json`

The current mock has only 1 gap and 1 course. Replace its contents with a richer fixture so the dashboard looks convincing on stage:

```json
{
  "official_id": "123e4567-e89b-12d3-a456-426614174000",
  "gaps": [
    { "skill": "Python for Data Analysis",   "domain": "digital_tools",        "required": 3, "current": 1, "gap": 2 },
    { "skill": "Statistical Inference",       "domain": "statistical_methods",  "required": 4, "current": 2, "gap": 2 },
    { "skill": "SQL & Database Querying",     "domain": "data_management",      "required": 3, "current": 2, "gap": 1 },
    { "skill": "Census Methodology",          "domain": "domain_knowledge",     "required": 4, "current": 3, "gap": 1 },
    { "skill": "R Programming",               "domain": "digital_tools",        "required": 2, "current": 0, "gap": 2 },
    { "skill": "Data Wrangling with Pandas",  "domain": "data_management",      "required": 3, "current": 1, "gap": 2 }
  ],
  "recommended": [
    { "course": "Advanced Python Analytics",          "course_id": "course-igot-101", "relevance": 0.95, "why": "Directly addresses your gap in Python for data analysis workflows." },
    { "course": "Fundamentals of Hypothesis Testing", "course_id": "course-igot-204", "relevance": 0.88, "why": "Covers statistical inference at the depth your role requires." },
    { "course": "SQL for Government Data Systems",    "course_id": "course-nssta-55", "relevance": 0.81, "why": "Tailored to MoSPI database environments and data querying patterns." },
    { "course": "R for Statistical Computing",        "course_id": "course-igot-312", "relevance": 0.76, "why": "Fills your R programming gap with practical exercises." }
  ],
  "latest_grading": {
    "quiz_id": "quiz-stats-01",
    "score": 72.0,
    "feedback": [
      { "q": "What is a p-value?",                          "your_answer": 1, "correct": 1, "is_correct": true,  "explanation": "A p-value measures the probability of observing results at least as extreme as those measured, assuming the null hypothesis is true." },
      { "q": "Which measure is robust to outliers?",        "your_answer": 0, "correct": 2, "is_correct": false, "explanation": "The median is robust to outliers; the mean is heavily influenced by extreme values." },
      { "q": "What does a confidence interval represent?",  "your_answer": 2, "correct": 2, "is_correct": true,  "explanation": "A 95% CI means that if we repeated the experiment many times, 95% of such intervals would contain the true parameter." },
      { "q": "When is a chi-square test appropriate?",      "your_answer": 1, "correct": 1, "is_correct": true,  "explanation": "Chi-square tests compare observed vs expected frequencies in categorical data." },
      { "q": "What is the Central Limit Theorem?",          "your_answer": 3, "correct": 0, "is_correct": false, "explanation": "CLT states that sampling distributions of means approach normality as sample size grows, regardless of the population distribution." }
    ]
  }
}
```

**Step 1: Replace file contents** with the JSON above.

**Step 2: Validate JSON**
```bash
node -e "JSON.parse(require('fs').readFileSync('./frontend/mock_data/employee_dashboard.json','utf8')); console.log('valid')"
```
Expected: `valid`

**Step 3: Commit**
```bash
git add frontend/mock_data/employee_dashboard.json
git commit -m "chore(dashboard): enrich employee mock data for demo"
```

---

## Task 4: Create the Server-Side Mock Data Loader

**Files:**
- Create: `frontend/lib/mockData.ts`

```typescript
// frontend/lib/mockData.ts
import fs from 'fs';
import path from 'path';
import type { EmployeeDashboard } from '@/types/schemas';

export function getEmployeeDashboardMock(): EmployeeDashboard {
  const filePath = path.join(process.cwd(), 'mock_data', 'employee_dashboard.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as EmployeeDashboard;
}
```

> This runs **server-side only** (Next.js Server Component). Never import this in a `'use client'` component.

**Step 1: Create the file** with the content above.

**Step 2: Type-check**
```bash
npx tsc --noEmit
```
Expected: zero errors.

**Step 3: Commit**
```bash
git add frontend/lib/mockData.ts
git commit -m "feat(dashboard): add server-side mock data loader"
```

---

## Task 5: Build the Skill Gap Chart Component

**Files:**
- Create: `frontend/components/dashboard/GapChart.tsx`

Use a **horizontal bar chart** (Recharts `BarChart` with `layout="vertical"`). Two bars per skill: current level (domain-coloured) and required level (muted white). Domain colours follow the same mapping used in the page domain legend.

```tsx
// frontend/components/dashboard/GapChart.tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import type { SkillGap } from '@/types/schemas';

const DOMAIN_COLORS: Record<string, string> = {
  digital_tools:       '#6ee7b7',
  statistical_methods: '#93c5fd',
  data_management:     '#fcd34d',
  domain_knowledge:    '#f9a8d4',
};

const LEVEL_LABELS = ['None', 'Basic', 'Working', 'Proficient', 'Expert'];

interface GapChartProps {
  gaps: SkillGap[];
}

export default function GapChart({ gaps }: GapChartProps) {
  const data = gaps.map((g) => ({
    skill: g.skill.length > 24 ? g.skill.slice(0, 24) + '\u2026' : g.skill,
    current: g.current,
    required: g.required,
    gap: g.gap,
    domain: g.domain,
    fullSkill: g.skill,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, gaps.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.08)" />
        <XAxis
          type="number"
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tickFormatter={(v: number) => LEVEL_LABELS[v] ?? String(v)}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="skill"
          width={168}
          tick={{ fill: '#e2e8f0', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as typeof data[0];
            return (
              <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl text-sm">
                <p className="mb-1 font-semibold text-white">{d.fullSkill}</p>
                <p className="text-slate-400">Current: <span className="text-emerald-400">{LEVEL_LABELS[d.current]}</span></p>
                <p className="text-slate-400">Required: <span className="text-sky-400">{LEVEL_LABELS[d.required]}</span></p>
                <p className="text-slate-400">Gap: <span className="text-rose-400">-{d.gap}</span></p>
              </div>
            );
          }}
        />
        <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
        <Bar dataKey="current" name="Current Level" radius={[0, 4, 4, 0]} barSize={10}>
          {data.map((entry, i) => (
            <Cell key={i} fill={DOMAIN_COLORS[entry.domain] ?? '#6ee7b7'} fillOpacity={0.9} />
          ))}
        </Bar>
        <Bar dataKey="required" name="Required Level" radius={[0, 4, 4, 0]} barSize={10} fill="rgba(255,255,255,0.15)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**Step 1: Create the file** at `frontend/components/dashboard/GapChart.tsx`.

**Step 2: Type-check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add frontend/components/dashboard/GapChart.tsx
git commit -m "feat(dashboard): add GapChart component (horizontal bar, domain-coloured)"
```

---

## Task 6: Build the Course Recommendation Cards Component

**Files:**
- Create: `frontend/components/dashboard/CourseCards.tsx`

```tsx
// frontend/components/dashboard/CourseCards.tsx
import type { RecommendedCourse } from '@/types/schemas';

interface CourseCardsProps {
  courses: RecommendedCourse[];
}

function RelevancePip({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-400">{pct}%</span>
    </div>
  );
}

export default function CourseCards({ courses }: CourseCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((c, i) => (
        <article
          key={c.course_id}
          className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8"
        >
          <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300">
            #{i + 1}
          </span>
          <p className="mb-2 pr-8 text-sm font-semibold leading-snug text-white">{c.course}</p>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">{c.why}</p>
          <div className="flex items-center justify-between">
            <RelevancePip value={c.relevance} />
            <span className="rounded-lg bg-white/8 px-3 py-1 text-xs text-slate-300 transition group-hover:bg-sky-500/20 group-hover:text-sky-300">
              Enrol →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
```

**Step 1: Create the file** at `frontend/components/dashboard/CourseCards.tsx`.

**Step 2: Type-check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add frontend/components/dashboard/CourseCards.tsx
git commit -m "feat(dashboard): add CourseCards component with relevance bar"
```

---

## Task 7: Build the Quiz Score & Feedback Component

**Files:**
- Create: `frontend/components/dashboard/QuizFeedback.tsx`

```tsx
// frontend/components/dashboard/QuizFeedback.tsx
import type { GradingOutput } from '@/types/schemas';

interface QuizFeedbackProps {
  grading: GradingOutput;
}

export default function QuizFeedback({ grading }: QuizFeedbackProps) {
  const correct = grading.feedback.filter((f) => f.is_correct).length;
  const total = grading.feedback.length;
  const scoreColor =
    grading.score >= 80 ? 'text-emerald-400'
    : grading.score >= 50 ? 'text-amber-400'
    : 'text-rose-400';
  const circumference = 2 * Math.PI * 32; // r=32

  return (
    <div className="space-y-6">
      {/* Score ring */}
      <div className="flex items-center gap-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(grading.score / 100) * circumference} ${circumference}`}
              className={scoreColor}
            />
          </svg>
          <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>
            {grading.score.toFixed(0)}%
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{correct} / {total} correct</p>
          <p className="mt-0.5 text-xs text-slate-500">Quiz: {grading.quiz_id}</p>
        </div>
      </div>

      {/* Per-question feedback */}
      <div className="space-y-3">
        {grading.feedback.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 text-sm ${
              item.is_correct
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-rose-500/20 bg-rose-500/5'
            }`}
          >
            <div className="mb-1 flex items-start gap-2">
              <span className={`mt-0.5 text-base leading-none ${item.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.is_correct ? '\u2713' : '\u2717'}
              </span>
              <p className="font-medium text-white">{item.q}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 1: Create the file** at `frontend/components/dashboard/QuizFeedback.tsx`.

**Step 2: Type-check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add frontend/components/dashboard/QuizFeedback.tsx
git commit -m "feat(dashboard): add QuizFeedback component with score ring"
```

---

## Task 8: Build the Main Dashboard Page

**Files:**
- Create: `frontend/app/dashboard/employee/page.tsx`

This is a **React Server Component** (no `'use client'`). It reads the mock JSON on the server and passes typed props down to each client component.

**Design direction:** Deep-space government intel — near-black slate background (`slate-950`), crisp emerald/sky/amber accents, glassmorphism cards, ambient background glows. Feels authoritative and data-focused without being corporate-generic.

```tsx
// frontend/app/dashboard/employee/page.tsx
import { getEmployeeDashboardMock } from '@/lib/mockData';
import GapChart from '@/components/dashboard/GapChart';
import CourseCards from '@/components/dashboard/CourseCards';
import QuizFeedback from '@/components/dashboard/QuizFeedback';

const DOMAIN_COLORS: Record<string, string> = {
  digital_tools:       '#6ee7b7',
  statistical_methods: '#93c5fd',
  data_management:     '#fcd34d',
  domain_knowledge:    '#f9a8d4',
};

const DOMAIN_LABEL: Record<string, string> = {
  digital_tools:       'Digital Tools',
  statistical_methods: 'Statistical Methods',
  data_management:     'Data Management',
  domain_knowledge:    'Domain Knowledge',
};

export default function EmployeeDashboardPage() {
  const data = getEmployeeDashboardMock();
  const totalGap = data.gaps.reduce((s, g) => s + g.gap, 0);
  const avgGap = (totalGap / data.gaps.length).toFixed(1);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 selection:bg-sky-500/30">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-sky-900/20 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-emerald-900/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-500">
              Ministry of Statistics &amp; Programme Implementation · iGOT Competency Platform
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Learning Dashboard</h1>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-slate-500">Official ID</p>
            <p className="font-mono text-sm text-slate-300">{data.official_id}</p>
          </div>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Skill Gaps Identified', value: data.gaps.length,       accent: 'text-rose-400' },
            { label: 'Average Gap Size',       value: avgGap,                 accent: 'text-amber-400' },
            { label: 'Courses Recommended',    value: data.recommended.length, accent: 'text-sky-400' },
            { label: 'Latest Quiz Score',
              value: data.latest_grading ? `${data.latest_grading.score.toFixed(0)}%` : '—',
              accent: 'text-emerald-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
              <p className={`text-2xl font-bold tabular-nums ${kpi.accent}`}>{kpi.value}</p>
              <p className="mt-1 text-xs text-slate-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Main 2-col grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Gap chart — spans 2 cols */}
          <section className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm lg:col-span-2">
            <h2 className="mb-1 text-base font-semibold text-white">Competency Gap Analysis</h2>
            <p className="mb-5 text-xs text-slate-500">
              Current vs required level across {data.gaps.length} skills
            </p>
            <GapChart gaps={data.gaps} />
            {/* Domain legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(DOMAIN_COLORS).map(([d, c]) => (
                <span key={d} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />
                  {DOMAIN_LABEL[d]}
                </span>
              ))}
            </div>
          </section>

          {/* Quiz feedback — 1 col */}
          <section className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
            <h2 className="mb-1 text-base font-semibold text-white">Latest Assessment</h2>
            <p className="mb-5 text-xs text-slate-500">Most recent quiz performance</p>
            {data.latest_grading
              ? <QuizFeedback grading={data.latest_grading} />
              : <p className="text-sm text-slate-500">No quiz taken yet.</p>
            }
          </section>
        </div>

        {/* Recommended Courses */}
        <section className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
          <h2 className="mb-1 text-base font-semibold text-white">Recommended Courses</h2>
          <p className="mb-5 text-xs text-slate-500">
            {data.recommended.length} courses matched to your skill gaps via semantic search
          </p>
          <CourseCards courses={data.recommended} />
        </section>

        {/* Footer */}
        <footer className="pb-4 text-center text-xs text-slate-700">
          SIH 2026 · System 7 Employee Dashboard · Mock data — no backend required
        </footer>
      </div>
    </main>
  );
}
```

**Step 1: Create the directory** `frontend/app/dashboard/employee/` if it doesn't exist.

**Step 2: Create the file** with the code above.

**Step 3: Type-check and build**
```bash
npx tsc --noEmit
npm run build
```
Expected: zero type errors, build succeeds.

**Step 4: Visual verification**
```bash
npm run dev
```
Open `http://localhost:3000/dashboard/employee`. Verify all 4 KPI cards, bar chart with 6 skills, quiz score ring at 72%, and 4 course cards render correctly.

**Step 5: Commit**
```bash
git add frontend/app/dashboard/employee/ frontend/components/ frontend/lib/
git commit -m "feat(dashboard): build employee dashboard page with gap chart, course cards, quiz feedback"
```

---

## Task 9: Tailwind & Lint Cleanup

**Files:**
- Modify: `frontend/tailwind.config.ts`

**Step 1: Extend Tailwind content paths**
Ensure `types/` and `lib/` are in the content array:
```ts
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
  './types/**/*.{ts,tsx}',
],
```

**Step 2: Run ESLint and Prettier**
```bash
npm run lint
npx prettier --write .
```
Fix any reported issues before committing.

**Step 3: Commit**
```bash
git add frontend/tailwind.config.ts
git commit -m "chore(dashboard): configure tailwind content paths and run prettier"
```

---

## Task 10: Write Component Tests

**Files:**
- Create: `frontend/__tests__/GapChart.test.tsx`
- Create: `frontend/__tests__/CourseCards.test.tsx`
- Create: `frontend/__tests__/QuizFeedback.test.tsx`
- Create: `frontend/jest.config.ts`
- Create: `frontend/jest.setup.ts`

**Step 1: Install test dependencies**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest ts-jest
```

**Step 2: Add `jest.config.ts`**
```ts
// frontend/jest.config.ts
import type { Config } from 'jest';
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};
export default config;
```

**Step 3: Add `jest.setup.ts`**
```ts
// frontend/jest.setup.ts
import '@testing-library/jest-dom';
```

**Step 4: Write GapChart test**

Recharts uses `ResizeObserver` — mock it so jsdom doesn't crash.

```tsx
// frontend/__tests__/GapChart.test.tsx
import { render } from '@testing-library/react';
import GapChart from '@/components/dashboard/GapChart';
import type { SkillGap } from '@/types/schemas';
import { Domain, SkillLevel } from '@/types/schemas';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockGaps: SkillGap[] = [
  { skill: 'Python for Data Analysis', domain: Domain.DIGITAL_TOOLS, required: SkillLevel.PROFICIENT, current: SkillLevel.BASIC, gap: 2 },
];

test('renders without crashing given gaps', () => {
  const { container } = render(<GapChart gaps={mockGaps} />);
  expect(container.firstChild).not.toBeNull();
});
```

**Step 5: Write CourseCards test**

```tsx
// frontend/__tests__/CourseCards.test.tsx
import { render, screen } from '@testing-library/react';
import CourseCards from '@/components/dashboard/CourseCards';
import type { RecommendedCourse } from '@/types/schemas';

const courses: RecommendedCourse[] = [
  { course: 'Advanced Python Analytics', course_id: 'c-101', relevance: 0.95, why: 'Great match.' },
];

test('renders course title', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('Advanced Python Analytics')).toBeInTheDocument();
});

test('renders why text', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('Great match.')).toBeInTheDocument();
});

test('renders rank badge', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('#1')).toBeInTheDocument();
});
```

**Step 6: Write QuizFeedback test**

```tsx
// frontend/__tests__/QuizFeedback.test.tsx
import { render, screen } from '@testing-library/react';
import QuizFeedback from '@/components/dashboard/QuizFeedback';
import type { GradingOutput } from '@/types/schemas';

const grading: GradingOutput = {
  quiz_id: 'q-01',
  score: 80,
  feedback: [
    { q: 'What is a p-value?', your_answer: 1, correct: 1, is_correct: true, explanation: 'Correct!' },
    { q: 'Which measure is robust?', your_answer: 0, correct: 2, is_correct: false, explanation: 'Wrong.' },
  ],
};

test('renders quiz score percentage', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('80%')).toBeInTheDocument();
});

test('renders correct tally', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('1 / 2 correct')).toBeInTheDocument();
});

test('renders question text', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('What is a p-value?')).toBeInTheDocument();
});

test('renders explanation for incorrect answer', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('Wrong.')).toBeInTheDocument();
});
```

**Step 7: Run all tests**
```bash
npm test
```
Expected: 7 passing tests, 0 failures.

**Step 8: Commit**
```bash
git add frontend/__tests__/ frontend/jest.config.ts frontend/jest.setup.ts
git commit -m "test(dashboard): add component tests for GapChart, CourseCards, QuizFeedback"
```

---

## Task 11: Final Quality Gate & PR

**Step 1: Run all quality gates**
```bash
npm run lint          # ESLint — zero errors
npx tsc --noEmit      # TypeScript — zero errors
npm test              # Jest — all pass
npm run build         # Next.js — build succeeds
```

**Step 2: Push and open PR**
```bash
git push origin HEAD
```
PR title: `feat(dashboard): System 7 Employee Dashboard — gap chart, course cards, quiz feedback`

PR description must note:
- Works entirely from `frontend/mock_data/employee_dashboard.json` — no backend required.
- Matches `EmployeeDashboard` contract in `docs/schemas.md` exactly.
- Three components: `GapChart`, `CourseCards`, `QuizFeedback` — each individually tested.

---

## Definition of Done (AGENTS.md §3e)

- [ ] Dashboard renders at `http://localhost:3000/dashboard/employee` from mock data only
- [ ] TypeScript strict mode — zero errors (`npx tsc --noEmit`)
- [ ] All 7+ component tests pass (`npm test`)
- [ ] ESLint + Prettier clean (`npm run lint`, `npx prettier --check .`)
- [ ] No cross-service imports — only `@/types/schemas` and own components
- [ ] `npm run build` succeeds
- [ ] Feature branch `<name>/employee-dashboard`, Conventional Commits throughout
