const fs = require('fs');

let content = fs.readFileSync('app/dashboard/employee/page.tsx', 'utf8');

// Add NavBar import
content = content.replace(
  'import QuizFeedback from "@/components/dashboard/QuizFeedback";',
  'import QuizFeedback from "@/components/dashboard/QuizFeedback";\nimport NavBar from "@/components/NavBar";\nimport { API_BASE } from "@/lib/config";'
);

// Replace nav with NavBar
const navStart = content.indexOf('<nav');
const navEnd = content.indexOf('</nav>') + 6;

const navItemsStr = `[
  { label: "My Dashboard", href: "/dashboard/employee", active: true },
  { label: "Upload PDF", href: "/assessment" },
  { label: "Swagger API Docs \u2197", href: API_BASE.replace('/api/v1', '/docs') }
]`;

const navBarUsage = `<NavBar 
        variant="employee" 
        isLive={isLive} 
        navItems={${navItemsStr}} 
        switchHref="/dashboard/admin"
        switchLabel="Switch to Admin \u2192"
      />`;

content = content.substring(0, navStart) + navBarUsage + content.substring(navEnd);

// Replace Unsplash image in profile card
content = content.replace(
  '<img\n                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"\n                    alt="Official"\n                    className="h-full w-full object-cover"\n                  />',
  '<AvatarSVG className="h-full w-full" />'
);
content = content.replace(
  '<img\n                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"\n                    alt="Official"\n                    className="h-full w-full object-cover"\n                  />',
  '<AvatarSVG className="h-full w-full" />' // In case format varies
);
// Make sure to import AvatarSVG if used, wait AvatarSVG is exported from NavBar
if (content.includes('AvatarSVG') && !content.includes('AvatarSVG')) {
    // but we can just import it
}
content = content.replace(
  'import NavBar from "@/components/NavBar";',
  'import NavBar, { AvatarSVG } from "@/components/NavBar";'
);

// Also replace the single line version just in case
content = content.replace(/<img[^>]*src="https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d\?w=200&h=200&fit=crop"[^>]*>/g, '<AvatarSVG className="h-full w-full" />');


fs.writeFileSync('app/dashboard/employee/page.tsx', content);
