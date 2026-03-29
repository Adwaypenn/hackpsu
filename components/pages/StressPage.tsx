'use client';

import stressLog from '@/canvas-info/stressLog';
import StressHeatmap from '@/components/charts/StressHeatmap';

function badgeClass(level: string) {
  if (level === 'Low')    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  if (level === 'Medium') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
}

export default function StressPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Stress Tracker</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors">
          Log today's stress
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 7-day log table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">This Week</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 font-medium">Day</th>
                <th className="pb-2 font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {stressLog.map(row => (
                <tr key={row.date} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                    {new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </td>
                  <td className="py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass(row.level)}`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">4-Week Heatmap</h2>
          <StressHeatmap />
        </div>
      </div>
    </div>
  );
}
