'use client';

import { useState, useEffect } from 'react';
import type { Page } from '@/types';
import StatCard       from '@/components/StatCard';
import CortisolMeter  from '@/components/CortisolMeter';
import GradeLineChart from '@/components/charts/GradeLineChart';
import ExamGaugeChart from '@/components/charts/ExamGaugeChart';
import ROIBarChart    from '@/components/charts/ROIBarChart';
import StressHeatmap  from '@/components/charts/StressHeatmap';
import courses        from '@/canvas-info/courses';

interface DashboardPageProps {
  setActivePage: (page: Page) => void;
}

function ClientChart({ height = 'h-52', children }: { height?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={`${height} rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse`} />;
  return <>{children}</>;
}

const COURSE_PAGE: Record<string, Page> = {
  course_001: 'cmpsc473',
  course_002: 'math251',
  course_003: 'engl202',
};

const COURSE_COLOR: Record<string, string> = {
  course_001: '#6366f1',
  course_002: '#22c55e',
  course_003: '#f59e0b',
};

const COURSE_TREND: Record<string, { text: string; green: boolean }> = {
  course_001: { text: '↑ Improving', green: true  },
  course_002: { text: '→ Stable',    green: false },
  course_003: { text: '↑ Improving', green: true  },
};

export default function DashboardPage({ setActivePage }: DashboardPageProps) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h1>

      {/* ── Row 1: stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Overall GPA"    value="3.7"        color="green" />
        <StatCard label="Exam Readiness" value="82%"        color="green" />
        <StatCard label="Cortisol"       value="High"       color="amber" />
        <StatCard label="Top ROI Class"  value="ENGL 202"               />
      </div>

      {/* ── Row 2: course cards ── */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Courses</h2>
        <div className="grid grid-cols-3 gap-4">
          {courses.map(c => {
            const trend = COURSE_TREND[c.id];
            const color = COURSE_COLOR[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setActivePage(COURSE_PAGE[c.id])}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-left
                           hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1 font-mono group-hover:opacity-90 transition-opacity"
                   style={{ color }}>
                  {c.courseCode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-snug">{c.name}</p>
                <p className="text-2xl font-medium text-gray-900 dark:text-gray-100">{c.currentGrade}</p>
                <p className={`text-sm mt-1 ${trend.green ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {trend.text}
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  View details →
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Row 3: grade trajectory ── */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade Trajectory</h2>
        <ClientChart height="h-64">
          <GradeLineChart />
        </ClientChart>
      </div>

      {/* ── Row 4: exam gauge + cortisol meter ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exam Readiness</h2>
          <ClientChart height="h-48">
            <ExamGaugeChart percent={82} />
          </ClientChart>
          <button
            onClick={() => {/* exam detail coming soon */}}
            className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors mt-2"
          >
            View exams →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stress / Cortisol</h2>
          <CortisolMeter level={0.72} />
        </div>
      </div>

      {/* ── Row 5: ROI + stress heatmap ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Class ROI</h2>
          <ClientChart height="h-56">
            <ROIBarChart />
          </ClientChart>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Stress Heatmap</h2>
          <StressHeatmap />
        </div>
      </div>
    </div>
  );
}
