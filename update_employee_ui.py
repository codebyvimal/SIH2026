import re

with open('frontend/app/dashboard/employee/page.tsx', 'r') as f:
    content = f.read()

# Make sure recharts is imported
if 'from "recharts"' not in content:
    imports = """import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';\n"""
    content = content.replace("import { ArrowRight, CheckCircle, User } from 'lucide-react';", 
                              "import { ArrowRight, CheckCircle, User } from 'lucide-react';\n" + imports)

# We have `deduplicatedGaps`. Let's prepare data for the Radar Chart.
# Add radarData prep right after deduplicatedGaps
radar_data_prep = """
  const radarData = deduplicatedGaps.map((gap: any) => ({
    subject: domainLabels[gap.domain] || gap.domain,
    A: gap.current || 0,
    B: gap.required || 0,
    fullMark: 4,
  }));
"""
content = content.replace("const currentProfile =", radar_data_prep + "\n  const currentProfile =")


# Now update the Competency Profile Section.
# Find:
# <h2 className="text-lg font-bold text-[#102868] mb-6">Competency Profile</h2>
# <div className="space-y-6 mb-6">
# {deduplicatedGaps.map(...
# Replace with a grid containing the Radar Chart and the bars.

radar_ui = """
          <div className="flex flex-col lg:flex-row gap-8 items-center mb-6">
            <div className="w-full lg:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Current Level" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
                  <Radar name="Target Level" dataKey="B" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Breakdown</h3>
"""

# Replace the heading and start of div
content = content.replace(
    '<h2 className="text-lg font-bold text-[#102868] mb-6">Competency Profile</h2>\n          <div className="space-y-6 mb-6">',
    '<h2 className="text-xl font-extrabold text-[#102868] mb-6 flex items-center gap-2"><svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> Competency Profile & Skill Gap Visual</h2>\n' + radar_ui
)

# I need to close the extra div after the bars.
# Find the end of deduplicatedGaps.map block
content = content.replace("</div>\n        </div>\n        <div className=\"space-y-4\">", "</div>\n          </div>\n        </div>\n        <div className=\"space-y-4\">")

with open('frontend/app/dashboard/employee/page.tsx', 'w') as f:
    f.write(content)
