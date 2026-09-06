# Agent Instructions — SIH 2026 National Learning Portal

## Project Location
\`\`\`
/home/ramasass/SIH-build/
├── frontend/          ← Next.js 14 App Router (port 3000)
├── backend/           ← FastAPI (port 8000)
├── docs/              ← Docs & specs
\`\`\`

## Branch
Always work on the **\`ramu\`** branch. Never commit to \`main\`.
\`\`\`bash
git checkout ramu
# after changes:
git add .
git commit -m "your message"
git push -f origin ramu
\`\`\`

## Dev Server
The Next.js dev server should be running on **port 3000**:
\`\`\`bash
pkill -f "next" || true
cd /home/ramasass/SIH-build/frontend
rm -rf .next && npm run dev
\`\`\`
The FastAPI backend runs on **port 8000**:
\`\`\`bash
cd /home/ramasass/SIH-build
.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

## Architecture Rules

### Frontend
- **Framework**: Next.js 14, App Router (\`frontend/app/\`)
- **Styling**: Tailwind CSS only
- **Images**: Use \`<Image>\` from \`next/image\`, NEVER raw \`<img>\` tags (causes build warnings)
- **Global Background**: Set in \`frontend/app/layout.tsx\` via \`style={{ backgroundImage: 'url(/bg-flag.png)' }}\`. Do NOT override in pages.
- **Page backgrounds**: All outer \`<div>\` wrappers must use \`bg-transparent\`. Never use \`bg-white\`, \`bg-slate-50\`, or \`bg-[#F4F6F9]\` on the outermost div.
- **Colors**:
  - Primary Navy: \`#102868\`
  - Accent Orange: \`orange-500\` / \`#E65100\`

### Dashboard Layout
- All \`/dashboard/*\` pages use shared layout at \`frontend/app/dashboard/layout.tsx\`
- That renders \`DashboardLayout\` from \`frontend/components/dashboard/DashboardLayout.tsx\`
- DashboardLayout has fixed navy header + collapsible sidebar
- Individual \`page.tsx\` files return ONLY their content — no NavBar, no sidebar

### NavBar
- Used on public pages only (landing, courses, resources, about, assessment, onboarding, recommendations)
- Located at \`frontend/components/NavBar.tsx\`

### API
- Frontend → Backend: \`http://localhost:8000/api/v1\` (client components)
- SSR Server Components: \`http://127.0.0.1:8000/api/v1\`

## Key Files
| File | Purpose |
|------|---------|
| \`frontend/app/layout.tsx\` | Root layout with flag background |
| \`frontend/app/page.tsx\` | Landing page |
| \`frontend/components/NavBar.tsx\` | Top nav for public pages |
| \`frontend/components/dashboard/DashboardLayout.tsx\` | Dashboard shell |
| \`frontend/app/dashboard/layout.tsx\` | Applies DashboardLayout to /dashboard/* |
| \`frontend/public/bg-flag.png\` | Indian flag watermark background |
| \`frontend/public/hero-building.png\` | Parliament building hero image |

## After Any Change
1. \`cd frontend && npm run lint\` — must pass with 0 errors
2. \`npm run build\` — must compile successfully
3. If stale cache errors: \`rm -rf .next\` then restart dev server
