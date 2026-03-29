'use client';

import { useState, useEffect } from 'react';
import professors from '@/canvas-info/professors';
import ProfGradeChart from '@/components/charts/ProfGradeChart';

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  return <>{children}</>;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('');
}

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

export default function ProfessorPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Professor Intel</h1>

      <div className="grid grid-cols-3 gap-4">
        {professors.map((p, i) => (
          <div key={p.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {initials(p.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{p.courseId === 'course_001' ? 'CMPSC 473' : p.courseId === 'course_002' ? 'MATH 251' : 'ENGL 202'}</p>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Avg Grade</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{p.avgGradeGiven}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Difficulty</p>
                <p className="font-semibold text-amber-500">{p.difficultyRating} / 5</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Office Hrs</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{p.officeHours.split(',')[0]}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2 leading-relaxed">
              {p.notes}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade Distribution by Professor</h2>
        <ClientChart>
          <ProfGradeChart />
        </ClientChart>
      </div>
    </div>
  );
}
