const fs = require('fs');

function updatePage(file, navItemsStr, switchHref, switchLabel, variant="employee", otherReplaces = []) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace import
  if (!content.includes('import NavBar')) {
    const importMatch = content.match(/import .*?;/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + '\nimport NavBar from "@/components/NavBar";');
    }
  }

  const navStart = content.indexOf('<nav');
  const navEnd = content.indexOf('</nav>') + 6;

  if (navStart !== -1) {
    const navBarUsage = `<NavBar 
        variant="${variant}" 
        navItems={${navItemsStr}}
        ${switchHref ? `switchHref="${switchHref}"` : ''}
        ${switchLabel ? `switchLabel="${switchLabel}"` : ''}
      />`;

    content = content.substring(0, navStart) + navBarUsage + content.substring(navEnd);
  }

  otherReplaces.forEach(r => {
    content = content.replace(new RegExp(r.from, 'g'), r.to);
  });

  fs.writeFileSync(file, content);
}

// 1. Assessment Upload
updatePage('app/assessment/page.tsx', 
  `[
    { label: "My Dashboard", href: "/dashboard/employee" },
    { label: "Upload PDF", href: "/assessment", active: true }
  ]`,
  null, null, "employee",
  [
    { from: 'process.env.NEXT_PUBLIC_API_BASE \\?\\? "http://localhost:8000/api/v1"', to: 'process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1"' }, // Will be handled better later
  ]
);

// 2. Assessment Results
updatePage('app/assessment/results/[quiz_id]/page.tsx', 
  `[]`,
  null, null, "employee"
);

// 3. Recommendations
updatePage('app/recommendations/page.tsx', 
  `[
    { label: "\u2190 Back to Dashboard", href: \`/dashboard/employee?official_id=\${data.payload.official_id}\` }
  ]`,
  null, null, "employee"
);

