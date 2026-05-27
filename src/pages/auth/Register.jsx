import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { registerUser } from '../../services/authService';
import { validateEmail, validatePassword, validateRequired, validatePhone } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';
import { getPlans, getCurrency } from '../../services/publicService';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || 'trial';
  const billing = searchParams.get('billing') || 'monthly';

  const [plans, setPlans] = useState(null);
  const [currency, setCurrency] = useState('KSh');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', organizationName: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([getPlans(), getCurrency()]).then(([p, c]) => {
      if (p.success) setPlans(p.data);
      if (c.success) setCurrency(c.data.currency || 'KSh');
    }).catch(() => {});
  }, []);

  const isPaid = plan !== 'trial';
  const tierLabel = plan === 'pro' ? 'Pro+' : plan === 'standard' ? 'Standard' : 'Free Trial';
  const price = isPaid && plans ? plans[plan]?.pricing?.[billing] : 0;

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(form.fullName, 'Full name'); if (nameErr) errs.fullName = nameErr;
    if (!validateEmail(form.email)) errs.email = 'Invalid email address';
    const passErr = validatePassword(form.password); if (passErr) errs.password = passErr;
    const orgErr = validateRequired(form.organizationName, 'Organization name'); if (orgErr) errs.organizationName = orgErr;
    if (form.phone) { const phoneErr = validatePhone(form.phone); if (phoneErr) errs.phone = phoneErr; }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setErrors(prev => ({ ...prev, [field]: undefined })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isPaid) {
     navigate(`/checkout?plan=${plan}&billing=${billing}&fullName=${encodeURIComponent(form.fullName)}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}&organizationName=${encodeURIComponent(form.organizationName)}&password=${encodeURIComponent(form.password)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, organizationName: form.organizationName });
      if (res.success) setSuccess(res.data);
      else setErrors({ form: res.message || 'Registration failed' });
    } catch (err) { setErrors({ form: 'Something went wrong. Please try again.' }); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-green-500" /></div>
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Your free trial is now active. Save your license key.</p>
          <Card className="p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Your License Key</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <code className="text-lg font-mono font-bold text-orange-500">{success.license?.licenseKey || 'HVM-XXXX-XXXX-XXXX'}</code>
              <button onClick={() => { navigator.clipboard.writeText(success.license?.licenseKey || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">{copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}</button>
            </div>
          </Card>
          <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left mb-8">
            <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
            <div><p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Keep this key safe!</p><p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">You will need this license key for device activation. It has also been sent to your email.</p></div>
          </div>
          <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4"><Shield size={14} /> {tierLabel} Plan</div>
          <h1 className="text-2xl font-bold mb-2">{isPaid ? 'Create Your Account' : 'Start Your Free Trial'}</h1>
          <p className="text-gray-600 dark:text-gray-400">{isPaid ? `${tierLabel} — ${billing} • ${formatCurrency(price, currency)}` : '14 days free • No credit card required'}</p>
        </div>
        {errors.form && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">{errors.form}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={handleChange('fullName')} error={errors.fullName} placeholder="John Doe" />
          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} error={errors.email} placeholder="john@example.com" />
          <Input label="Phone (optional)" type="tel" value={form.phone} onChange={handleChange('phone')} error={errors.phone} placeholder="+254712345678" />
          <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} error={errors.password} placeholder="Min 8 characters" />
          <Input label="Organization Name" value={form.organizationName} onChange={handleChange('organizationName')} error={errors.organizationName} placeholder="Your Company or Personal" />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating Account...' : isPaid ? 'Continue to Payment' : 'Start Free Trial'}</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Login</Link></p>
      </div>
    </div>
  );
}