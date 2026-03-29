'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  percent: number; // 0–100
  mini?: boolean;
}

function gaugeColor(p: number) {
  if (p >= 80) return '#22c55e';
  if (p >= 60) return '#f59e0b';
  return '#ef4444';
}

export default function ExamGaugeChart({ percent, mini = false }: Props) {
  const { isDark } = useTheme();
  const trackColor = isDark ? '#27272a' : '#e5e7eb';
  const color = gaugeColor(percent);
  const data = [{ value: percent }, { value: 100 - percent }];
  const h = mini ? 110 : 200;
  const innerR = mini ? 44 : 70;
  const outerR = mini ? 60 : 96;
  const fontSize = mini ? 18 : 32;
  const subSize = mini ? 9 : 13;

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={h}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={innerR}
            outerRadius={outerR}
            dataKey="value"
            strokeWidth={0}
            paddingAngle={2}
          >
            <Cell fill={color} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div
        className="absolute flex flex-col items-center"
        style={{ bottom: mini ? '18%' : '12%' }}
      >
        <span style={{ fontSize, fontWeight: 700, color, lineHeight: 1, fontFamily: '"Courier New", monospace' }}>
          {percent}%
        </span>
        <span style={{ fontSize: subSize, color: isDark ? '#71717a' : '#9ca3af', marginTop: 2, letterSpacing: '0.08em' }}>
          READY
        </span>
      </div>
      {/* Scale labels */}
      {!mini && (
        <>
          <div className="absolute bottom-0 left-8" style={{ fontSize: 10, color: isDark ? '#52525b' : '#d1d5db' }}>0%</div>
          <div className="absolute bottom-0 right-8" style={{ fontSize: 10, color: isDark ? '#52525b' : '#d1d5db' }}>100%</div>
        </>
      )}
    </div>
  );
}
