import { Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useState } from 'react';

const defaultPlans = {
  currency: 'KSh',
  trialDurationDays: 14,
  trial: { maxUsers: 1, maxDevicesPerUser: 2 },
  standard: {
    maxUsers: 5, maxDevicesPerUser: 5, features: [],
    pricing: { monthly: 1500, yearly: 15000, permanent: 45000 }
  },
  pro: {
    maxUsers: 20, maxDevicesPerUser: 15, features: [],
    pricing: { monthly: 2500, yearly: 18000, permanent: 75000 }
  }
};

const billingOptions = [
  { key: 'monthly', label: 'Monthly', desc: 'Pay every month' },
  { key: 'yearly', label: 'Yearly', desc: 'Save with annual billing' },
  { key: 'permanent', label: 'Permanent', desc: 'One-time payment, lifetime access' },
];

export default function Pricing({ plans = defaultPlans }) {
  const navigate = useNavigate();
  const currency = plans?.currency || 'KSh';
  const standardPricing = plans?.standard?.pricing || {};
  const proPricing = plans?.pro?.pricing || {};

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  const openModal = (tier) => {
    setSelectedTier(tier);
    setSelectedBilling('monthly');
    setModalOpen(true);
  };

  const handleContinue = () => {
    navigate(`/register?plan=${selectedTier}&billing=${selectedBilling}`);
  };

  const tiers = [
    {
      name: 'Free Trial',
      price: 0,
      features: ['Password Vault', 'Auto-fill', 'Basic VPN', 'Breach Check', '2FA', '1 User', '2 Devices'],
      cta: 'Get Started',
      action: () => navigate('/register?plan=trial'),
      highlight: false,
    },
    {
      name: 'Standard',
      price: standardPricing.monthly || 1500,
      features: ['All Trial features', 'Full VPN', 'File Scanner', '5 Users', '5 Devices per user', 'API Access'],
      cta: 'Choose Plan',
      action: () => openModal('standard'),
      highlight: false,
    },
    {
      name: 'Pro+',
      price: proPricing.monthly || 2500,
      features: ['All Standard features', 'AI Security Assistant', 'Dark Web Monitoring', '20 Users', '15 Devices per user', 'Priority Support'],
      cta: 'Choose Plan',
      action: () => openModal('pro'),
      highlight: true,
    },
  ];

  const selectedPricing = selectedTier === 'standard' ? standardPricing : proPricing;

  return (
    <>
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Protection</h2>
            <p className="text-gray-600 dark:text-gray-400">Pricing in {currency}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <Card key={i} className={`relative p-6 ${tier.highlight ? 'border-orange-500 ring-2 ring-orange-500' : ''}`}>
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                )}
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {tier.price === 0 ? 'Free' : formatCurrency(tier.price, currency)}
                  </span>
                  {tier.price > 0 && <span className="text-sm text-gray-500">/month</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check size={16} className="text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.highlight ? 'primary' : 'outline'} className="w-full" onClick={tier.action}>
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Choose ${selectedTier === 'pro' ? 'Pro+' : 'Standard'} Plan`}>
        <div className="space-y-3 mb-6">
          {billingOptions.map((opt) => {
            const price = selectedPricing[opt.key] || 0;
            const isSelected = selectedBilling === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedBilling(opt.key)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
                <span className="text-xl font-bold text-orange-500">{formatCurrency(price, currency)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button className="flex-1" onClick={handleContinue}>
            Continue — {formatCurrency(selectedPricing[selectedBilling] || 0, currency)}
          </Button>
        </div>
      </Modal>
    </>
  );
}