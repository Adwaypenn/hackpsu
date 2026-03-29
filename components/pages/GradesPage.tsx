'use client';

import { useState, useEffect } from 'react';
import courses from '@/canvas-info/courses';
import GradeLineChart from '@/components/charts/GradeLineChart';

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  return <>{children}</>;
}

const trendLabel: Record<string, { text: string; color: string }> = {
  'CMPSC 473': { text: '↑ Improving', color: 'text-green-500 dark:text-green-400' },
  'MATH 251':  { text: '→ Stable',    color: 'text-gray-400 dark:text-gray-500'   },
  'ENGL 202':  { text: '↑ Improving', color: 'text-green-500 dark:text-green-400' },
};

export default function GradesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Grade Trajectory</h1>

      <div className="grid grid-cols-3 gap-4">
        {courses.map(c => {
          const trend = trendLabel[c.courseCode] ?? { text: '→ Stable', color: 'text-gray-400' };
          return (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{c.courseCode}</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-1">{c.currentGrade}</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{c.currentScore}%</p>
              <p className={`text-sm mt-1 ${trend.color}`}>{trend.text}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Score Over Time</h2>
        <ClientChart>
          <GradeLineChart />
        </ClientChart>
      </div>
    </div>
  );
}
