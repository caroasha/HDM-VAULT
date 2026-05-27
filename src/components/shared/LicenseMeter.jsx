import ProgressBar from '../ui/ProgressBar';
import { useState, useEffect } from 'react';
import { getLicenseUsage } from '../../services/licenseService';

export default function LicenseMeter({ data }) {
  const [usage, setUsage] = useState(data || null);

  useEffect(() => {
    if (data) {
      setUsage(data);
      return;
    }
    getLicenseUsage().then(res => { if (res.success) setUsage(res.data); }).catch(() => {});
  }, [data]);

  if (!usage) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Users</p>
        <ProgressBar value={usage.users?.used || 0} max={usage.users?.max || 1} color={usage.users?.used >= usage.users?.max ? 'red' : 'orange'} size="sm" showLabel />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Devices per User</p>
        <ProgressBar value={usage.devices?.maxPerUser || 0} max={usage.devices?.limit || 1} color={usage.devices?.maxPerUser >= usage.devices?.limit ? 'red' : 'orange'} size="sm" showLabel />
      </div>
      {usage.license && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <p>License: <span className="font-mono text-orange-500">{usage.license.key || 'N/A'}</span></p>
          {usage.license.daysRemaining !== undefined && usage.license.daysRemaining !== Infinity && (
            <p>Expires in: {usage.license.daysRemaining} days</p>
          )}
        </div>
      )}
    </div>
  );
}