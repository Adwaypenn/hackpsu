'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LabelList, ResponsiveContainer,
} from 'recharts';
import courses from '@/canvas-info/courses';
import { useTheme } from '@/contexts/ThemeContext';

const roiData = [
  { course: 'ENGL 202', roi: 4.7, hours: 4  },
  { course: 'CMPSC 473', roi: 4.2, hours: 8 },
  { course: 'MATH 251', roi: 3.3, hours: 10 },
];

const maxROI = Math.max(...roiData.map(d => d.roi));

const COLORS = ['#22c55e', '#6366f1', '#f59e0b'];

export default function ROIBarChart() {
  const { isDark } = useTheme();

  const axisColor = isDark ? '#6b7280' : '#9ca3af';
  const gridColor = isDark ? '#27272a' : '#f3f4f6';
  const tipBg     = isDark ? '#18181b' : '#fff';
  const tipBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const tipText   = isDark ? '#f4f4f5' : '#111';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={roiData}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 6]}
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          dataKey="course"
          type="category"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 8, color: tipText, fontSize: 12 }}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
          formatter={(v, _, entry) => [`${v} (${(entry as { payload: { hours: number } }).payload.hours}h/wk)`, 'ROI Score']}
        />
        <Bar dataKey="roi" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {roiData.map((entry, i) => (
            <Cell
              key={entry.course}
              fill={COLORS[i]}
              opacity={entry.roi === maxROI ? 1 : 0.65}
            />
          ))}
          <LabelList
            dataKey="roi"
            position="right"
            style={{ fill: axisColor, fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
