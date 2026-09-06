with open('frontend/app/dashboard/employee/page.tsx', 'r') as f:
    content = f.read()

dedup_code = """
  let deduplicatedGaps: any[] = [];
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

content = content.replace("const currentProfile = officialsList", dedup_code + "\n  const currentProfile = officialsList")

with open('frontend/app/dashboard/employee/page.tsx', 'w') as f:
    f.write(content)
