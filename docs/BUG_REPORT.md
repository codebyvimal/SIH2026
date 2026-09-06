# 🐛 Bug Report & Loophole Analysis
## SIH 2026 — Career Path & Skill Development Platform
**Audited:** 2026-09-06 | **Status:** Critical issues found

---

## SECTION 1 — BACKEND BUGS & LOOPHOLES

### 🔴 CRITICAL

---

#### B-001 · `recommendation/logic.py` — Module-level crash on import
**File:** [`backend/app/services/recommendation/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/recommendation/logic.py#L31-L32)

```python
# Line 31-32 — runs at IMPORT TIME, not lazily
COURSES: list[IgotCourse] = [IgotCourse(**c) for c in json.loads(_COURSES_PATH.read_text())]
_embed_model: SentenceTransformer = SentenceTransformer(_EMBED_MODEL_NAME)
```

**Bug:** `_COURSES_PATH = pathlib.Path('data/dummy/courses.json')` is a **relative path**, resolved from wherever `uvicorn` is invoked, not from the repo root. If the server is started from any directory other than `/home/ramasass/SIH-build`, this crashes at startup with `FileNotFoundError`.

Also, `SentenceTransformer` is instantiated at module load — this downloads a 80MB model on first run, blocking the entire startup for 10–30 seconds with no progress feedback.

**Fix:**
```python
_COURSES_PATH = pathlib.Path(__file__).parents[4] / 'data' / 'dummy' / 'courses.json'
```

---

#### B-002 · `recommendation/logic.py` — Wrong Gemini model name
**File:** [`backend/app/services/recommendation/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/recommendation/logic.py#L28)

```python
_GEMINI_MODEL = 'gemini-3.6-flash'  # Does not exist
```

**Bug:** The model `gemini-3.6-flash` does not exist in Google's API. Correct names are `gemini-1.5-flash`, `gemini-1.5-pro`, or `gemini-2.0-flash`. This causes every `/recommend` call to fail with a 500 error, silently degrading the `Recommendations` page to mock data.

Same bug exists in `assessment/logic.py` line 32: `_GEMINI_MODEL = 'gemini-3.6-flash'`.

**Fix:**
```python
_GEMINI_MODEL = 'gemini-1.5-flash'
```

---

#### B-003 · `gap_analysis/logic.py` — Framework file path assumes CWD
**File:** [`backend/app/services/gap_analysis/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/gap_analysis/logic.py#L176)

```python
framework_path = _get_data_dir() / 'framework.json'
with open(framework_path) as f:   # No try/except
    framework = json.load(f)
```

**Bug 1:** If `data/dummy/framework.json` is missing, this raises an uncaught `FileNotFoundError` resulting in a 500 Internal Server Error instead of a useful 422/404.

**Bug 2:** `_get_data_dir()` uses `Path(__file__).parents[4]` — correct in this case, but the function name doesn't document the parent count assumption. If folder structure changes, this silently breaks.

**Fix:** Wrap in try/except and return a 500 with a clear message:
```python
try:
    with open(framework_path) as f:
        framework = json.load(f)
except FileNotFoundError:
    raise HTTPException(status_code=500, detail="Competency framework file not found.")
```

---

#### B-004 · `assessment/router.py` — Missing API prefix on routes
**File:** [`backend/app/services/assessment/router.py`](file:///home/ramasass/SIH-build/backend/app/services/assessment/router.py#L9-L14)

```python
router = APIRouter()   # No prefix!

@router.post('/assessment', ...)     # becomes /api/v1/assessment ✓
@router.get('/assessment/quiz/{quiz_id}', ...)  # becomes /api/v1/assessment/quiz/{id} ✓
```

**Bug:** Unlike all other routers (which use `prefix='/profile'`, `prefix='/recommend'`, etc.), the assessment router has **no prefix**. This means the URL paths `/assessment` and `/assessment/quiz/{id}` are placed directly under `API_V1_PREFIX`. While functional here, it breaks the naming convention and makes the route structure inconsistent — the grading router has `prefix='/grading'` but assessment doesn't have `prefix='/assessment'`.

The real issue: the frontend calls `${API_BASE}/assessment/quiz/${quizId}` which matches `/api/v1/assessment/quiz/{quiz_id}` correctly — but this is accidental, not intentional. If someone adds a prefix to the router to fix the inconsistency, the frontend will break.

---

#### B-005 · `grading/logic.py` — `datetime.utcnow()` deprecated
**File:** [`backend/app/services/grading/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/grading/logic.py#L65)

```python
created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime, default=datetime.datetime.utcnow, nullable=False
)
```

**Bug:** `datetime.utcnow()` is deprecated since Python 3.12 and will raise a `DeprecationWarning`. It also produces a naive datetime without timezone info, which can cause issues across timezones.

**Fix:**
```python
from datetime import datetime, timezone
default=lambda: datetime.now(timezone.utc)
```

---

### 🟠 HIGH SEVERITY

---

#### B-006 · `main.py` — Admin dashboard crashes on empty database
**File:** [`backend/app/main.py`](file:///home/ramasass/SIH-build/backend/app/main.py#L75-L93)

```python
@app.get(f'{API_V1_PREFIX}/admin/dashboard', ...)
def get_admin_dashboard() -> AdminDashboard:
    profiles = list_profiles()
    total_officials = len(profiles)   # = 0 on empty DB
    ...
    for p in profiles:  # never runs
        ...
        matches = semantic_search(g.skill, index, COURSES, top_k=2)  # FAISS index built here
```

**Bug:** On a fresh install with no officials registered, the admin dashboard returns empty aggregates. But the `_get_index()` call inside the loop is never reached, meaning the FAISS index is not warm. The first time the employee dashboard is called after onboarding, there's an extra delay building the FAISS index.

More seriously: `total_officials = 0`, and `pct` in the frontend is computed as `(d.officials_below_target / data.total_officials) * 100` — **division by zero** in the frontend if `total_officials = 0`.

---

#### B-007 · `main.py` — Route conflict: `@app.get('/profiles')` shouldn't exist
**File:** [`backend/app/main.py`](file:///home/ramasass/SIH-build/backend/app/main.py#L123)

```python
@app.get(f'{API_V1_PREFIX}/dashboard/employee/{{official_id}}', ...)
@app.get(f'{API_V1_PREFIX}/dashboard/employee', ...)
@app.get(f'{API_V1_PREFIX}/profiles', ...)   # ← this should NOT exist
def get_employee_dashboard(official_id: str | None = None) -> EmployeeDashboard:
```

**Bug:** The route `/api/v1/profiles` is registered as an alias for the employee dashboard but it returns `EmployeeDashboard` instead of a list of profiles. The `/api/v1/profile` router already handles profile CRUD. This alias is confusing, undocumented, and returns a single-employee view (which picks profiles[0] randomly if no official_id is passed).

---

#### B-008 · `profile/logic.py` — SQLite connection not always closed on error
**File:** [`backend/app/services/profile/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/profile/logic.py#L168-L193)

```python
conn = sqlite3.connect(db_path)
past_trainings_json = json.dumps(...)
with conn:
    conn.execute(...)
conn.close()          # Not inside finally block!
profile_stored = True
```

**Bug:** If `json.dumps()` raises (unlikely but possible with malformed data), `conn.close()` is never called. The connection is leaked. Should use a `finally` block or `contextlib.closing`.

---

#### B-009 · No `GEMINI_API_KEY` validation at startup
**Files:** [`assessment/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/assessment/logic.py#L82-L84), [`recommendation/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/recommendation/logic.py#L44-L46)

**Bug:** The missing `GEMINI_API_KEY` is only detected when a user actually tries to upload a PDF or hit `/recommend`. The server starts without warnings. In production, an operator might deploy without setting the API key and only discover it hours later when a user reports a 500 error.

**Fix:** Add a startup event handler:
```python
@app.on_event("startup")
async def validate_config():
    if not os.getenv("GEMINI_API_KEY"):
        import warnings
        warnings.warn("GEMINI_API_KEY not set — assessment and recommendation endpoints will fail.")
```

---

#### B-010 · `gap_analysis/logic.py` — `role` in request not validated against framework
**File:** [`backend/app/services/gap_analysis/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/gap_analysis/logic.py#L182)

```python
required_level_value = skill_info['required_by_role'].get(input_data.role, 0)
```

**Bug:** If the `role` submitted to `GapAnalysisInput` doesn't exist in `framework.json`, every skill's `required_level_value` silently becomes `0`, making every gap equal to `0`. The API returns success with all zeros — **no gaps are detected** — which is incorrect. There is no validation or warning that the role is unknown.

---

### 🟡 MEDIUM SEVERITY

---

#### B-011 · `profile/logic.py` — Domain keyword matching has false positives
**File:** [`backend/app/services/profile/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/profile/logic.py#L53-L62)

```python
Domain.DIGITAL_TOOLS: [
    ...
    ' r ',        # matches any word containing ' r ' e.g. "training"
    ...
]
```

**Bug:** The keyword `' r '` (with spaces) is intended to match "R programming", but it can match any string containing the letter `r` surrounded by spaces — such as "trainer", "director", "career" when the word boundary context includes spaces.

---

#### B-012 · `assessment/logic.py` — Same filename always produces the same quiz_id
**File:** [`backend/app/services/assessment/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/assessment/logic.py#L108)

```python
quiz_id=str(uuid.uuid5(_NAMESPACE, filename)),
```

**Bug:** The quiz ID is derived only from the filename (UUID5 is deterministic). If two different users upload different PDFs but with the same filename (e.g., `report.pdf`), the second upload **overwrites** the first quiz in the database due to `session.merge()`. The first user's quiz is silently destroyed.

---

#### B-013 · `igot_mock` enrollment — In-memory only, lost on restart
**File:** [`backend/app/services/igot_mock/logic.py`](file:///home/ramasass/SIH-build/backend/app/services/igot_mock)

**Bug:** iGOT enrollments are stored in a Python `dict` in memory (not SQLite). Every server restart wipes all enrollment records. The `CourseCards` component in the frontend calls `POST /igot/enroll` on bookmark, but after a backend restart, calling `GET /igot/completion/{id}` returns 404, which would crash the completion check.

---

#### B-014 · `grading/router.py` — No `official_id` in default grading call from frontend
**File:** [`backend/app/services/grading/router.py`](file:///home/ramasass/SIH-build/backend/app/services/grading) + [`frontend/app/assessment/quiz/[quiz_id]/QuizClient.tsx`](file:///home/ramasass/SIH-build/frontend/app/assessment/quiz/%5Bquiz_id%5D/QuizClient.tsx#L44-L51)

```typescript
// QuizClient.tsx line 47-50:
body: JSON.stringify({
    quiz_id: quiz.quiz_id,
    answers,
    // official_id is NEVER included!
})
```

**Bug:** The grading result is submitted without `official_id`, so the result is **never persisted** to the `grading_results` table. This means:
1. The employee dashboard always shows `latest_grading: null`
2. The "Recent Assessment" card never appears on the dashboard
3. The whole grading persistence feature is silently broken end-to-end

---

## SECTION 2 — FRONTEND BUGS & LOOPHOLES

### 🔴 CRITICAL

---

#### F-001 · `assessment/results/[quiz_id]/page.tsx` — Results lost on page refresh
**File:** [`frontend/app/assessment/results/[quiz_id]/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/assessment/results/%5Bquiz_id%5D/page.tsx#L17)

```typescript
const data = sessionStorage.getItem(`gradingResult_${quiz_id}`);
```

**Bug:** Results are stored only in `sessionStorage`. If the user:
- Refreshes the results page
- Opens the results URL in a new tab
- Shares the link with a colleague
- Navigates away and returns via browser history

...they see "Results not found" and an error state. The grading result should be fetched from the backend API (`GET /grading/{quiz_id}`) instead of relying on ephemeral session storage.

---

#### F-002 · `app/layout.tsx` — Global title says "Employee Dashboard" on all pages
**File:** [`frontend/app/layout.tsx`](file:///home/ramasass/SIH-build/frontend/app/layout.tsx#L4-L7)

```typescript
export const metadata: Metadata = {
  title: "Employee Dashboard",   // ← Wrong for Admin, Onboarding, Assessment pages
  description: "SIH 2026",
};
```

**Bug:** Every page in the app — admin dashboard, onboarding, assessment upload — shows "Employee Dashboard" in the browser tab title and in search engine results. This is confusing and looks unprofessional.

---

#### F-003 · `NavBar.tsx` — No mobile menu; navigation invisible on phones
**File:** [`frontend/components/NavBar.tsx`](file:///home/ramasass/SIH-build/frontend/components/NavBar.tsx#L149)

```tsx
<div className="hidden items-center gap-6 md:flex">
```

**Bug:** Navigation items are hidden on mobile (`hidden ... md:flex`) with **no hamburger/drawer menu fallback**. On screens < 768px wide, users cannot navigate to any other page. This is a critical UX failure.

---

### 🟠 HIGH SEVERITY

---

#### F-004 · `recommendations/page.tsx` — N+1 API calls + using `any` types
**File:** [`frontend/app/recommendations/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/recommendations/page.tsx#L19-L38)

```typescript
let allRecommendations: any[] = [];   // ← any type
const promises = gaps.map(async (gap) => {
    const res = await fetch(`${API_BASE}/recommend`, { ... });  // One API call per gap!
```

**Bug 1:** For an official with 8 skill gaps, this fires 8 parallel `POST /recommend` requests — each triggering a separate Gemini API call ($$, latency). The employee dashboard already returns recommendations; this page should reuse those.

**Bug 2:** `let allRecommendations: any[]` and `const uniqueRecs: any[]` suppress all TypeScript type safety. Type errors in the recommendation shape would be invisible.

---

#### F-005 · `assessment/page.tsx` — `sessionStorage` data never used
**File:** [`frontend/app/assessment/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/assessment/page.tsx#L120)

```typescript
sessionStorage.setItem(`quizData_${data.quiz_id}`, JSON.stringify(data));
```

**Bug:** Quiz data is stored to `sessionStorage` after PDF upload, but the quiz page (`app/assessment/quiz/[quiz_id]/page.tsx`) performs a **fresh server-side `fetchQuiz()` call** and never reads from `sessionStorage`. This write is dead code and a memory waste.

---

#### F-006 · `employee/page.tsx` — Hardcoded fallback profile data
**File:** [`frontend/app/dashboard/employee/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/dashboard/employee/page.tsx#L22-L30)

```typescript
const currentOfficial = officials.find(o => o.official_id === data.official_id) || {
    official_id: data.official_id,
    role: "Analyst",          // ← Hardcoded
    dept: "Statistics",       // ← Hardcoded
    experience_years: 3,      // ← Hardcoded
    education: "M.Sc. Statistics",  // ← Hardcoded
};
```

**Bug:** If the `/officials` endpoint fails or doesn't find the current official, the profile card silently displays wrong data: "Analyst" / "Statistics" / "3 Years" — the developer's test values. The user sees fake information about themselves.

---

#### F-007 · `employee/page.tsx` — Swagger Docs link is fragile
**File:** [`frontend/app/dashboard/employee/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/dashboard/employee/page.tsx#L41)

```typescript
{ label: "Swagger API Docs ↗", href: API_BASE.replace('/api/v1', '/docs') }
```

**Bug:** `API_BASE` on the client side is `/api/v1` (relative URL — see `config.ts`). The replace produces `/docs`, which tries to load `/docs` from the Next.js server (port 3000), not from the FastAPI server (port 8000). This link is broken in production.

---

#### F-008 · `CourseCards.tsx` — Enrollment state lost on refresh
**File:** [`frontend/components/dashboard/CourseCards.tsx`](file:///home/ramasass/SIH-build/frontend/components/dashboard)

```typescript
const [enrolled, setEnrolled] = useState(false);
```

**Bug:** The "Enroll/Bookmark" button state is local component state. After the user enrolls in a course and refreshes the page, the button resets to "Enroll" even though the backend registered the enrollment. No mechanism reads enrollment state back from the server.

---

#### F-009 · `QuizClient.tsx` — `alert()` used for error handling
**File:** [`frontend/app/assessment/quiz/[quiz_id]/QuizClient.tsx`](file:///home/ramasass/SIH-build/frontend/app/assessment/quiz/%5Bquiz_id%5D/QuizClient.tsx#L86)

```typescript
alert('Error submitting quiz. Please try again.');
```

**Bug:** Using `window.alert()` in a React app is an antipattern. It blocks the UI thread, looks unprofessional, and is not accessible. Should be replaced with an inline error state rendered as a styled `<div>`.

---

### 🟡 MEDIUM SEVERITY

---

#### F-010 · `tailwind.config.ts` — `animate-fade-in-up` class not defined
**File:** [`frontend/tailwind.config.ts`](file:///home/ramasass/SIH-build/frontend/tailwind.config.ts)

**Bug:** The class `animate-fade-in-up` is used in:
- `app/page.tsx`
- `app/onboarding/page.tsx` (line 145, 255)

But it is **not defined** in `tailwind.config.ts` under `theme.extend.keyframes` or `theme.extend.animation`. The class is silently ignored — elements don't animate as intended.

**Fix (add to tailwind.config.ts):**
```typescript
animation: {
    'fade-in-up': 'fadeInUp 0.4s ease-out both',
},
keyframes: {
    fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(12px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
    },
},
```

---

#### F-011 · `assessment/page.tsx` — Inline `<style>` with `dangerouslySetInnerHTML`
**File:** [`frontend/app/assessment/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/assessment/page.tsx#L355-L364)

```tsx
<style dangerouslySetInnerHTML={{ __html: `@keyframes progress { ... }` }} />
```

**Bug:** Using `dangerouslySetInnerHTML` for CSS keyframes is a React antipattern. It bypasses React's hydration safety and is flagged by ESLint. The animation should be defined in `globals.css` or `tailwind.config.ts`.

---

#### F-012 · `employee/page.tsx` — Demo text left in production UI
**File:** [`frontend/app/dashboard/employee/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/dashboard/employee/page.tsx#L57-L58)

```tsx
<p className="text-xs font-bold text-slate-800">
    Officer Profile in SQLite Database
</p>
```

**Bug:** The text "Officer Profile in SQLite Database" is developer/demo copy that was never replaced with production-ready text. Users don't need to know what database technology is used on their profile card.

---

#### F-013 · `recommendations/page.tsx` — Fragile domain extraction with regex
**File:** [`frontend/app/recommendations/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/recommendations/page.tsx#L44)

```typescript
const domainMatch = r.why.match(/\(([^)]+)\)/);
let domainStr = domainMatch ? domainMatch[1].toLowerCase().replace(/ /g, "_") : ...
```

**Bug:** Domain is extracted from the `why` text field using regex matching parentheses. This relies on the backend generating `why` strings in a specific format like "... in Skill Gap (Digital Tools)". If the LLM generates a different format, or the `why` contains other parenthesized text, the domain extraction silently fails or returns garbage.

---

#### F-014 · `app/page.tsx` — Landing page has no auth; anyone can access admin
**File:** [`frontend/app/page.tsx`](file:///home/ramasass/SIH-build/frontend/app/page.tsx)

**Loophole:** The landing page has two buttons: "I'm an Officer" → `/dashboard/employee` and "I'm an Administrator" → `/dashboard/admin`. There is no authentication, role check, or login. Anyone can click "I'm an Administrator" and access all admin functions including seeing all officials' data and competency gaps.

---

#### F-015 · `next.config.mjs` — API proxy hardcodes `127.0.0.1:8000`
**File:** [`frontend/next.config.mjs`](file:///home/ramasass/SIH-build/frontend/next.config.mjs#L7)

```javascript
destination: 'http://127.0.0.1:8000/api/v1/:path*'
```

**Loophole:** The proxy destination is hardcoded. In containerized/cloud deployments (Docker Compose, Kubernetes), the backend would be at a different hostname (e.g., `http://backend:8000`). This requires code changes for any deployment other than localhost.

---

## SECTION 3 — BACKEND ↔ FRONTEND INTEGRATION GAPS

| # | Endpoint | Backend Status | Frontend Consumption | Issue |
|---|----------|---------------|---------------------|-------|
| I-001 | `GET /api/v1/officials` | ✅ Works | `fetchOfficials()` in `api.ts` | Endpoint exists but uses raw `list[dict]` — not typed |
| I-002 | `POST /api/v1/grading` | ✅ Works | `QuizClient.tsx` | `official_id` never sent → grading never persisted (B-014) |
| I-003 | `POST /api/v1/recommend` | ❌ LLM crashes | `recommendations/page.tsx` | Wrong Gemini model name (B-002) → falls back to FAISS-only mock |
| I-004 | `POST /api/v1/assessment` | ❌ LLM crashes | `assessment/page.tsx` | Wrong Gemini model name (B-002) → always fails |
| I-005 | `GET /api/v1/assessment/quiz/{id}` | ✅ Works | `fetchQuiz()` in `api.ts` | Correct but sessionStorage data written by assessment page is unused |
| I-006 | `GET /api/v1/dashboard/employee` | ✅ Works | `fetchEmployeeDashboard()` | Works but uses profiles[0] fallback when no officialId |
| I-007 | `GET /api/v1/admin/dashboard` | ✅ Works (with empty DB caveat) | `fetchAdminDashboard()` | Division by zero on frontend if `total_officials=0` (B-006) |
| I-008 | `GET /api/v1/igot/courses` | ✅ Works | Not called by frontend! | Frontend has no page to browse available courses |
| I-009 | `GET /api/v1/igot/completion/{id}` | In-memory only | Not called | State lost on restart (B-013) |

---

## Summary Severity Count

| Severity | Backend | Frontend | Total |
|----------|---------|----------|-------|
| 🔴 Critical | 2 (B-001, B-002) | 3 (F-001, F-002, F-003) | **5** |
| 🟠 High | 7 | 6 | **13** |
| 🟡 Medium | 5 | 6 | **11** |
| **Total** | **14** | **15** | **29** |

---

*Generated by automated deep-code audit — SIH-build @ `/home/ramasass/SIH-build`*
