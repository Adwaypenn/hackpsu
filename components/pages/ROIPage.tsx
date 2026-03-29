'use client';

import { useState, useEffect } from 'react';
import ROIBarChart from '@/components/charts/ROIBarChart';

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-56 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  return <>{children}</>;
}

const courses = [
  { name: 'CMPSC 473', hours: 8,  grade: 'A',  roi: 4.2, gradeNum: 4.0 },
  { name: 'MATH 251',  hours: 10, grade: 'B+', roi: 3.3, gradeNum: 3.3 },
  { name: 'ENGL 202',  hours: 4,  grade: 'A-', roi: 4.7, gradeNum: 3.7 },
];

const maxROI = Math.max(...courses.map(c => c.roi));

export default function ROIPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Class ROI</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
              <th className="pb-2 font-medium">Course</th>
              <th className="pb-2 font-medium">Hours / Week</th>
              <th className="pb-2 font-medium">Current Grade</th>
              <th className="pb-2 font-medium">ROI Score</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => {
              const isTop = c.roi === maxROI;
              return (
                <tr
                  key={c.name}
                  className={`border-b border-gray-50 dark:border-gray-800/60 last:border-0 ${
                    isTop ? 'bg-green-50 dark:bg-green-900/10' : ''
                  }`}
                >
                  <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400">{c.hours}h</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400">{c.grade}</td>
                  <td className="py-2.5">
                    <span className={`font-semibold ${isTop ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {c.roi}
                    </span>
                    {isTop && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                        Best
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">ROI Comparison</h2>
        <ClientChart>
          <ROIBarChart />
        </ClientChart>
      </div>
    </div>
  );
}
