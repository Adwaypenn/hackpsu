interface StatCardProps {
  label: string;
  value: string;
  color?: 'green' | 'amber' | 'red' | 'default';
}

export default function StatCard({ label, value, color = 'default' }: StatCardProps) {
  const valueClass =
    color === 'green' ? 'text-green-500 dark:text-green-400' :
    color === 'amber' ? 'text-amber-500 dark:text-amber-400' :
    color === 'red'   ? 'text-red-500 dark:text-red-400'     :
    'text-gray-800 dark:text-gray-100';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
