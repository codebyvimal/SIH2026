const fs = require('fs');

function replaceApiBase(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add import if not present
  if (!content.includes('import { API_BASE }')) {
    if (content.includes('import { fetchEmployeeDashboard }')) {
       content = content.replace('import { fetchEmployeeDashboard }', 'import { fetchEmployeeDashboard, API_BASE }');
    } else {
       const importMatch = content.match(/import .*?;\n/);
       if (importMatch) {
         content = content.replace(importMatch[0], importMatch[0] + 'import { API_BASE } from "@/lib/config";\n');
       }
    }
  }

  // Remove local declaration
  content = content.replace(/const API_BASE\s*=\s*process\.env\.NEXT_PUBLIC_API_BASE \?\? ["']http:\/\/localhost:8000\/api\/v1["'];/g, '');
  content = content.replace(/const API_BASE\s*=\s*process\.env\.NEXT_PUBLIC_API_BASE \?\? ["']\/api\/v1["'];/g, '');
  content = content.replace(/const apiBase\s*=\s*process\.env\.NEXT_PUBLIC_API_BASE \?\? ["']http:\/\/localhost:8000\/api\/v1["'];/g, '');
  
  // Replace apiBase with API_BASE in QuizClient
  content = content.replace(/\$\{apiBase\}/g, '${API_BASE}');

  fs.writeFileSync(file, content);
}

replaceApiBase('app/assessment/page.tsx');
replaceApiBase('app/assessment/quiz/[quiz_id]/QuizClient.tsx');
replaceApiBase('app/recommendations/page.tsx');
replaceApiBase('app/onboarding/page.tsx');
replaceApiBase('components/dashboard/CourseCards.tsx');
