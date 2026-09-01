'use client';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend
} from 'recharts';
import type { SkillGap } from '@/types/schemas';

interface GapChartProps {
  gaps: SkillGap[];
}

export default function GapChart({ gaps }: GapChartProps) {
  // Map our 0-4 scale to 0-100 to match the reference image exactly
  const data = gaps.map((g) => ({
    skill: g.skill.length > 20 ? g.skill.slice(0, 18) + '...' : g.skill,
    current: g.current * 25,
    required: g.required * 25,
    fullSkill: g.skill,
  }));

  return (
    <div className="w-full h-[320px] flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid gridType="polygon" stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            tickCount={5} 
            axisLine={false} 
          />
          <Radar
            name="Current Skill"
            dataKey="current"
            stroke="#2563eb"
            strokeWidth={2}
            fill="none"
          />
          <Radar
            name="Required Skill"
            dataKey="required"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="plainline"
            formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
