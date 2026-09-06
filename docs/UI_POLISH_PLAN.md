# 10-Minute UI Polish & Bug Fix Plan (Gov Standard)

**CRITICAL RULE FOR ALL AGENTS**: 
DO NOT rewrite page headings, paragraphs, or add new sections. 
ONLY modify Tailwind `className` attributes to apply colors, spacing, borders, shadows, and typography.

**Design System Tokens to Use**:
- Font: `font-montserrat`
- Primary Brand: `bg-gov-blue` (for headers, primary buttons)
- Accents: `text-saffron` or `bg-saffron` (for highlights, secondary CTAs)
- Backgrounds: `bg-slate-50` or `bg-gov-bg` (for app backgrounds instead of dark navy)
- Cards: `bg-white rounded-xl border border-slate-200 shadow-sm`

## Agent 1 Tasks (Global, Nav, Dashboards)
1. **Landing Page (`app/page.tsx`)**: The original 2-card structure was restored. Update the background to a professional light theme (or keep it dark but use `gov-blue` gradients), and polish the Officer/Admin cards with nice hover effects and proper icons.
2. **NavBar (`components/NavBar.tsx`)**: Make it a solid `bg-gov-blue` header. Ensure the text is white and clean. Ensure the mobile menu uses the same professional blue.
3. **Employee & Admin Dashboards (`app/dashboard/...`)**: Update the background from `bg-slate-50` to `bg-gov-bg`. Polish all metric cards, charts, and tables to have a uniform white background, subtle border, and shadow.

## Agent 2 Tasks (Onboarding, Quiz, Results, Recommendations)
1. **Onboarding (`app/onboarding/page.tsx`)**: Ensure the autocomplete inputs have a clean, professional focus state (`focus:ring-gov-blue`). Make the form container a clean white card on a light background.
2. **Assessment (`app/assessment/...`)**: Polish the drag-and-drop zone. Polish `QuizClient.tsx` so the questions and options look like a formal government exam (clear borders, blue highlight on select, accessible contrast).
3. **Results & Course Cards (`app/recommendations/...` & `CourseCards.tsx`)**: Polish the circular grade badge. Ensure course tiles look like iGOT catalog items (clean borders, clear duration/rating badges, proper button styles).
