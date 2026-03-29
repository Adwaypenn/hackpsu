'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import profDistribution from '@/canvas-info/profDistribution';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfGradeChart() {
  const { isDark } = useTheme();

  const axisColor = isDark ? '#6b7280' : '#9ca3af';
  const gridColor = isDark ? '#27272a' : '#f3f4f6';
  const tipBg     = isDark ? '#18181b' : '#fff';
  const tipBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const tipText   = isDark ? '#f4f4f5' : '#111';

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={profDistribution}
        margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
        barCategoryGap="30%"
        barGap={3}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="grade"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 8, color: tipText, fontSize: 12 }}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
          formatter={(v) => [`${v}%`]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 8 }}
          formatter={(v) => v === 'smith' ? 'Prof. Smith (CMPSC)' : v === 'lee' ? 'Prof. Lee (MATH)' : 'Prof. Davis (ENGL)'}
        />
        <Bar dataKey="smith" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="lee"   fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="davis" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
