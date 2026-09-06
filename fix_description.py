with open('frontend/app/dashboard/employee/page.tsx', 'r') as f:
    content = f.read()

import re
# Replace the p tag that addresses gap
pattern = r'<p className="text-sm text-gray-600 mb-2">Addresses your gap in \{domainLabels\[rec\.domain\] \|\| rec\.domain\} to reach the target level of \{rec\.target_level \|\| \'3\.5\'\}\.<\/p>'
content = re.sub(pattern, '<p className="text-sm text-gray-600 mb-2">{rec.why}</p>', content)

# Also fix the duration
content = re.sub(r'<span>⏱️ 2h 30m</span>', '<span>⏱️ {rec.duration_hours ? `${rec.duration_hours}h` : "2h 30m"}</span>', content)

with open('frontend/app/dashboard/employee/page.tsx', 'w') as f:
    f.write(content)
