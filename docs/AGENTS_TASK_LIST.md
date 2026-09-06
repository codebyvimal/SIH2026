# 🤖 AI Agent Task List — SIH 2026 Platform
## Read this file first before making ANY changes.

**Project root:** `/home/ramasass/SIH-build`
**Backend:** FastAPI at `http://localhost:8000`
**Frontend:** Next.js at `http://localhost:3000`
**Database:** SQLite at `data/dummy/app.db`

> **iGOT Integration Note:** The iGOT Karmayogi integration uses MOCK/DUMMY data intentionally.
> Do NOT try to call real iGOT APIs. Keep `backend/app/services/igot_mock/` as dummy data
> but make it look realistic and robust for demo purposes.

---

## 📋 REFERENCE FILES (read these for context)
- `docs/BUG_REPORT.md` — All bugs with exact file + line numbers
- `docs/FEATURE_AUDIT_AND_UI_IMPROVEMENTS.md` — Feature status + UI plan

---

## 🔴 SPRINT 1 — CRITICAL FIXES (Do first, in order)

### TASK-01 · Fix Gemini Model Name — 2 files
**Priority:** CRITICAL — breaks all AI features
```
backend/app/services/assessment/logic.py      line 32
backend/app/services/recommendation/logic.py  line 28
```
Change: `_GEMINI_MODEL = 'gemini-3.6-flash'`
To:     `_GEMINI_MODEL = 'gemini-1.5-flash'`

---

### TASK-02 · Send official_id with Grading Submission
**Priority:** CRITICAL — grading never saved, Recent Assessment card never shows
```
frontend/app/assessment/quiz/[quiz_id]/QuizClient.tsx   lines 44-51
```
Add `officialId?: string` prop to QuizClient. Pass from page via searchParams.
Include `official_id: officialId ?? null` in the grading POST body.

---

### TASK-03 · Fix Quiz Results Page — Remove sessionStorage Dependency
**Priority:** CRITICAL — results lost on page refresh
```
frontend/app/assessment/results/[quiz_id]/page.tsx
```
Keep sessionStorage as primary (for instant display after quiz).
Add fallback: if sessionStorage empty, fetch from GET /api/v1/grading/{quiz_id}.
Also add a GET endpoint in `backend/app/services/grading/router.py`.

---

### TASK-04 · Add Mobile Navigation Hamburger Menu
**Priority:** CRITICAL — mobile users cannot navigate
```
frontend/components/NavBar.tsx
```
Add `'use client'` directive. Add `useState(false)` for menuOpen.
Add hamburger button (visible on <md). Add absolute dropdown drawer with navItems.
Add `relative` to the nav element for dropdown positioning.

---

### TASK-05 · Fix Global Page Title
**Priority:** CRITICAL — all pages show "Employee Dashboard"
```
frontend/app/layout.tsx
```
Change metadata title to use template: `'%s | National Learning Portal'`.
Add per-page metadata exports in each page file (use layout.tsx for client pages).

---

## 🟠 SPRINT 2 — HIGH IMPACT

### TASK-06 · Add animate-fade-in-up to Tailwind
```
frontend/tailwind.config.ts
```
Add animation + keyframes for `fadeInUp` and `fadeIn` in `theme.extend`.
Move `@keyframes progress` from assessment/page.tsx dangerouslySetInnerHTML to globals.css.

### TASK-07 · Fix Admin Dashboard Empty State
```
frontend/app/dashboard/admin/page.tsx
```
If `data.total_officials === 0`, return an empty state UI with a link to /onboarding.

### TASK-08 · Remove Hardcoded Profile Fallback
```
frontend/app/dashboard/employee/page.tsx   lines 22-30
```
Remove hardcoded `role: "Analyst", dept: "Statistics"` fallback object.
Show data from the dashboard response instead.

### TASK-09 · Replace alert() with Inline Error in QuizClient
```
frontend/app/assessment/quiz/[quiz_id]/QuizClient.tsx   line 86
```
Replace `alert('Error...')` with `setSubmitError(...)` state rendered as styled div.

### TASK-10 · Add Score/Grade Visualization to Results
```
frontend/app/assessment/results/[quiz_id]/page.tsx
```
Add circular grade badge (A/B/C/D/F) above QuizFeedback component.
Show score %, correct count, and motivational message.

### TASK-11 · Fix Swagger Docs Link
```
frontend/app/dashboard/employee/page.tsx   line 41
```
Replace `API_BASE.replace('/api/v1', '/docs')` with hardcoded `http://localhost:8000/docs`.

### TASK-12 · Remove Debug Text from Profile Card
```
frontend/app/dashboard/employee/page.tsx   line 57
```
Change "Officer Profile in SQLite Database" to "My Learning Profile".

---

## 🟡 SPRINT 3 — POLISH

### TASK-13 · Role Dropdown in Onboarding
Replace free-text role input with select dropdown of MoSPI roles.

### TASK-14 · Global Error Boundary
Create `frontend/app/error.tsx` (Next.js built-in error boundary).

### TASK-15 · Loading Skeletons
Create `frontend/components/SkeletonCard.tsx` + use Suspense on dashboard pages.

### TASK-16 · Fix TypeScript any types
`frontend/app/recommendations/page.tsx` — replace `any[]` with proper schema types.

### TASK-17 · Startup GEMINI_API_KEY Warning
`backend/app/main.py` — add `@app.on_event("startup")` to warn if key missing.

### TASK-18 · Fix Quiz ID Collision
`backend/app/services/assessment/logic.py` line 108
Use content hash in uuid5: `f"{filename}_{hashlib.md5(pdf_bytes[:1000]).hexdigest()[:8]}"`.

### TASK-19 · Persist iGOT Enrollment to SQLite
`backend/app/services/igot_mock/logic.py`
Move in-memory dict to SQLite table. Keep all data fake/dummy.

### TASK-20 · Accessibility Attributes
Add `aria-hidden="true"` to decorative SVGs, `aria-required="true"` to form fields,
`role="status"` to loading spinners across all pages.

---

## ✅ DEFINITION OF DONE

- [ ] PDF upload at /assessment generates 5 MCQs (needs GEMINI_API_KEY in .env)
- [ ] Submitting quiz saves grading → "Recent Assessment" shows on employee dashboard
- [ ] Refreshing /assessment/results/{id} still shows results
- [ ] Mobile browser shows hamburger menu with all nav links
- [ ] Admin page browser tab says "Admin Dashboard | National Learning Portal"
- [ ] Admin dashboard with empty DB shows empty state instead of broken charts
- [ ] animate-fade-in-up visually works on onboarding page

---

## 🗂 KEY FILE MAP

```
SIH-build/
├── backend/app/
│   ├── main.py                            # App entry + dashboard orchestration
│   ├── shared/schemas.py                  # All Pydantic models
│   ├── shared/db.py                       # SQLAlchemy engine factory
│   └── services/
│       ├── profile/logic.py               # System 1: Profile + SQLite + NetworkX
│       ├── gap_analysis/logic.py          # System 2: Gap vs framework.json
│       ├── recommendation/logic.py        # System 3: FAISS + Gemini ⚠️ fix model name
│       ├── igot_mock/logic.py             # System 4: DUMMY iGOT (keep as dummy)
│       ├── assessment/logic.py            # System 5: PDF→MCQ via Gemini ⚠️ fix model name
│       └── grading/logic.py               # System 6: Quiz grading + persistence
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                     # ⚠️ Fix global title
│   │   ├── onboarding/page.tsx            # Registration form
│   │   ├── assessment/page.tsx            # PDF upload
│   │   ├── assessment/quiz/[quiz_id]/
│   │   │   └── QuizClient.tsx             # ⚠️ Add official_id to grading POST
│   │   ├── assessment/results/[quiz_id]/
│   │   │   └── page.tsx                   # ⚠️ Fix sessionStorage dependency
│   │   ├── dashboard/employee/page.tsx    # Employee dashboard
│   │   ├── dashboard/admin/page.tsx       # Admin dashboard
│   │   └── recommendations/page.tsx       # All recommendations
│   ├── components/
│   │   ├── NavBar.tsx                     # ⚠️ Add mobile hamburger menu
│   │   └── dashboard/
│   │       ├── GapChart.tsx               # Radar chart
│   │       ├── CourseCards.tsx            # Course cards + enroll
│   │       ├── QuizFeedback.tsx           # Per-question feedback
│   │       ├── AdminDomainChart.tsx       # Bar chart (recharts)
│   │       └── AdminTopCourses.tsx        # Top course list
│   ├── lib/api.ts                         # API fetch functions
│   ├── lib/config.ts                      # API_BASE config
│   └── tailwind.config.ts                 # ⚠️ Add animate-fade-in-up
└── data/dummy/
    ├── framework.json                     # MoSPI competency framework (static)
    ├── courses.json                       # iGOT course catalogue (dummy data)
    └── app.db                             # SQLite (auto-created)
```
