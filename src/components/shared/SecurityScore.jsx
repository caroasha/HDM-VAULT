import { clsx } from 'clsx';
import { getGradeColor } from '../../utils/formatters';

export default function SecurityScore({ score, grade }) {
  const color = getGradeColor(grade);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${score * 2.01} 201`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color }}>{grade}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{score}/100</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Security Score</p>
      </div>
    </div>
  );
}