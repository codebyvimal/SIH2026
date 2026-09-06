# Bug Fixes Required — SIH 2026 National Learning Portal

**Read INSTRUCTIONS.md first before starting any of these fixes.**
**Branch: `ramu` only. Never touch `main`.**

---

## FIX 1 — Build Error: Missing Page Modules (CRITICAL)
**Error**: `PageNotFoundError: Cannot find module for page: /courses`
**Root Cause**: Stale `.next` cache from running `npm run build` while dev server was live.
**Fix**:
```bash
cd /home/ramasass/SIH-build/frontend
rm -rf .next
npm run build
```
This should now succeed since the page files exist. If it still fails, check each new page file exports a valid `default` function.

---

## FIX 2 — `<img>` Tag Warning in `app/page.tsx` (IMPORTANT)
**Error**: `Warning: Using <img> could result in slower LCP...`
**File**: `frontend/app/page.tsx` around line 67
**Fix**: Replace the raw `<img>` tag with Next.js `<Image>` component:
```tsx
// ADD this import at top of file:
import Image from 'next/image';

// REPLACE this:
<img src="/hero-building.png" alt="Parliament Building" className="w-full h-full object-cover absolute inset-0" />

// WITH this:
<Image
  src="/hero-building.png"
  alt="Parliament Building"
  fill
  className="object-cover"
  priority
/>
```
Note: The parent div must have `position: relative` (use `relative` class) for `fill` to work.

---

## FIX 3 — NavBar Links Still Point to `/` (HOME)
**Problem**: Clicking Courses, Resources, About in the top NavBar all go to `/` (homepage).
**File**: `frontend/components/NavBar.tsx`
**Fix**: Ensure these links use correct hrefs:
```tsx
<Link href="/" className="hover:text-orange-400 transition">Home</Link>
<Link href="/courses" className="hover:text-orange-400 transition">Courses</Link>
<Link href="/resources" className="hover:text-orange-400 transition">Resources</Link>
<Link href="/about" className="hover:text-orange-400 transition">About</Link>
```
**Verify** by checking current file: `grep "href" frontend/components/NavBar.tsx`

---

## FIX 4 — Employee Dashboard Sidebar Links 404
**Problem**: Clicking sidebar links in Employee Dashboard (My Competencies, Recommended Learning, Assessments, My Progress, Profile) shows `404 - This page could not be found`.
**Root Cause**: The page files exist but may be missing or empty.
**Check each of these paths exists with a valid `page.tsx`**:
```
frontend/app/dashboard/employee/competencies/page.tsx
frontend/app/dashboard/employee/learning/page.tsx     (should redirect to /recommendations)
frontend/app/dashboard/employee/assessments/page.tsx
frontend/app/dashboard/employee/progress/page.tsx
frontend/app/dashboard/employee/profile/page.tsx
```
**Template for placeholder pages** (copy-paste for each missing one):
```tsx
export default function PageName() {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Title</h1>
      <p className="text-gray-600 font-medium max-w-lg">This section is coming soon.</p>
    </div>
  );
}
```
**For `learning/page.tsx`** (redirect to recommendations):
```tsx
import { redirect } from 'next/navigation';
export default function RedirectToRecommendations() {
  redirect('/recommendations');
}
```

---

## FIX 5 — Admin Dashboard Sidebar Links 404
**Same problem as FIX 4, but for admin.**
**Check each of these paths exists with a valid `page.tsx`**:
```
frontend/app/dashboard/admin/gaps/page.tsx
frontend/app/dashboard/admin/courses/page.tsx
frontend/app/dashboard/admin/assessments/page.tsx
frontend/app/dashboard/admin/reports/page.tsx
```
Use same template from FIX 4.

---

## FIX 6 — Landing Page Placeholder Pages Missing
**Same issue for top-nav links.**
**Check each exists with a valid `page.tsx`**:
```
frontend/app/courses/page.tsx
frontend/app/resources/page.tsx
frontend/app/about/page.tsx
```
These pages must include `NavBar` since they are public (outside the dashboard layout):
```tsx
import NavBar from '@/components/NavBar';
export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-md m-8 rounded-3xl border border-white shadow-xl">
        <h1 className="text-4xl font-bold text-[#102868] mb-4">Course Directory</h1>
        <p className="text-gray-700 font-medium max-w-lg">Coming soon.</p>
      </main>
    </div>
  );
}
```

---

## FIX 7 — Employee Dashboard: Competency cards show "Digital Tools" 3 times
**Problem**: The Competency Profile section shows the same domain ("Digital Tools") repeated multiple times instead of distinct competencies.
**File**: `frontend/app/dashboard/employee/page.tsx`
**Root Cause**: The backend returns multiple rows per domain (one per skill), but the UI maps each row as a separate domain bar. We need to deduplicate by domain.
**Fix**: Before mapping `dashboardData.gaps`, group by domain and average the scores:
```tsx
// Deduplicate gaps by domain (take first occurrence or average)
const domainMap = new Map<string, any>();
dashboardData.gaps.forEach((gap: any) => {
  if (!domainMap.has(gap.domain)) {
    domainMap.set(gap.domain, { ...gap });
  }
});
const deduplicatedGaps = Array.from(domainMap.values());

// Then map deduplicatedGaps instead of dashboardData.gaps
```

---

## FIX 8 — Recommendation Cards Show "undefined" for Course Name
**Problem**: In Employee Dashboard, the "Personalized Learning Recommendations" section shows course titles as `undefined`.
**File**: `frontend/app/dashboard/employee/page.tsx`
**Root Cause**: The backend sends `course_name` or `title` but the template uses wrong property name.
**Check the actual API response**:
```bash
curl -s "http://127.0.0.1:8000/api/v1/dashboard/employee/425cc697-75f4-4778-b51f-a401cbc0fbd9" | python3 -m json.tool | grep -A5 '"recommendations"'
```
Then fix the property access in `page.tsx` to use the correct field name from the response.

---

## VERIFICATION CHECKLIST
After all fixes, run through this checklist:

- [ ] `cd frontend && npm run build` passes with 0 errors
- [ ] `http://localhost:3000/` — Landing page loads with Parliament image (no gray box)
- [ ] Landing page: clicking **Courses / Resources / About** navigates correctly (not 404)
- [ ] Landing page: clicking **Login** goes to `/dashboard/employee`
- [ ] Landing page: clicking **Continue as Officer** goes to `/dashboard/employee`
- [ ] Landing page: clicking **Continue as Administrator** goes to `/dashboard/admin`
- [ ] `/dashboard/employee` — Loads correctly, no crash, shows real competency data
- [ ] Employee sidebar: all 6 links (Dashboard, My Competencies, Recommended Learning, Assessments, My Progress, Profile) navigate without 404
- [ ] `/dashboard/admin` — Loads correctly, shows KPI cards and gap bars
- [ ] Admin sidebar: all 6 links (Overview, Officials, Competency Gaps, Courses, Assessments, Reports) navigate without 404
- [ ] Sidebar 3-dot toggle opens and closes smoothly
- [ ] Background flag image (tricolor + Ashoka Chakra) is visible on all pages
- [ ] Header is consistent Navy Blue (`#102868`) on ALL pages (landing + dashboards)
- [ ] Push to `ramu` branch: `git push -f origin ramu`
