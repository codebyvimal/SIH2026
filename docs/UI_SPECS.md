# SIH UI Rewrite Specifications

We need to make our pages 99.99% accurate to the provided design screenshots. Use Tailwind CSS perfectly.
Do NOT include `NavBar` or `Sidebar` in the dashboard pages, because `app/dashboard/layout.tsx` now handles the Header and Sidebar! Just build the main content area for the dashboards.

## Screenshot 1: Landing Page (`frontend/app/page.tsx`) & Global Nav (`frontend/components/NavBar.tsx`)
**NavBar.tsx**:
- Top header: Dark blue `#102868`. Bottom border: 2px solid Saffron.
- Left side: Govt of India Emblem (placeholder SVG) + "Government of India / Ministry of Statistics & Programme Implementation" + Divider + "National Learning Portal".
- Right side: Links (Home, Courses, Resources, About), a circular Search Icon button, "A+ A A-", Accessibility icon, and an outlined "Login" dropdown button.

**app/page.tsx**:
- Light blue-gray background with faint watermark patterns (like the Ashoka Chakra we have).
- Hero split: Left has saffron text "— LEARN | BUILD | GROW". Huge heading "Strengthening Statistical Capacity Through Continuous Learning" in dark blue. Gray subtitle.
- Below subtitle: 3 inline items with icons ("Better Data/Better Decisions", "Skilled Workforce/Stronger India", "Evidence-Based/Development").
- Right side of Hero: A beautifully rounded image/placeholder of a Parliament building with a light blue overlay box inside saying "Building a statistical future for a stronger India" with a saffron underline.
- Lower section: "— Access Your Learning Portal". Two large white cards. Left border of cards is a thick Saffron line (e.g. `border-l-[6px] border-orange-500`).
- Inside cards: Icon, Title ("Officer Learning Dashboard", "Administrator Dashboard"), Text, and a solid blue "Continue as X ->" button.
- Footer section: Digital India logo on the right.

## Screenshot 2: Admin Dashboard (`frontend/app/dashboard/admin/page.tsx`)
**NOTE: Do NOT render Header/Sidebar. Just the main content!**
- Page Header: "Training & Competency Overview" (dark blue) + Subtitle.
- 4 Top KPI Cards (white, rounded, shadow-sm):
  1. Total Officials (Icon, "35", "Registered officials").
  2. Domains Tracked (Icon, "4", "Competency areas").
  3. Average Competency Gap (Icon, "0.8 / 4.0", "Across all officials").
  4. Training Priorities (Icon, "5", "Recommended courses").
- Middle Row (Two panels):
  - Left Panel: "Average Gap by Competency Domain". Shows horizontal progress bars for Statistical Methods, Data Management, Domain Knowledge, Digital Tools. The bar is partially filled (use orange for gaps > 1.5, blue otherwise). Score on the right (e.g., "1.8 / 4.0").
  - Right Panel: "Officials Requiring Training". Progress bars showing "17 of 35 officials" and a percentage pill (e.g., "49%" in an orange pill).
- Bottom Row:
  - Left: "Top Recommended Courses". A clean data table with columns: Course, Competency Domain, Officials Recommended, Average Relevance (badge), Enrollments.
  - Right: "Priority Insight". A card with a yellow/orange left border and light orange background. Lightbulb icon. Text explaining the biggest gap. Button at the bottom "View Detailed Competency Report ->".

## Screenshot 3: Officer Dashboard (`frontend/app/dashboard/employee/page.tsx`)
**NOTE: Do NOT render Header/Sidebar. Just the main content!**
- Page Header: "Officer Learning Dashboard" + Subtitle.
- Top Profile Card: Flex container. Left: User Avatar, "Officer 425CC697", Role, Dept. Middle: Education (M.Sc.), Experience (1 Year). Right side of the card has a light blue area "Your Learning Journey: Build the right skills..." with an arrow icon.
- Middle Row:
  - Left Panel: "Competency Profile". Shows horizontal bars for current proficiency. Columns: Domain name, Progress bar, Current Score ("3.2 / 4.0"), Target ("3.5 / 4.0"), Status Pill (e.g., "Developing" in orange, "On Target" in green, "Needs Focus" in red).
  - Bottom of Left Panel: Highlight box "Highest Priority Gap: Digital Tools" with the gap score "1.1 / 4.0".
  - Right Column: "Quick Links". A vertical stack of white cards with a right arrow. (My Competencies, Recommended Learning, My Progress, Assessments).
- Bottom Row:
  - Left: "Personalized Learning Recommendations". Cards showing Course Name, Domain, Relevance badge, why it helps, duration, level, and a solid blue "View Course" button.
  - Right of Recommendations: "Why these recommendations?" checklist card.
  - Bottom Left: "Recent Assessment" card. Shows "80%" circular progress, "12 / 15", "Strong" proficiency badge, and "View Assessment" button.

Write beautiful Tailwind code that matches these descriptions structurally and aesthetically.
