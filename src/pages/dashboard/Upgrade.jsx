import { useState, useEffect } from 'react';
import { ArrowUp, CreditCard, Smartphone, Check, Sparkles, Shield, Zap, Users, Smartphone as DeviceIcon, Headphones } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { calculateUpgrade, confirmUpgrade, getLicenseUsage } from '../../services/licenseService';
import { getPaymentMethods, getCurrency } from '../../services/publicService';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

const proFeatures = [
  { icon: Sparkles, text: 'AI Security Assistant — 24/7 intelligent monitoring' },
  { icon: Shield, text: 'Dark Web Monitoring — detect leaked credentials' },
  { icon: Zap, text: 'Auto Password Rotation — automatic breach response' },
  { icon: DeviceIcon, text: '15 Devices per User — cover all your devices' },
  { icon: Users, text: '20 Team Members — full team coverage' },
  { icon: Headphones, text: 'Priority Support — 4-hour response SLA' },
];

export default function Upgrade() {
  const { addToast } = useToast();
  const [step, setStep] = useState('calculate');
  const [upgradeData, setUpgradeData] = useState(null);
  const [license, setLicense] = useState(null);
  const [methods, setMethods] = useState(null);
  const [currency, setCurrency] = useState('KSh');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([getLicenseUsage(), getPaymentMethods(), getCurrency()]).then(([l, m, c]) => {
      if (l.success) setLicense(l.data);
      if (m.success) setMethods(m.data);
      if (c.success) setCurrency(c.data?.currency || 'KSh');
    }).finally(() => setLoading(false));
  }, []);

  const handleCalculate = async () => {
    setProcessing(true);
    const res = await calculateUpgrade();
    if (res.success) {
      setUpgradeData(res.data);
      setStep('review');
    } else {
      addToast(res.message || 'Calculation failed', 'error');
    }
    setProcessing(false);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) { addToast('Select a payment method', 'warning'); return; }
    setProcessing(true);
    try {
      const res = await confirmUpgrade(selectedMethod);
      if (res.success) {
        addToast('Upgrade initiated! Check your email.', 'success');
        setStep('done');
      } else {
        addToast(res.message || 'Upgrade failed', 'error');
      }
    } catch (err) { addToast('Upgrade failed', 'error'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  if (license?.planTier === 'pro') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Upgrade Plan</h1>
        <Card><CardBody className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-500" /></div>
          <h2 className="text-lg font-bold mb-2">You're on Pro+!</h2>
          <p className="text-gray-500">You already have the highest tier with all features unlocked.</p>
        </CardBody></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upgrade to Pro+</h1>

      {step === 'calculate' && (
        <Card>
          <CardBody className="text-center py-8">
            <Sparkles size={48} className="text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Unlock Pro+ Features</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upgrade from Standard to Pro+ and get AI-powered security, dark web monitoring, auto password rotation, and more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left max-w-lg mx-auto">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <f.icon size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{f.text}</span>
                </div>
              ))}
            </div>

            <Button size="lg" onClick={handleCalculate} disabled={processing}>
              <ArrowUp size={16} className="mr-1" /> {processing ? 'Calculating...' : 'Calculate Upgrade Price'}
            </Button>
          </CardBody>
        </Card>
      )}

      {step === 'review' && upgradeData && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h3 className="font-semibold">Upgrade Summary</h3></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500">Current Plan</p>
                  <p className="font-bold">Standard ({upgradeData.currentPlanType})</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-3">
                  <p className="text-gray-500">Upgrading To</p>
                  <p className="font-bold text-orange-500">Pro+</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500">Remaining Days</p>
                  <p className="font-bold">{upgradeData.remainingDays} days</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                  <p className="text-gray-500">Upgrade Price</p>
                  <p className="font-bold text-green-500 text-lg">{formatCurrency(upgradeData.upgradePrice, upgradeData.currency)}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                <p>Standard price: {formatCurrency(upgradeData.standardPrice, upgradeData.currency)}</p>
                <p>Pro+ price: {formatCurrency(upgradeData.proPrice, upgradeData.currency)}</p>
                <p>You only pay the difference for remaining time.</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Payment Method</h3></CardHeader>
            <CardBody>
              <div className="space-y-2">
                {methods?.stripe && (
                  <button onClick={() => setSelectedMethod('stripe')} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left ${selectedMethod === 'stripe' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700'}`}>
                    <CreditCard size={18} className="text-orange-500" />
                    <div><p className="font-medium text-sm">Credit / Debit Card</p><p className="text-xs text-gray-500">Pay with Stripe</p></div>
                  </button>
                )}
                {methods?.mpesa?.stkPush && (
                  <button onClick={() => setSelectedMethod('mpesa_stk')} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left ${selectedMethod === 'mpesa_stk' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700'}`}>
                    <Smartphone size={18} className="text-green-500" />
                    <div><p className="font-medium text-sm">M-Pesa STK Push</p><p className="text-xs text-gray-500">Instant mobile payment</p></div>
                  </button>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setStep('calculate')}>Back</Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={!selectedMethod || processing}>
                  {processing ? 'Processing...' : `Pay ${formatCurrency(upgradeData.upgradePrice, upgradeData.currency)}`}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {step === 'done' && (
        <Card><CardBody className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-500" /></div>
          <h2 className="text-lg font-bold mb-2">Upgrade Submitted!</h2>
          <p className="text-gray-500">Your upgrade is being processed. You'll receive a confirmation email shortly.</p>
        </CardBody></Card>
      )}
    </div>
  );
}