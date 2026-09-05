const fs = require('fs');

function updateAdminPage(file, isOfficialsList = false) {
  let content = fs.readFileSync(file, 'utf8');

  // Add NavBar import
  const importTarget = isOfficialsList 
    ? "import OfficialsClient from './OfficialsClient';" 
    : "import AdminTopCourses from '@/components/dashboard/AdminTopCourses';";
  
  content = content.replace(
    importTarget,
    importTarget + '\nimport NavBar from "@/components/NavBar";\nimport { API_BASE } from "@/lib/config";'
  );

  // Replace nav with NavBar
  const navStart = content.indexOf('<nav');
  const navEnd = content.indexOf('</nav>') + 6;

  const navItemsStr = `[
    { label: "Admin Dashboard", href: "/dashboard/admin", active: ${!isOfficialsList} },
    { label: "Officials", href: "/dashboard/admin/officials", active: ${isOfficialsList} }
  ]`;

  const navBarUsage = `<NavBar 
        variant="admin" 
        navItems={${navItemsStr}} 
        switchHref="/dashboard/employee"
        switchLabel="\u2190 Switch to Employee"
      />`;

  if (navStart !== -1) {
    content = content.substring(0, navStart) + navBarUsage + content.substring(navEnd);
  }
  
  // Find any Unsplash or Wikipedia images remaining?
  // They are mostly in the nav, which we just replaced.

  fs.writeFileSync(file, content);
}

updateAdminPage('app/dashboard/admin/page.tsx', false);
updateAdminPage('app/dashboard/admin/officials/page.tsx', true);
