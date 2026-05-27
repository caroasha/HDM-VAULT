import { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import { getLicenseUsage } from '../../services/licenseService';

const planColors = { trial: 'blue', standard: 'orange', pro: 'green' };
const planLabels = { trial: 'Free Trial', standard: 'Standard', pro: 'Pro+' };

export default function PlanBadge() {
  const [tier, setTier] = useState('trial');

  useEffect(() => {
    getLicenseUsage().then(res => {
      if (res.success && res.data?.planTier) setTier(res.data.planTier);
    }).catch(() => {});
  }, []);

  return <Badge color={planColors[tier]}>{planLabels[tier]}</Badge>;
}