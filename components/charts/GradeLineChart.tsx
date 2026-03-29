'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import gradeHistory from '@/canvas-info/gradeHistory';
import { useTheme } from '@/contexts/ThemeContext';

type CourseKey = 'cmpsc' | 'math' | 'engl';

interface Props {
  mini?: boolean;
  only?: CourseKey[];   // if provided, only render those lines
}

const LINES: { key: CourseKey; color: string; label: string }[] = [
  { key: 'cmpsc', color: '#6366f1', label: 'CMPSC 473' },
  { key: 'math',  color: '#22c55e', label: 'MATH 251'  },
  { key: 'engl',  color: '#f59e0b', label: 'ENGL 202'  },
];

export default function GradeLineChart({ mini = false, only }: Props) {
  const { isDark } = useTheme();

  const axisColor = isDark ? '#6b7280' : '#9ca3af';
  const gridColor = isDark ? '#27272a' : '#f3f4f6';
  const tipBg     = isDark ? '#18181b' : '#fff';
  const tipBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const tipText   = isDark ? '#f4f4f5' : '#111';

  const visibleLines = only ? LINES.filter(l => only.includes(l.key)) : LINES;

  return (
    <ResponsiveContainer width="100%" height={mini ? 140 : 260}>
      <LineChart
        data={gradeHistory}
        margin={{ top: 8, right: 16, left: mini ? -24 : -8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="week"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          domain={[60, 100]}
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          hide={mini}
        />
        <Tooltip
          contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 8, color: tipText, fontSize: 12 }}
          cursor={{ stroke: isDark ? '#52525b' : '#e5e7eb' }}
          formatter={(v) => [`${v}%`]}
        />
        {!mini && visibleLines.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 8 }}
            formatter={(value) => {
              const line = LINES.find(l => l.key === value);
              return line?.label ?? value;
            }}
          />
        )}
        {visibleLines.map(l => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
