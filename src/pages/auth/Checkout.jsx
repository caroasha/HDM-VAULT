import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, CreditCard, Smartphone, AlertTriangle, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { formatCurrency } from '../../utils/formatters';
import { API_BASE_URL } from '../../utils/constants';

export default function Checkout() {
  const [searchParams] = useSearchParams();

  const plan = searchParams.get('plan') || 'standard';
  const billing = searchParams.get('billing') || 'monthly';
  const fullName = searchParams.get('fullName') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const organizationName = searchParams.get('organizationName') || '';
  const password = searchParams.get('password') || '';

  const [methods, setMethods] = useState(null);
  const [currency, setCurrency] = useState('KSh');
  const [amount, setAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('select');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  const tierLabel = plan === 'pro' ? 'Pro+' : 'Standard';

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/public/payment/methods`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/payment/currency`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/plans`).then(r => r.json()),
    ]).then(([m, c, p]) => {
      if (m.success) setMethods(m.data);
      if (c.success) setCurrency(c.data?.currency || 'KSh');
      if (p.success) setAmount(p.data[plan]?.pricing?.[billing] || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [plan, billing]);

  const requireProof = methods?.manualVerification?.requireProofUpload || false;
  const mpesa = methods?.mpesa || {};
  const hasMpesa = mpesa.enabled && (mpesa.stkPush || mpesa.sendMoney?.enabled || mpesa.paybill?.enabled || mpesa.till?.enabled);

  const userData = { fullName, email, phone, password, organizationName, planTier: plan, planType: billing };

  const createAccount = async (endpoint, extra = {}) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, ...extra }),
    });
    const data = await res.json();
    if (data.success) { setSubmitted(true); setError(''); }
    else setError(data.message || 'Failed');
  };

  const handleStripePay = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/public/payment/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTier: plan, planType: billing, currency, amount, ...userData }),
    }).then(r => r.json()).then(data => {
      if (data.success && data.data?.sessionUrl) {
        createAccount('/public/payment/stripe/success', { sessionId: data.data.sessionId });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const handleStkPush = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/public/payment/mpesa/stkpush`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, planTier: plan, planType: billing }),
    }).then(r => r.json()).then(data => {
      if (data.success) {
        createAccount('/public/payment/mpesa/stk-success', { checkoutRequestId: data.data?.checkoutRequestId });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const handleManualConfirm = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/public/payment/manual-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, paymentMethod: selectedMethod, transactionId, phoneNumber }),
    }).then(r => r.json()).then(data => {
      if (data.success) { setSubmitted(true); setConfirmOpen(false); }
      else setError(data.message || 'Failed');
    }).catch(() => {}).finally(() => setLoading(false));
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-orange-500" /></div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-green-500" /></div>
          <h1 className="text-2xl font-bold mb-2">Payment Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your account is created and payment is being processed.</p>
          <Card className="p-4 mb-6 text-left text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white mb-2">What happens next:</p>
            <ul className="space-y-1">
              <li>• Admin will verify and activate your license</li>
              <li>• You'll receive your license key via SMS & email</li>
              <li>• Manual payments not submitted within 2 hours are auto-rejected</li>
            </ul>
          </Card>
          <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
          <h1 className="text-2xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600 dark:text-gray-400">{tierLabel} — {billing} • {formatCurrency(amount, currency)}</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-600">{error}</div>}

        <Card className="p-4 mb-6">
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Name:</span> <span className="font-medium">{fullName}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="font-medium">{email}</span></p>
            {phone && <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{phone}</span></p>}
            <p><span className="text-gray-500">Organization:</span> <span className="font-medium">{organizationName}</span></p>
          </div>
        </Card>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Payment Method</p>
        <div className="space-y-2 mb-6">
          {methods?.stripe && (
            <button onClick={() => { setSelectedMethod('stripe'); setStep('pay'); }} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === 'stripe' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <CreditCard size={20} className="text-orange-500" />
              <div><p className="font-medium">Credit / Debit Card</p><p className="text-xs text-gray-500">Pay securely with Stripe</p></div>
            </button>
          )}
          {mpesa.stkPush && (
            <button onClick={() => { setSelectedMethod('mpesa_stk'); setStep('pay'); }} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === 'mpesa_stk' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <Smartphone size={20} className="text-green-500" />
              <div><p className="font-medium">M-Pesa STK Push</p><p className="text-xs text-gray-500">Instant popup on your phone</p></div>
            </button>
          )}
          {mpesa.sendMoney?.enabled && (
            <button onClick={() => { setSelectedMethod('mpesa_send'); setStep('pay'); }} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === 'mpesa_send' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <Smartphone size={20} className="text-green-500" />
              <div><p className="font-medium">M-Pesa Send Money</p><p className="text-xs text-gray-500">Send to {mpesa.sendMoney.receivePhone}</p></div>
            </button>
          )}
          {mpesa.paybill?.enabled && (
            <button onClick={() => { setSelectedMethod('mpesa_paybill'); setStep('pay'); }} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === 'mpesa_paybill' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <Smartphone size={20} className="text-green-500" />
              <div><p className="font-medium">M-Pesa Paybill</p><p className="text-xs text-gray-500">Business: {mpesa.paybill.businessNumber}</p></div>
            </button>
          )}
          {mpesa.till?.enabled && (
            <button onClick={() => { setSelectedMethod('mpesa_till'); setStep('pay'); }} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === 'mpesa_till' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <Smartphone size={20} className="text-green-500" />
              <div><p className="font-medium">M-Pesa Buy Goods (Till)</p><p className="text-xs text-gray-500">Till: {mpesa.till.tillNumber}</p></div>
            </button>
          )}
        </div>

        {step === 'pay' && (
          <div className="space-y-4 mb-6">
            {selectedMethod === 'stripe' && (
              <div className="space-y-3">
                <Input label="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails(p => ({ ...p, number: e.target.value }))} placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiry" value={cardDetails.expiry} onChange={(e) => setCardDetails(p => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" />
                  <Input label="CVC" value={cardDetails.cvc} onChange={(e) => setCardDetails(p => ({ ...p, cvc: e.target.value }))} placeholder="123" />
                </div>
                <Button className="w-full" onClick={handleStripePay} disabled={loading}>{loading ? 'Processing...' : `Pay ${formatCurrency(amount, currency)}`}</Button>
              </div>
            )}

            {selectedMethod === 'mpesa_stk' && (
              <div className="space-y-3">
                <Input label="M-Pesa Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="254712345678" />
                <Button className="w-full" onClick={handleStkPush} disabled={loading}>{loading ? 'Sending...' : 'Send STK Push'}</Button>
              </div>
            )}

            {['mpesa_send', 'mpesa_paybill', 'mpesa_till'].includes(selectedMethod) && (
              <div className="space-y-3">
                {selectedMethod === 'mpesa_send' && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Send Money Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1"><li>M-Pesa → Send Money</li><li>Phone: <strong>{mpesa.sendMoney.receivePhone}</strong></li><li>Amount: <strong>{formatCurrency(amount, currency)}</strong></li><li>Enter PIN and send</li></ol>
                  </div>
                )}
                {selectedMethod === 'mpesa_paybill' && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Paybill Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1"><li>M-Pesa → Lipa na M-Pesa → Paybill</li><li>Business: <strong>{mpesa.paybill.businessNumber}</strong></li><li>Account: <strong>{phoneNumber || 'Your phone'}</strong></li><li>Amount: <strong>{formatCurrency(amount, currency)}</strong></li><li>Enter PIN and send</li></ol>
                  </div>
                )}
                {selectedMethod === 'mpesa_till' && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Buy Goods Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1"><li>M-Pesa → Buy Goods & Services</li><li>Till: <strong>{mpesa.till.tillNumber}</strong></li><li>Amount: <strong>{formatCurrency(amount, currency)}</strong></li><li>Enter PIN and send</li></ol>
                  </div>
                )}

                {requireProof && (
                  <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm font-medium">Payment Proof Required</p>
                    <Input label="M-Pesa Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="QWE1234567" />
                  </div>
                )}

                <Button className="w-full" onClick={() => setConfirmOpen(true)} disabled={loading}>I Have Paid — Submit</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Payment">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Have you really paid?</p>
              <p className="mt-1">Only submit if you have completed the transaction. Unconfirmed payments are auto-rejected after 2 hours.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmOpen(false)}>Back</Button>
            <Button className="flex-1" onClick={handleManualConfirm} disabled={loading}>{loading ? 'Submitting...' : 'Yes, I Have Paid'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}