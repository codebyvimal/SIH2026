const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace header with NavBar
const headerStart = content.indexOf('<header');
const headerEnd = content.indexOf('</header>') + 9;

if (headerStart !== -1) {
  content = content.substring(0, headerStart) + '<NavBar variant="minimal" />' + content.substring(headerEnd);
}

// Add import
if (!content.includes('import NavBar')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport NavBar from '@/components/NavBar';");
}

fs.writeFileSync('app/page.tsx', content);
