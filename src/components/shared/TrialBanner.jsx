import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrialBanner({ daysRemaining, planTier }) {
  if (planTier !== 'trial' || !daysRemaining || daysRemaining > 14) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-500" />
        <p className="text-sm text-orange-800 dark:text-orange-200">{daysRemaining} days remaining in your free trial.</p>
      </div>
      <Link to="/dashboard/pricing" className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">Upgrade Now</Link>
    </div>
  );
}