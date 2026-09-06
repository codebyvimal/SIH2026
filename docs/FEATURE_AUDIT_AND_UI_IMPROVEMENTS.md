# 🚀 Feature Audit & UI Improvement Plan
## SIH 2026 — Career Path & Skill Development Platform
**Audited:** 2026-09-06 | **Goal:** Make this look professional & production-ready

---

## PART 1 — EXISTING FEATURES: WORKING STATUS

### Feature Matrix

| # | Feature | Route | Status | Notes |
|---|---------|-------|--------|-------|
| F1 | Officer Registration / Onboarding | `/onboarding` | ✅ **Working** | Form submits, creates profile in SQLite + NetworkX graph |
| F2 | Employee Dashboard | `/dashboard/employee` | ⚠️ **Partial** | UI works; real-time data loads; grading card never shows (B-014) |
| F3 | Admin Dashboard | `/dashboard/admin` | ⚠️ **Partial** | Charts load; crashes if DB empty; no auth protection |
| F4 | PDF Upload & AI Quiz Generation | `/assessment` | ❌ **Broken** | Wrong Gemini model name → always 500 error |
| F5 | Quiz Taking | `/assessment/quiz/[id]` | ⚠️ **Partial** | Works if quiz exists in DB; grading submitted without `official_id` |
| F6 | Quiz Results | `/assessment/results/[id]` | ⚠️ **Partial** | Works only if user hasn't refreshed; sessionStorage-only |
| F7 | Course Recommendations | `/recommendations` | ⚠️ **Partial** | Falls back to FAISS-only (no LLM justification) due to B-002 |
| F8 | Officials Directory | `/dashboard/admin/officials` | ✅ **Working** | Lists all registered officials from SQLite |

---

## PART 2 — FEATURE-BY-FEATURE ANALYSIS

### F1 — Officer Registration
**Current State:** ✅ Functional

**What Works:**
- Form validation with HTML5 `required`
- Past trainings add/remove dynamically
- Submits `POST /api/v1/profile` → gets `official_id`
- Redirects to `/dashboard/employee?official_id=...` after 2.5s animated wait
- Backend correctly computes initial skill levels from experience + education keywords

**What's Missing / Could Be Better:**
- No form validation for minimum role/dept length
- No role dropdown (free text means typos cause wrong gap analysis — see B-010)
- The "Personalizing..." loading state runs for a fixed 2.5s timeout regardless of actual API speed
- No progress steps (Step 1: Basic Info → Step 2: Training History → Step 3: Done)
- No field-level validation errors (only one global error message)
- No option to upload a resume/CV to auto-fill fields

---

### F2 — Employee Dashboard
**Current State:** ⚠️ Partially Working

**What Works:**
- Official switcher loads up to 5 officials from DB
- Radar/Gap chart renders correctly with live backend data
- Course recommendations render from FAISS
- Live/Offline indicator badge in navbar

**What's Broken:**
- "Recent Assessment" section never appears (grading result not persisted — B-014)
- Profile card shows hardcoded "Analyst / Statistics" as fallback (F-006)
- "Swagger API Docs" nav link is broken (F-007)
- If DB has no officials, page crashes with 404

**Missing Features:**
- Progress tracking (courses completed vs total)
- Skill level trend over time
- Notification for newly assigned training

---

### F3 — Admin Dashboard
**Current State:** ⚠️ Partially Working

**What Works:**
- Domain gap bar chart (recharts BarChart) renders correctly
- Officials-below-target progress bars render
- Top recommended courses list shows

**What's Broken:**
- Division-by-zero risk in frontend: `total_officials` could be 0 (B-006)
- No auth/role check — any user can access `/dashboard/admin`

**Missing Features:**
- No date range filter for analytics
- No export to CSV/PDF functionality
- No per-official drill-down from the admin view
- No real-time refresh (page fully reloads for updates)

---

### F4 — PDF Upload & AI Quiz Generation
**Current State:** ❌ Broken (Primary bug: wrong Gemini model)

**What Works:**
- Drag-and-drop file upload UI is excellent
- PDF validation (type + extension check)
- Backend PDF text extraction works
- Loading animation with progress bar

**What's Broken:**
- `gemini-3.6-flash` model name doesn't exist → every upload returns 500
- No file size limit check on frontend (only MIME type checked)
- Error message string-matching (`errorMessage.toLowerCase().includes("valueerror")`) is fragile

**After fixing B-002, this flow should work end-to-end.**

---

### F5 — Quiz Taking
**Current State:** ⚠️ Partially Working

**What Works:**
- Question navigation (prev/next with answer state)
- Progress bar fills correctly
- Answer selection with A/B/C/D indicators
- "All Answered" counter
- Fallback mock grading when backend grading fails

**What's Broken:**
- `official_id` never sent with grading submission → result never saved (B-014)
- `alert()` used for submission error — not professional

**Missing Features:**
- Timer per question or total quiz timer
- Question review mode (see all questions answered before submit)
- Ability to skip questions (currently "Next" button disabled if unanswered)

---

### F6 — Quiz Results
**Current State:** ⚠️ Partially Working

**What Works:**
- `QuizFeedback` component renders per-question correct/wrong with explanation
- Score percentage displayed
- Links to dashboard and retake

**What's Broken:**
- Results disappear on page refresh (sessionStorage only — F-001)
- No score visualization (just text "Score: X%")

**Missing Features:**
- Visual score card (circular progress indicator or grade badge: A/B/C/D/F)
- Share results button
- "View certificate" if score > threshold

---

### F7 — Course Recommendations
**Current State:** ⚠️ Partially Working (falls back to FAISS)

**What Works:**
- Domain filter chips (All / Digital Tools / Statistical Methods / etc.)
- Grouped by domain sections with course count badges
- CourseCards component with enroll/bookmark functionality

**What's Broken:**
- `/recommend` endpoint always fails due to wrong Gemini model → LLM `why` justifications are missing, generic fallback text used
- Domain extraction from `why` regex is fragile (F-013)

**Missing Features:**
- Sort by relevance / duration / domain
- Saved/bookmarked courses persisted across sessions
- Course preview before enrolling

---

### F8 — Officials Directory (Admin)
**Current State:** ✅ Working

**What Works:**
- Table of all registered officials from SQLite
- Shows official_id, role, dept, education, experience

**Missing Features:**
- Search/filter by role or department
- Clickable row to view that official's employee dashboard
- Sort columns
- Pagination for large datasets

---

## PART 3 — UI IMPROVEMENTS TO MAKE IT PROFESSIONAL

### UI-001 · Add Mobile Navigation Menu 🔴 CRITICAL

The navbar hides all items on mobile. Add a hamburger menu:

```tsx
// In NavBar.tsx — add state + drawer
const [menuOpen, setMenuOpen] = useState(false);

// Mobile hamburger button (visible on <md)
<button
  className="md:hidden p-2 rounded-lg hover:bg-white/10"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Toggle navigation"
>
  <svg ... />  {/* Hamburger or X icon */}
</button>

// Mobile drawer (slide-in from top or side)
{menuOpen && (
  <div className="md:hidden absolute top-full left-0 right-0 bg-deep-navy border-t border-white/10 p-4 space-y-2">
    {navItems.map(item => <Link ... />)}
  </div>
)}
```

---

### UI-002 · Fix Global Page Metadata 🔴 CRITICAL

Update `app/layout.tsx` to use the app's actual name:

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | National Learning Portal',
    default: 'National Learning Portal',
  },
  description: 'Empowering civil servants through AI-driven skill development — SIH 2026',
};
```

Then add per-page metadata in each page file:
```typescript
// app/dashboard/admin/page.tsx
export const metadata = { title: 'Admin Dashboard' };

// app/onboarding/page.tsx
export const metadata = { title: 'Officer Registration' };
```

---

### UI-003 · Add `animate-fade-in-up` to Tailwind Config 🟠 HIGH

```typescript
// tailwind.config.ts
theme: {
    extend: {
        colors: { 'deep-navy': '#1E293B', 'saffron': '#E65100' },
        animation: {
            'fade-in-up': 'fadeInUp 0.4s ease-out both',
            'fade-in': 'fadeIn 0.3s ease-out both',
        },
        keyframes: {
            fadeInUp: {
                '0%': { opacity: '0', transform: 'translateY(16px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
        },
    },
},
```

---

### UI-004 · Add Score Visualization to Results Page 🟠 HIGH

Replace plain text score with a visual circular progress:

```tsx
// In results/[quiz_id]/page.tsx
const scoreColor = result.score >= 80 ? 'emerald' : result.score >= 60 ? 'amber' : 'rose';
const grade = result.score >= 90 ? 'A' : result.score >= 80 ? 'B' : result.score >= 70 ? 'C' : result.score >= 60 ? 'D' : 'F';

<div className="flex flex-col items-center py-8">
  {/* Circular Score Badge */}
  <div className={`h-32 w-32 rounded-full border-8 border-${scoreColor}-400 flex flex-col items-center justify-center`}>
    <span className="text-4xl font-black text-slate-800">{grade}</span>
    <span className="text-sm font-semibold text-slate-500">{result.score.toFixed(0)}%</span>
  </div>
  <p className="mt-4 text-lg font-semibold text-slate-700">
    {result.score >= 80 ? '🎉 Excellent work!' : result.score >= 60 ? '👍 Good effort!' : '📚 Keep practicing!'}
  </p>
</div>
```

---

### UI-005 · Landing Page — Add Login/Role Selection Flow 🟠 HIGH

The landing page is completely static. Improve it to collect the officer's ID before entering:

```tsx
// app/page.tsx — add a simple role + ID entry
const [entryMode, setEntryMode] = useState<'select' | 'employee' | 'admin'>('select');

// Show official_id input before navigating to dashboard
// This fixes the "hardcoded fallback profile" bug at the same time
```

---

### UI-006 · Replace `alert()` with Inline Error Component 🟠 HIGH

Create a reusable `ErrorToast` component:

```tsx
// components/ErrorToast.tsx
export default function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-red-900/90 text-red-100 rounded-xl px-5 py-4 shadow-xl border border-red-700/50 max-w-sm animate-fade-in-up">
      <span className="text-red-400 mt-0.5">⚠</span>
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="text-red-400 hover:text-white">✕</button>
    </div>
  );
}
```

---

### UI-007 · Add Loading Skeletons Instead of Blank Screens 🟡 MEDIUM

Currently, server components show nothing while data loads. Add skeleton screens:

```tsx
// components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
}
```

Use with Suspense:
```tsx
<Suspense fallback={<SkeletonCard />}>
  <EmployeeDashboard ... />
</Suspense>
```

---

### UI-008 · Role Dropdown in Onboarding Form 🟡 MEDIUM

Replace free-text role input with a dropdown of known MoSPI roles. This ensures gap analysis works correctly:

```tsx
const ROLES = [
  "Statistical Officer", "Data Analyst", "Senior Statistician",
  "Director", "Deputy Director", "Research Officer",
  "GIS Specialist", "IT Officer", "Policy Analyst"
];

<select name="role" required ...>
  <option value="">Select your role...</option>
  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
</select>
```

---

### UI-009 · Progress Tracker Component on Employee Dashboard 🟡 MEDIUM

Add a visual progress tracker showing courses enrolled vs total recommended:

```tsx
// Shows: "2 of 6 courses enrolled"
<div className="rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 p-4">
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-semibold text-slate-700">Learning Progress</span>
    <span className="text-sm font-bold text-blue-600">2 / 6 enrolled</span>
  </div>
  <div className="h-2 bg-white rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" style={{ width: '33%' }} />
  </div>
</div>
```

---

### UI-010 · Add Empty State to Admin Dashboard 🟡 MEDIUM

When no officials are registered, show a helpful empty state instead of empty charts:

```tsx
if (data.total_officials === 0) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-700">No Officials Registered Yet</h2>
      <p className="text-slate-500 mt-2">Ask officers to register via the onboarding form.</p>
      <Link href="/onboarding" className="mt-6 inline-block bg-saffron text-white px-6 py-3 rounded-xl font-bold">
        Register First Officer →
      </Link>
    </div>
  );
}
```

---

### UI-011 · Improve CourseCards — Show Course Progress State 🟡 MEDIUM

After enrolling, show the course as "Enrolled ✓" with a link to the iGOT platform:

```tsx
{enrolled ? (
  <a
    href={`https://igot.gov.in/course/${course.course_id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-emerald-600 font-semibold text-sm"
  >
    ✓ Enrolled — Start Course ↗
  </a>
) : (
  <button onClick={handleEnroll}>Enroll Now</button>
)}
```

---

### UI-012 · Add Accessible Attributes Throughout 🟡 MEDIUM

Many interactive elements are missing accessibility attributes:

```tsx
// SVG icons used as content
<svg aria-hidden="true" focusable="false" ... />

// Form required fields
<input aria-required="true" ... />

// Loading spinners
<div role="status" aria-label="Loading...">
  <svg className="animate-spin" aria-hidden="true" ... />
</div>

// Cards with actions
<article aria-label={`Course: ${course.title}`}>
```

---

### UI-013 · Add Global Error Boundary 🟡 MEDIUM

Wrap the app in a global error boundary to handle unexpected crashes gracefully:

```tsx
// app/error.tsx (Next.js built-in)
'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center text-white">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-6">{error.message}</p>
        <button onClick={reset} className="bg-saffron text-white px-6 py-3 rounded-xl font-bold">
          Try Again
        </button>
      </div>
    </div>
  );
}
```

---

## PART 4 — PRIORITIZED SPRINT PLAN

### 🔴 Sprint 1 — Critical Fixes (Do First, ~4 hours)

| # | Action | File(s) |
|---|--------|---------|
| 1 | Fix Gemini model name `gemini-3.6-flash` → `gemini-1.5-flash` | `assessment/logic.py`, `recommendation/logic.py` |
| 2 | Send `official_id` in grading submission | `QuizClient.tsx` |
| 3 | Fix assessment results — fetch from API instead of sessionStorage | `results/[quiz_id]/page.tsx` |
| 4 | Add mobile hamburger menu to NavBar | `NavBar.tsx` |
| 5 | Fix global layout title from "Employee Dashboard" | `layout.tsx` |

### 🟠 Sprint 2 — High Impact UX (4–8 hours)

| # | Action | File(s) |
|---|--------|---------|
| 6 | Add `animate-fade-in-up` to tailwind config | `tailwind.config.ts` |
| 7 | Move progress bar animation to `globals.css` | `assessment/page.tsx`, `globals.css` |
| 8 | Replace hardcoded fallback profile with proper error state | `employee/page.tsx` |
| 9 | Fix Swagger docs nav link hardcoding | `employee/page.tsx` |
| 10 | Replace `alert()` with `ErrorToast` component | `QuizClient.tsx` |
| 11 | Add empty state to Admin Dashboard | `admin/page.tsx` |
| 12 | Add score visualization (grade badge) to results page | `results/[quiz_id]/page.tsx` |

### 🟡 Sprint 3 — Polish & Professional (8–16 hours)

| # | Action | File(s) |
|---|--------|---------|
| 13 | Role dropdown in onboarding form | `onboarding/page.tsx` |
| 14 | Add loading skeletons with Suspense | New `SkeletonCard.tsx` component |
| 15 | Add global error boundary | New `app/error.tsx` |
| 16 | Fix TypeScript `any` types in recommendations page | `recommendations/page.tsx` |
| 17 | Add accessibility attributes to all SVG icons and forms | All page components |
| 18 | Add learning progress tracker to employee dashboard | `employee/page.tsx` |
| 19 | Persist enrollment state via API read on load | `CourseCards.tsx` |
| 20 | Add per-page metadata titles | All page files |

---

## PART 5 — DESIGN SYSTEM IMPROVEMENTS

### Color Palette Enhancement
Current palette is good but could be refined:

```
Current:
  Deep Navy:  #1E293B  (keep — strong government blue)
  Saffron:    #E65100  (keep — India theme accent)

Add:
  Success:    #10B981  (emerald-500)
  Warning:    #F59E0B  (amber-500)
  Danger:     #EF4444  (red-500)
  Light BG:   #F8FAFC  (slate-50, already used)
  Border:     #E2E8F0  (slate-200, already used)
```

### Typography
Currently no custom font is loaded — using system-ui. For a professional look, add:
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

### Card Design Pattern
Standardize all cards to use:
```css
.card {
  @apply rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow;
}
```

### Consistent Button System
Create a `Button` component with variants:
```tsx
<Button variant="primary">Create Profile</Button>    // saffron fill
<Button variant="secondary">View Details</Button>    // white + border
<Button variant="ghost">Cancel</Button>             // transparent
<Button variant="danger">Delete</Button>            // red fill
```

---

*Generated by automated UI/feature audit — SIH-build @ `/home/ramasass/SIH-build`*
