'use client';

import { useState, useEffect } from 'react';
import courses     from '@/canvas-info/courses';
import assignments from '@/canvas-info/assignments';
import professors  from '@/canvas-info/professors';
import StatCard    from '@/components/StatCard';
import GradeLineChart from '@/components/charts/GradeLineChart';
import { useTheme } from '@/contexts/ThemeContext';

type CourseId = 'course_001' | 'course_002' | 'course_003';

interface Props { courseId: CourseId }

// Map canvas courseId → GradeLineChart key
const GRADE_KEY: Record<CourseId, 'cmpsc' | 'math' | 'engl'> = {
  course_001: 'cmpsc',
  course_002: 'math',
  course_003: 'engl',
};

const COURSE_COLOR: Record<CourseId, string> = {
  course_001: '#6366f1',
  course_002: '#22c55e',
  course_003: '#f59e0b',
};

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function gradeColor(g: string) {
  if (g.startsWith('A')) return 'green';
  if (g.startsWith('B')) return 'amber';
  return 'default';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    graded:    'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400',
    upcoming:  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    missing:   'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400',
    submitted: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? map.upcoming}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('');
}

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-52 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  return <>{children}</>;
}

export default function CoursePage({ courseId }: Props) {
  const { isDark } = useTheme();
  const course  = courses.find(c => c.id === courseId);
  const prof    = professors.find(p => p.courseId === courseId);
  const asgns   = assignments.filter(a => a.courseId === courseId);
  const color   = COURSE_COLOR[courseId];
  const gKey    = GRADE_KEY[courseId];
  const profIdx = professors.findIndex(p => p.courseId === courseId);

  if (!course) return null;

  return (
    <div className="p-6 space-y-6">
      {/* ── Course header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color, fontFamily: 'monospace' }}>
          {course.courseCode} · {course.term} · {course.credits} credits
        </p>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{course.name}</h1>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Current Grade" value={course.currentGrade} color={gradeColor(course.currentGrade) as 'green' | 'amber' | 'default'} />
        <StatCard label="Score" value={`${course.currentScore}%`} color={course.currentScore >= 90 ? 'green' : 'amber'} />
        <StatCard label="Instructor" value={prof?.name ?? 'TBA'} />
      </div>

      {/* ── Grade trend chart ── */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Score Trend</h2>
        <ClientChart>
          <GradeLineChart only={[gKey]} />
        </ClientChart>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── Assignments ── */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assignments</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Due</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {asgns.map(a => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-2 text-gray-800 dark:text-gray-200 text-xs leading-snug pr-2">{a.title}</td>
                  <td className="py-2 text-gray-400 dark:text-gray-600 text-xs whitespace-nowrap">{formatDate(a.dueDate)}</td>
                  <td className="py-2"><StatusBadge status={a.status} /></td>
                  <td className="py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                    {a.score !== null ? `${a.score}/${a.pointsPossible}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Professor card ── */}
        {prof && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Professor</h2>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: AVATAR_COLORS[profIdx % AVATAR_COLORS.length] }}
              >
                {initials(prof.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{prof.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{prof.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Avg Grade</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{prof.avgGradeGiven}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Difficulty</p>
                <p className="font-semibold text-amber-500">{prof.difficultyRating} / 5</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-0.5">Office Hours</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{prof.officeHours}</p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2 leading-relaxed">
              {prof.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
