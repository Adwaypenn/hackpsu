'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import ExamGaugeChart from '@/components/charts/ExamGaugeChart';
import exams from '@/canvas-info/exams';

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-52 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  return <>{children}</>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ExamPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Exam Readiness</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Overall Readiness"     value="82%" color="green" />
        <StatCard label="Days Until Next Exam"  value="4"   color="amber" />
        <StatCard label="Study Hours This Week" value="12"               />
        <StatCard label="Weak Topics"           value="3"   color="amber" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming exams list */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Upcoming Exams</h2>
          <div className="space-y-1">
            {exams.map(exam => (
              <div
                key={exam.id}
                className="flex items-start justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{exam.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    {formatDate(exam.date)} · {exam.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    {exam.topics.slice(0, 2).join(', ')}{exam.topics.length > 2 ? ` +${exam.topics.length - 2}` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    exam.readinessPercent >= 85
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {exam.readinessPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gauge */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Readiness</h2>
          <ClientChart>
            <ExamGaugeChart percent={82} />
          </ClientChart>
        </div>
      </div>
    </div>
  );
}
