import { useState, useEffect } from 'react';
import { Check, ArrowUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { getPlans } from '../../services/publicService';
import { getLicenseUsage } from '../../services/licenseService';
import { formatCurrency } from '../../utils/formatters';

export default function PricingPlans() {
  const [plans, setPlans] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlans(), getLicenseUsage()]).then(([p, l]) => {
      if (p.success) setPlans(p.data);
      if (l.success) setCurrentTier(l.data?.planTier || 'trial');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!plans) return null;

  const currency = plans.currency || 'KSh';

  const tiers = [
    {
      key: 'trial',
      name: 'Free Trial',
      price: 0,
      features: ['Password Vault', 'Auto-fill', 'Basic VPN', 'Breach Check', '2FA', '1 User', '2 Devices'],
      cta: currentTier === 'trial' ? 'Current Plan' : null,
    },
    {
      key: 'standard',
      name: 'Standard',
      price: plans.standard?.pricing?.[billing] || 1500,
      features: ['All Trial features', 'Full VPN', 'File Scanner', '5 Users', '5 Devices per user', 'API Access'],
      cta: currentTier === 'standard' ? 'Current Plan' : currentTier === 'trial' ? 'Upgrade' : null,
    },
    {
      key: 'pro',
      name: 'Pro+',
      price: plans.pro?.pricing?.[billing] || 2500,
      features: ['All Standard features', 'AI Security Assistant', 'Dark Web Monitoring', '20 Users', '15 Devices per user', 'Priority Support'],
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade',
      highlight: currentTier !== 'pro',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans & Pricing</h1>
      <div className="flex justify-center gap-2 mb-4">
        {['monthly', 'yearly', 'permanent'].map(b => (
          <Button key={b} variant={billing === b ? 'primary' : 'ghost'} size="sm" onClick={() => setBilling(b)} className="capitalize">{b}</Button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {tiers.map((t, i) => (
          <Card key={i} className={`relative p-6 text-center ${t.highlight ? 'border-orange-500 ring-2 ring-orange-500' : ''}`}>
            {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>}
            <h3 className="font-semibold mb-2">{t.name}</h3>
            <p className="text-3xl font-bold mb-4">{t.price === 0 ? 'Free' : formatCurrency(t.price, currency)}</p>
            <ul className="space-y-1 mb-6">
              {t.features.map((f, j) => <li key={j} className="text-sm flex items-center justify-center gap-1"><Check size={14} className="text-green-500" /> {f}</li>)}
            </ul>
            {t.cta ? (
              <Button className="w-full" variant={t.cta === 'Current Plan' ? 'outline' : 'primary'} disabled={t.cta === 'Current Plan'}>
                {t.cta === 'Upgrade' && <ArrowUp size={14} className="mr-1" />}
                {t.cta}
              </Button>
            ) : (
              <div className="h-10" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}