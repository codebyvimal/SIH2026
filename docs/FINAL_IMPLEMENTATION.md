# 🏛️ FINAL IMPLEMENTATION GUIDE — SIH 2026 National Learning Portal
## Complete UI Overhaul: Match iGOT Karmayogi + NSSTA Government Design Standard

**Reference Sites:**
- iGOT Karmayogi: https://igotkarmayogi.gov.in — Uses Montserrat font, primary blue #264092, saffron #FFA730, white cards with subtle shadows
- NSSTA: https://nssta.gov.in — India gov design: navy headers, Ashoka Chakra, formal structured layouts

**Project Root:** `/home/ramasass/SIH-build`

---

## DESIGN SYSTEM (Apply Globally First)

### Color Palette — Match iGOT + Indian Gov Standard
```
PRIMARY BLUE:     #264092   (iGOT brand blue — headers, buttons, active states)
SECONDARY BLUE:   #1A5276   (hover/darker variant)
ACCENT SAFFRON:   #FF6B00   (India saffron — CTAs, active links, highlights)
ACCENT GOLD:      #FFA730   (iGOT gold — badges, featured items)
SUCCESS:          #1A7A4A   (dark green — completion, enrolled)
WARNING:          #D4850A   (amber — gaps, pending)
DANGER:           #B02925   (deep red — errors, critical gaps)
LIGHT BG:         #F4F6F9   (iGOT page background)
WHITE CARD:       #FFFFFF   (card backgrounds)
TEXT PRIMARY:     #1A2332   (main text)
TEXT SECONDARY:   #4A5568   (sub-labels)
TEXT MUTED:       #718096   (placeholders, captions)
BORDER:           #E2E8F0   (card borders)
NAV BG:           #264092   (iGOT-style solid blue nav — NOT dark navy)
```

### Typography — Must Use Montserrat (iGOT's font)
In `frontend/app/layout.tsx`:
```tsx
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});
// Apply: <html lang="en" className={montserrat.variable}>
// In body: className={`${montserrat.variable} font-montserrat`}
```

In `tailwind.config.ts` add:
```ts
fontFamily: {
  montserrat: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
  sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
},
```

### Update Tailwind Color Tokens
In `tailwind.config.ts` replace/extend colors:
```ts
colors: {
  // Keep existing
  'deep-navy': '#1E293B',
  'saffron': '#FF6B00',
  // Add new iGOT palette
  'gov-blue': '#264092',
  'gov-blue-dark': '#1A5276',
  'gov-gold': '#FFA730',
  'gov-green': '#1A7A4A',
  'gov-red': '#B02925',
  'gov-bg': '#F4F6F9',
}
```

---

## AGENT 1 TASKS — Global Layout, Landing Page, NavBar, Dashboard Pages

### TASK-A1: Update `frontend/app/layout.tsx` — Font + Metadata
```tsx
import { Montserrat } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s | National Learning Portal', default: 'National Learning Portal' },
  description: 'AI-enabled competency gap analysis and personalized training for India\'s Official Statistical System — Ministry of Statistics & Programme Implementation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-montserrat bg-gov-bg text-gray-800 antialiased">{children}</body>
    </html>
  );
}
```

---

### TASK-A2: Completely Redesign `frontend/app/page.tsx` — iGOT-Style Landing

The landing page should look like iGOT Karmayogi's homepage. Key elements:
1. **Top gov bar** (light gray strip): "Government of India | Ministry of Statistics & Programme Implementation"
2. **Main nav** (solid `#264092` blue): Logo + "National Learning Portal" + nav links
3. **Hero section**: Large heading "Karmayogi Learning Platform", subtitle about MoSPI, two CTA cards
4. **Stats strip**: "34 Officials Enrolled | 4 Competency Domains | 120+ Courses Available"
5. **Features section**: 3 cards — Competency Gap Analysis, AI Recommendations, Assessment & Quizzes
6. **Footer**: India Gov footer with copyright

Full implementation:
```tsx
import Link from 'next/link';
import NavBar from '@/components/NavBar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-montserrat">
      {/* Government of India top bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-gray-600 font-medium">
            भारत सरकार | Government of India — Ministry of Statistics &amp; Programme Implementation
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gov-blue transition-colors">Skip to Content</a>
            <span>|</span>
            <a href="#" className="hover:text-gov-blue transition-colors">Screen Reader</a>
            <span>|</span>
            <span className="font-semibold text-gov-blue">A+ A A-</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-gov-blue shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            {/* Ashoka Chakra Emblem inline SVG */}
            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
              <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
                <circle cx="40" cy="40" r="36" stroke="#264092" strokeWidth="3.5"/>
                <circle cx="40" cy="40" r="28" stroke="#264092" strokeWidth="1.2"/>
                <circle cx="40" cy="40" r="20" stroke="#264092" strokeWidth="1"/>
                <circle cx="40" cy="40" r="6" fill="#264092"/>
                {Array.from({length: 24}).map((_, i) => {
                  const angle = (i * Math.PI) / 12;
                  return (
                    <line key={i}
                      x1={40 + 6 * Math.cos(angle)} y1={40 + 6 * Math.sin(angle)}
                      x2={40 + 28 * Math.cos(angle)} y2={40 + 28 * Math.sin(angle)}
                      stroke="#264092" strokeWidth="1.2"/>
                  );
                })}
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-wide leading-tight">
                National Learning Portal
              </h1>
              <p className="text-blue-200 text-xs font-medium tracking-wider uppercase">
                Karmayogi Bharat — MoSPI
              </p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/employee" className="text-white text-sm font-medium hover:text-gov-gold transition-colors">
              My Dashboard
            </Link>
            <Link href="/dashboard/admin" className="text-white text-sm font-medium hover:text-gov-gold transition-colors">
              Admin View
            </Link>
            <Link href="/onboarding"
              className="bg-saffron hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm">
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gov-blue via-[#1d3a8a] to-[#0f2355] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-gov-gold/20 text-gov-gold border border-gov-gold/40 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            Powered by iGOT Karmayogi Ecosystem
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Build Competency.<br/>
            <span className="text-gov-gold">Strengthen India's Statistics.</span>
          </h2>
          <p className="text-lg text-blue-200 font-medium max-w-2xl mx-auto mb-10">
            AI-driven learning platform that identifies skill gaps, delivers personalized training through iGOT, 
            and generates smart assessments for MoSPI officials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding"
              className="bg-saffron hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl transition-all hover:-translate-y-0.5">
              Get Started →
            </Link>
            <Link href="/dashboard/employee"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-gray-200 py-8 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '120+', label: 'iGOT Courses Available' },
            { value: '4', label: 'Competency Domains' },
            { value: 'AI', label: 'Powered Gap Analysis' },
            { value: '100%', label: 'Government Aligned' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-gov-blue">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gov-bg">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Platform Capabilities</h3>
          <p className="text-center text-gray-500 text-sm mb-10">Everything you need for structured capacity building</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊', title: 'Competency Gap Analysis',
                desc: 'Automated assessment against MoSPI competency framework across 4 domains: Statistical Methods, Data Management, Domain Knowledge & Digital Tools.'
              },
              {
                icon: '🎯', title: 'AI-Powered Recommendations',
                desc: 'Personalized course recommendations from iGOT Karmayogi catalogue using FAISS semantic search and Gemini AI, mapped to your specific skill gaps.'
              },
              {
                icon: '📝', title: 'Smart Quiz Generation',
                desc: 'Upload any training material PDF and instantly generate relevant MCQs using Google Gemini AI to assess comprehension and track learning progress.'
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">{f.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h3>
          <p className="text-gray-500 text-sm mb-10">Access the platform based on your position</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/dashboard/employee"
              className="group flex flex-col items-center p-10 bg-gov-bg hover:bg-blue-50 border-2 border-gray-200 hover:border-gov-blue rounded-2xl transition-all">
              <div className="w-16 h-16 bg-gov-blue/10 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">👤</div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">I'm an Officer</h4>
              <p className="text-sm text-gray-500">View my skill gaps, learning recommendations, and assessment results</p>
            </Link>
            <Link href="/dashboard/admin"
              className="group flex flex-col items-center p-10 bg-gov-bg hover:bg-orange-50 border-2 border-gray-200 hover:border-saffron rounded-2xl transition-all">
              <div className="w-16 h-16 bg-saffron/10 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">I'm an Administrator</h4>
              <p className="text-sm text-gray-500">Monitor organizational skill gaps, top courses, and training outcomes</p>
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            New officer? <Link href="/onboarding" className="text-gov-blue font-semibold hover:underline">Register your profile here →</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gov-blue text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">National Learning Portal</p>
              <p className="text-blue-200 text-xs mt-1">Ministry of Statistics &amp; Programme Implementation, Government of India</p>
            </div>
            <div className="text-xs text-blue-300 text-center md:text-right">
              <p>© 2026 Government of India. All rights reserved.</p>
              <p className="mt-1">Built for Smart India Hackathon 2026 | Powered by iGOT Karmayogi</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

### TASK-A3: Redesign `frontend/components/NavBar.tsx` — iGOT-Style Blue Header

Change the navbar background from `deep-navy (#1E293B)` to iGOT blue `#264092`.
Update all color references:
- Nav bg: `bg-gov-blue` instead of `bg-deep-navy`
- Active link: `text-gov-gold border-b-gov-gold` instead of `border-saffron`
- Switch button: `hover:bg-gov-gold/80`
- Badge: use proper iGOT blue shades

The overall nav feel should match iGOT: clean white text on solid blue, gold accents.

---

### TASK-A4: Redesign `frontend/app/dashboard/employee/page.tsx` — Professional Gov Cards

Apply iGOT card style to all sections:
- White cards with `rounded-2xl border border-gray-100 shadow-sm`
- Page background: `bg-gov-bg` (light gray `#F4F6F9`)
- Section headings: `text-gov-blue font-bold`
- Stats chips: `bg-blue-50 text-gov-blue rounded-lg px-3 py-1 text-sm font-semibold`
- Skill gap bars: colored by severity (green=low gap, amber=medium, red=high)
- Profile card: white card with gov-blue left border accent `border-l-4 border-gov-blue`

Remove the "Officer Profile in SQLite Database" text (already done by prev agent — verify it's gone).
Add breadcrumb nav: "Home > Dashboard > Employee View"

---

### TASK-A5: Redesign `frontend/app/dashboard/admin/page.tsx` — Admin Analytics

iGOT admin style:
- KPI cards: white cards with colored icon badge on the left
- Domain chart: styled with gov-blue bars
- Progress bars: use `bg-gov-red` for "Officials Below Target"
- Top courses list: numbered badges with `bg-gov-blue text-white`
- Add a summary "Action Required" section if any domain avg_gap > 1.0

---

### TASK-A6: Update `frontend/app/globals.css`

Add:
```css
/* iGOT-matching font */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

/* Gov website accessibility */
:focus-visible {
  outline: 3px solid #264092;
  outline-offset: 2px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar (iGOT style) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F4F6F9; }
::-webkit-scrollbar-thumb { background: #264092; border-radius: 3px; }

/* Move the @keyframes progress here */
@keyframes progress {
  0% { left: -50%; }
  100% { left: 100%; }
}

/* Ensure Montserrat is applied */
body {
  font-family: 'Montserrat', sans-serif;
}
```

---

## AGENT 2 TASKS — Onboarding Form, Assessment, Quiz, Recommendations, Data

### TASK-B1: Completely Redesign `frontend/app/onboarding/page.tsx`

#### Autocomplete Data (Add at top of file):
```tsx
const MOSPI_DEPARTMENTS = [
  "Ministry of Statistics & Programme Implementation (MoSPI)",
  "Central Statistics Office (CSO)",
  "National Statistical Office (NSO)",
  "National Sample Survey Office (NSSO)",
  "National Statistical Systems Training Academy (NSSTA)",
  "Computer Centre, MoSPI",
  "Economic Advisory Council",
  "Planning & Coordination Division",
  "Data Management & Dissemination Division",
  "Social Statistics Division",
  "Economic Statistics Division",
  "Technical Coordination Division",
  "State Directorate of Economics & Statistics",
  "District Statistics Office",
  "Registrar General of India",
  "Office of the Comptroller & Auditor General",
  "NITI Aayog",
  "Reserve Bank of India",
  "National Informatics Centre (NIC)",
  "Indian Statistical Institute (ISI)",
];

const EDUCATION_OPTIONS = [
  "B.Sc. Statistics",
  "B.Sc. Mathematics",
  "B.Sc. Economics",
  "B.Sc. Computer Science",
  "B.E. / B.Tech. Computer Science",
  "B.E. / B.Tech. Information Technology",
  "B.A. Economics",
  "M.Sc. Statistics",
  "M.Sc. Mathematics",
  "M.Sc. Data Science",
  "M.Sc. Applied Statistics",
  "M.A. Economics",
  "M.Tech. Computer Science",
  "MBA (Finance / Analytics)",
  "M.Phil. Statistics",
  "Ph.D. Statistics",
  "Ph.D. Economics",
  "Ph.D. Mathematics",
  "Post Graduate Diploma in Statistics",
  "Post Graduate Diploma in Data Science",
  "IAS / IFS (with Statistics background)",
  "Indian Statistical Service (ISS)",
];

const PAST_TRAINING_OPTIONS = [
  "Statistical Data Analysis using R",
  "Statistical Data Analysis using Python",
  "Data Science with Machine Learning",
  "Excel for Data Analysis",
  "Power BI / Tableau for Visualization",
  "SQL & Database Management",
  "Big Data Technologies (Hadoop, Spark)",
  "Survey Methodology & Sampling Techniques",
  "Time Series Analysis & Forecasting",
  "National Accounts Statistics",
  "Economic Census Methodology",
  "GIS & Geospatial Data Analysis",
  "Data Governance & Data Quality",
  "Statistical Report Writing",
  "SDG Monitoring Framework",
  "Foundation Course on Statistics (NSSTA)",
  "Advanced Statistical Methods (NSSTA)",
  "iGOT Digital Leadership Programme",
  "Karmayogi Mission Orientation",
  "Office Automation & e-Governance",
  "Cybersecurity Awareness Training",
  "Right to Information (RTI) Act",
  "Government Financial Management",
];
```

#### UI Design (iGOT-style onboarding):
- Background: `bg-gov-bg` (light gray — NOT dark navy)
- Header: White with gov-blue logo + text (match main page header style)
- Card: White card, `rounded-2xl shadow-lg border border-gray-100` max-w-2xl centered
- Multi-step indicator at top: Step 1 "Basic Info" → Step 2 "Experience & Education" → Step 3 "Past Trainings" → Step 4 "Review"
- Each field: Label above, full-width input with gov-blue focus ring
- All autocomplete fields use React-managed custom dropdown OR native `<datalist>` with all options

**Department field — live filtering dropdown:**
```tsx
// State for dept dropdown
const [deptQuery, setDeptQuery] = useState('');
const [showDeptDropdown, setShowDeptDropdown] = useState(false);

const filteredDepts = MOSPI_DEPARTMENTS.filter(d =>
  d.toLowerCase().includes(deptQuery.toLowerCase())
).slice(0, 6);

// JSX
<div className="relative">
  <input
    type="text"
    id="dept"
    name="dept"
    value={formData.dept}
    onChange={(e) => {
      setDeptQuery(e.target.value);
      setFormData(prev => ({...prev, dept: e.target.value}));
      setShowDeptDropdown(true);
    }}
    onFocus={() => setShowDeptDropdown(true)}
    onBlur={() => setTimeout(() => setShowDeptDropdown(false), 200)}
    placeholder="e.g. MoSPI, NSO, NSSTA..."
    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gov-blue/40 focus:border-gov-blue bg-white text-sm"
    required
    autoComplete="off"
  />
  {showDeptDropdown && filteredDepts.length > 0 && (
    <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-52 overflow-y-auto">
      {filteredDepts.map(dept => (
        <li
          key={dept}
          className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-gov-blue cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
          onMouseDown={() => {
            setFormData(prev => ({...prev, dept}));
            setDeptQuery(dept);
            setShowDeptDropdown(false);
          }}
        >
          {dept}
        </li>
      ))}
    </ul>
  )}
</div>
```

Apply **same pattern** for Education field (using EDUCATION_OPTIONS).

**Past Trainings — autocomplete for each training input:**
Each training text input gets a datalist OR same dropdown pattern using PAST_TRAINING_OPTIONS.

**Form Layout (iGOT card style):**
```tsx
// Header section of card
<div className="bg-gov-blue rounded-t-2xl p-6 text-white text-center">
  <h1 className="text-2xl font-bold">Officer Registration</h1>
  <p className="text-blue-200 text-sm mt-1">Create your Karmayogi profile to get personalized learning recommendations</p>
  {/* Step indicator */}
  <div className="flex items-center justify-center gap-2 mt-4">
    <span className="w-8 h-8 rounded-full bg-white text-gov-blue text-sm font-bold flex items-center justify-center">1</span>
    <div className="w-12 h-0.5 bg-blue-400"></div>
    <span className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">2</span>
    <div className="w-12 h-0.5 bg-blue-400"></div>
    <span className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">3</span>
  </div>
</div>
// Body: white form area
<div className="p-8 space-y-6 bg-white rounded-b-2xl">
  {/* form fields */}
</div>
```

**Submit button:**
```tsx
<button type="submit" className="w-full bg-gov-blue hover:bg-gov-blue-dark text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base">
  Create Profile & Start Learning →
</button>
```

---

### TASK-B2: Redesign `frontend/app/assessment/page.tsx` — iGOT Upload Style

- White card on `bg-gov-bg` background
- Title section with `bg-gov-blue` banner at top of card
- Upload zone: white with `border-2 border-dashed border-gov-blue/30` when idle, `border-gov-blue` when drag-over
- Button: `bg-gov-blue hover:bg-gov-blue-dark text-white`
- Progress bar color: `bg-gov-blue`
- Loading text reference iGOT branding: "Generating quiz questions using AI..."

---

### TASK-B3: Redesign `frontend/app/assessment/quiz/[quiz_id]/QuizClient.tsx`

- Background: white + `bg-gov-bg` instead of dark `bg-deep-navy`
- Header: `bg-gov-blue text-white` banner with quiz title
- Question card: clean white card with shadow
- Option buttons: white with `border-2 border-gray-200` idle, `border-gov-blue bg-blue-50` when selected
- Option letter badge: `bg-gov-blue text-white` when selected, `bg-gray-100 text-gray-500` idle
- Progress bar: `bg-gov-blue`
- Navigation buttons: `bg-gov-blue text-white` for Next, outlined for Previous
- Submit button: `bg-gov-green text-white` (success green)

---

### TASK-B4: Redesign `frontend/app/assessment/results/[quiz_id]/page.tsx`

- Background: `bg-gov-bg`
- Score badge: large circular badge with appropriate color (A=gov-blue, B=green, C=amber, D=orange, F=red)
- Feedback cards: alternating white cards for each question, `border-l-4 border-gov-green` for correct, `border-l-4 border-gov-red` for incorrect
- CTA buttons: iGOT blue style

---

### TASK-B5: Redesign `frontend/app/recommendations/page.tsx` + `RecommendationsClient.tsx`

- Page background: `bg-gov-bg`
- Filter chips: `bg-gov-blue text-white` for active, white with blue border for inactive
- Course section headings: `text-gov-blue` with bottom border
- Domain sections: white cards with rounded-2xl shadow-sm
- Course cards within: clean list items with gov-blue accent borders

---

### TASK-B6: Redesign `frontend/components/dashboard/CourseCards.tsx`

Each course card should look like an iGOT course tile:
- White card, `rounded-xl border border-gray-100 shadow-sm hover:shadow-md`
- Left accent: `border-l-4 border-gov-blue`
- Course title: `text-gray-800 font-bold text-base`
- Duration badge: `bg-blue-50 text-gov-blue text-xs font-semibold px-2 py-1 rounded`
- Relevance score: small pill `bg-green-50 text-gov-green`
- Enroll button: `bg-gov-blue hover:bg-gov-blue-dark text-white` when not enrolled
- Enrolled state: `bg-gov-green text-white` with checkmark

---

### TASK-B7: Redesign `frontend/components/dashboard/QuizFeedback.tsx`

- Correct answer row: `bg-green-50 border border-green-200 rounded-xl p-4 mb-3`
  - Left icon: green checkmark circle
- Wrong answer row: `bg-red-50 border border-red-200 rounded-xl p-4 mb-3`
  - Left icon: red X circle
- Explanation box: `bg-blue-50 border-l-4 border-gov-blue rounded-r-xl p-3 mt-2 text-sm text-blue-800`
- Question text: `text-gray-800 font-semibold`

---

### TASK-B8: Update `frontend/tailwind.config.ts` — Complete

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        'deep-navy': '#1E293B',
        'saffron': '#FF6B00',
        'gov-blue': '#264092',
        'gov-blue-dark': '#1A5276',
        'gov-gold': '#FFA730',
        'gov-green': '#1A7A4A',
        'gov-red': '#B02925',
        'gov-bg': '#F4F6F9',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-down': 'slideDown 0.2s ease-out both',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'gov': '0 2px 8px rgba(38, 64, 146, 0.12)',
        'gov-lg': '0 8px 24px rgba(38, 64, 146, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## ✅ FINAL DEFINITION OF DONE

After all tasks complete, verify:
- [ ] Landing page looks professional — government blue header, Hindi text strip, stats row, feature cards, proper footer
- [ ] Montserrat font loads and is applied throughout
- [ ] All pages use `bg-gov-bg` (light gray) or `bg-white` — NO dark backgrounds except navbar and hero
- [ ] NavBar is iGOT blue (`#264092`) not dark navy
- [ ] Onboarding form: typing "mos" in Dept shows dropdown with "MoSPI" suggestions
- [ ] Onboarding form: typing "m.sc" in Education shows matching suggestions
- [ ] Onboarding form: Past training inputs show autocomplete from PAST_TRAINING_OPTIONS
- [ ] Quiz page is light (white/gov-bg) not dark
- [ ] Results page shows letter grade badge (A/B/C/D/F) with color coding
- [ ] Course cards have left accent border in gov-blue
- [ ] Footer on landing page shows "Government of India" attribution
- [ ] Mobile navbar hamburger works correctly

## KEY FILES TO MODIFY
```
frontend/
├── app/
│   ├── layout.tsx              # TASK-A1: Montserrat font + metadata
│   ├── globals.css             # TASK-A6: CSS variables + keyframes + scrollbar
│   ├── page.tsx                # TASK-A2: Full landing page redesign
│   ├── onboarding/page.tsx     # TASK-B1: Full redesign + autocomplete data
│   ├── assessment/page.tsx     # TASK-B2: iGOT upload style
│   ├── assessment/quiz/[quiz_id]/QuizClient.tsx  # TASK-B3: Light theme
│   ├── assessment/results/[quiz_id]/page.tsx     # TASK-B4: Grade badge
│   ├── dashboard/employee/page.tsx               # TASK-A4: Gov card style
│   ├── dashboard/admin/page.tsx                  # TASK-A5: Admin analytics
│   └── recommendations/page.tsx                  # TASK-B5: Redesign
├── components/
│   ├── NavBar.tsx              # TASK-A3: iGOT blue header
│   ├── dashboard/CourseCards.tsx   # TASK-B6: iGOT course tiles
│   └── dashboard/QuizFeedback.tsx  # TASK-B7: Feedback cards
└── tailwind.config.ts          # TASK-B8: Complete config update
```
