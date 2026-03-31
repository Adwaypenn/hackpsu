'use client';

import { useState } from 'react';
import stressHeatmapData from '@/canvas-info/stressHeatmapData';
import type { StressLevel } from '@/canvas-info/stressHeatmapData';
import assignments from '@/canvas-info/assignments';
import courses from '@/canvas-info/courses';
import { useTheme } from '@/contexts/ThemeContext';

const courseMap = Object.fromEntries(courses.map(c => [c.id, c.courseCode]));

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

interface Tooltip {
  x: number;
  y: number;
  date: string;
  level: StressLevel;
  items: { title: string; course: string; points: number }[];
}

export default function StressHeatmap() {
  const { isDark } = useTheme();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const weeks: typeof stressHeatmapData[] = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(stressHeatmapData.slice(i * 7, i * 7 + 7));
  }

  const handleMouseEnter = (e: React.MouseEvent, cell: typeof stressHeatmapData[0]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const items = assignments
      .filter(a => a.dueDate.startsWith(cell.date))
      .map(a => ({ title: a.title, course: courseMap[a.courseId] ?? a.courseId, points: a.pointsPossible }));
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, date: cell.date, level: cell.level, items });
  };

  return (
    <div className="space-y-3" style={{ position: 'relative' }}>
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
              onMouseEnter={e => handleMouseEnter(e, cell)}
              onMouseLeave={() => setTooltip(null)}
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

      {/* Hover tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 999,
            background: isDark ? 'rgba(18,18,22,0.97)' : 'rgba(255,255,255,0.97)',
            border: `1px solid ${cellBorder(tooltip.level, isDark)}`,
            borderRadius: 10,
            padding: '8px 12px',
            minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: textColor(tooltip.level, isDark), letterSpacing: '0.06em', marginBottom: 4 }}>
            {tooltip.date} · {tooltip.level} stress
          </div>
          {tooltip.items.length === 0 ? (
            <div style={{ fontSize: 10, color: isDark ? '#52525b' : '#9ca3af' }}>No assignments due</div>
          ) : (
            tooltip.items.map((item, i) => (
              <div key={i} style={{ fontSize: 11, color: isDark ? '#d4d4d8' : '#333', marginTop: 2 }}>
                <span style={{ color: isDark ? '#71717a' : '#9ca3af', fontSize: 9 }}>{item.course} · </span>
                {item.title}
                <span style={{ color: isDark ? '#52525b' : '#bbb', fontSize: 9 }}> ({item.points}pts)</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
