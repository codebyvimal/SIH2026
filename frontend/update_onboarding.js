const fs = require('fs');

let content = fs.readFileSync('app/onboarding/page.tsx', 'utf8');

// 1. Add state variable
content = content.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n  const [isPersonalizing, setIsPersonalizing] = useState(false);'
);

// 2. Update router.push to use timeout and state
const oldPushLogic = `      if (data.official_id) {
        router.push(\`/dashboard/employee?official_id=\${data.official_id}\`);
      } else {`;
      
const newPushLogic = `      if (data.official_id) {
        setIsPersonalizing(true);
        setTimeout(() => {
          router.push(\`/dashboard/employee?official_id=\${data.official_id}\`);
        }, 2500);
      } else {`;
      
content = content.replace(oldPushLogic, newPushLogic);

// 3. Add conditional render at the start of the return statement
const loadingUI = `  if (isPersonalizing) {
    return (
      <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center font-sans text-slate-200">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-slate-800/50 ring-4 ring-saffron/30">
            <svg className="animate-spin h-10 w-10 text-saffron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight animate-pulse text-white">Personalising your recommendations...</h2>
          <p className="text-slate-400 text-sm max-w-sm text-center">
            Running competency gap analysis against the MoSPI framework and performing semantic search for optimal courses...
          </p>
        </div>
      </div>
    );
  }

  return (`;

content = content.replace('  return (', loadingUI);

fs.writeFileSync('app/onboarding/page.tsx', content);
