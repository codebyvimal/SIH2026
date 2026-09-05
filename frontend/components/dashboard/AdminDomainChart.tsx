'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DomainAggregate {
  domain: string;
  avg_gap: number;
  officials_below_target: number;
}

interface AdminDomainChartProps {
  aggregates: DomainAggregate[];
  domainLabels: Record<string, string>;
}


export default function AdminDomainChart({ aggregates, domainLabels }: AdminDomainChartProps) {
  const data = aggregates.map((d) => ({
    name: domainLabels[d.domain] ?? d.domain,
    avg_gap: d.avg_gap,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(value: number) => [`${value.toFixed(2)}`, 'Avg Gap']}
        />
        <Bar dataKey="avg_gap" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((entry, i) => {
            let color = '#22c55e'; // Green for < 1.0
            if (entry.avg_gap > 2.0) color = '#ef4444'; // Red for > 2.0
            else if (entry.avg_gap >= 1.0) color = '#eab308'; // Yellow for 1.0 - 2.0

            return (
              <Cell
                key={i}
                fill={color}
                fillOpacity={0.85}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
