interface PlaceholderChartProps {
  label: string;
}

export default function PlaceholderChart({ label }: PlaceholderChartProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-32 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
      {label}
    </div>
  );
}
