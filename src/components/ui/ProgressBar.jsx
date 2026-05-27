import { clsx } from 'clsx';

export default function ProgressBar({ value, max = 100, color = 'orange', size = 'md', showLabel, className }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };
  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && <div className="flex justify-between mb-1 text-xs text-gray-600 dark:text-gray-400"><span>{value}/{max}</span><span>{Math.round(percent)}%</span></div>}
      <div className={clsx('w-full bg-gray-200 dark:bg-gray-700 rounded-full', sizes[size])}>
        <div className={clsx('rounded-full transition-all duration-500', sizes[size], colors[color])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}