'use client';

import stressHeatmapData from '@/canvas-info/stressHeatmapData';
import type { StressLevel } from '@/canvas-info/stressHeatmapData';
import { useTheme } from '@/contexts/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

function cellColor(level: StressLevel, isDark: boolean) {
  if (level === 'Low')    return isDark ? '#14532d' : '#bbf7d0';
  if (level === 'Medium') return isDark ? '#78350f' : '#fde68a';
  return isDark ? '#7f1d1d' : '#fecaca';
}

function cellBorder(level: StressLevel, isDark: boolean) {
  if (level === 'Low')    return isDark ? '#166534' : '#86efac';
  if (level === 'Medium') return isDark ? '#92400e' : '#fcd34d';
  return isDark ? '#991b1b' : '#fca5a5';
}

function textColor(level: StressLevel, isDark: boolean) {
  if (level === 'Low')    return isDark ? '#4ade80' : '#166534';
  if (level === 'Medium') return isDark ? '#fbbf24' : '#92400e';
  return isDark ? '#f87171' : '#991b1b';
}

export default function StressHeatmap() {
  const { isDark } = useTheme();

  // Group into 4 weeks of 7 days
  const weeks: typeof stressHeatmapData[] = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(stressHeatmapData.slice(i * 7, i * 7 + 7));
  }

  return (
    <div className="space-y-3">
      {/* Day headers */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: '36px repeat(7, 1fr)' }}>
        <div />
        {DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: 10, color: isDark ? '#71717a' : '#9ca3af', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: '36px repeat(7, 1fr)' }}>
          <div style={{ fontSize: 9, color: isDark ? '#52525b' : '#d1d5db', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
            {WEEKS[wi]}
          </div>
          {week.map((cell, di) => (
            <div
              key={di}
              className="rounded-md flex items-center justify-center transition-transform hover:scale-110 cursor-default"
              style={{
                height: 36,
                background: cellColor(cell.level, isDark),
                border: `1px solid ${cellBorder(cell.level, isDark)}`,
              }}
              title={`${cell.date} — ${cell.level}`}
            >
              <span style={{ fontSize: 8, fontWeight: 600, color: textColor(cell.level, isDark), letterSpacing: '0.04em' }}>
                {cell.level[0]}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-4 pt-1">
        {(['Low', 'Medium', 'High'] as StressLevel[]).map(l => (
          <div key={l} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: cellColor(l, isDark), border: `1px solid ${cellBorder(l, isDark)}` }}
            />
            <span style={{ fontSize: 10, color: isDark ? '#71717a' : '#9ca3af' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
