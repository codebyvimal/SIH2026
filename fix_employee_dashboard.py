import re

with open('frontend/app/dashboard/employee/page.tsx', 'r') as f:
    content = f.read()

# Fix 7: Deduplicate gaps by domain and fix undefined
# The code maps `dashboardData.gaps.map((gap: any, i: number) => (`
# We need to change this logic. Let's find where it maps the gaps.
# And fix `rec.course_name` or whatever it is to `rec.course`

# First let's check the rec mapping
content = content.replace("rec.title", "rec.course")
content = content.replace("rec.course_name", "rec.course")
content = content.replace("rec.name", "rec.course")

# For the gaps duplication, we can add a simple deduplication block right before the return statement, or inside the component.
# Let's add it right after `if (!dashboardData) return ...`
dedup_logic = """
  // Deduplicate gaps by domain
  let deduplicatedGaps = [];
  if (dashboardData && dashboardData.gaps) {
    const domainMap = new Map();
    dashboardData.gaps.forEach((gap: any) => {
      if (!domainMap.has(gap.domain)) {
        domainMap.set(gap.domain, { ...gap });
      }
    });
    deduplicatedGaps = Array.from(domainMap.values());
  }
"""

if "let deduplicatedGaps =" not in content:
    # Insert after loading state
    content = content.replace("if (!dashboardData) return (", dedup_logic + "\n  if (!dashboardData) return (")
    # Replace dashboardData.gaps.map with deduplicatedGaps.map
    # specifically for the Competency Profile section
    # Wait, the UI might be doing: {dashboardData.gaps.slice(0, 4).map(
    content = re.sub(r'dashboardData\.gaps(?:\.slice\([^)]+\))?\.map', 'deduplicatedGaps.map', content)

with open('frontend/app/dashboard/employee/page.tsx', 'w') as f:
    f.write(content)

print("Employee Dashboard fixes applied")
