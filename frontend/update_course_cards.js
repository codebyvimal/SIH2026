const fs = require('fs');

let content = fs.readFileSync('components/dashboard/CourseCards.tsx', 'utf8');

// The CourseCover SVG component
const svgComponent = `
const CourseCoverSVG = ({ seed }: { seed: number }) => {
  const colors = [
    ['#38bdf8', '#0284c7'],
    ['#34d399', '#059669'],
    ['#fbbf24', '#d97706'],
    ['#a78bfa', '#7c3aed'],
    ['#f472b6', '#db2777'],
  ];
  const [color1, color2] = colors[seed % colors.length];
  
  return (
    <svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" className="h-full w-full rounded-xl object-cover">
      <defs>
        <linearGradient id={\`grad-\${seed}\`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <pattern id={\`pattern-\${seed}\`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="#ffffff" fillOpacity="0.1" />
        </pattern>
      </defs>
      <rect width="500" height="350" fill={\`url(#grad-\${seed})\`} />
      <rect width="500" height="350" fill={\`url(#pattern-\${seed})\`} />
      
      {/* Abstract decorative elements */}
      <circle cx="250" cy="175" r="80" fill="#ffffff" fillOpacity="0.1" />
      <rect x="210" y="135" width="80" height="80" rx="10" fill="#ffffff" fillOpacity="0.2" />
      <polygon points="250,110 300,210 200,210" fill="#ffffff" fillOpacity="0.1" />
    </svg>
  );
};
`;

// Remove the COURSE_IMAGES array
content = content.replace(/\/\/ High-quality contextual images mapping\nconst COURSE_IMAGES = \[\n(?:.*\n){4}\];/, svgComponent);

// Replace the <img ... /> with <CourseCoverSVG seed={i} />
content = content.replace(
  /<img\s+src=\{imageSrc\}\s+alt=\{c\.course\}\s+className="h-full w-full rounded-xl object-cover"\s+\/>/,
  '<CourseCoverSVG seed={i} />'
);

// Remove the `const imageSrc = COURSE_IMAGES[...];`
content = content.replace(/const imageSrc = COURSE_IMAGES\[i % COURSE_IMAGES\.length\];\n\s+/, '');

// Make sure buttons with disabled style look actually disabled
// "visually styled as disabled/inactive rather than looking clickable"
content = content.replace(
  'className={`transition-colors ${isEnrolled ? \'text-blue-600\' : \'text-slate-400 hover:text-slate-700\'} ${isLoading ? \'opacity-50\' : \'\'}`}',
  'className={`transition-colors ${isEnrolled ? \'text-blue-600 cursor-default\' : \'text-slate-400 hover:text-slate-700\'} ${isLoading ? \'opacity-50 cursor-wait\' : \'\'} disabled:cursor-not-allowed`}'
);

fs.writeFileSync('components/dashboard/CourseCards.tsx', content);
