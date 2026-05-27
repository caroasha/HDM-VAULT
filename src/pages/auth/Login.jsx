import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { loginUser, complete2FA } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { getDeviceId, setTokens, setUser } from '../../utils/tokens';
import { validateEmail } from '../../utils/validators';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [twoFA, setTwoFA] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleLoginSuccess = (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    setUser(user);
    login(user, accessToken, refreshToken);
    navigate('/dashboard');
  };

  const validate = () => {
    const errs = {};
    if (!validateEmail(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await loginUser(form.email, form.password, form.rememberMe);
      if (!res.success) { setErrors({ form: res.message || 'Invalid email or password' }); setLoading(false); return; }
      if (res.data?.requires2FA) { setTwoFA(res.data.tempToken); setLoading(false); return; }

      const deviceId = getDeviceId();
      if (!deviceId) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        navigate(`/activate?email=${encodeURIComponent(form.email)}`);
        return;
      }
      handleLoginSuccess(res.data.user, res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally { setLoading(false); }
  };

  const handle2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) return;
    setLoading(true);
    try {
      const res = await complete2FA(twoFA, twoFACode);
      if (!res.success) { setErrors({ form: res.message || 'Invalid 2FA code' }); setLoading(false); return; }
      const deviceId = getDeviceId();
      if (!deviceId) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        navigate(`/activate?email=${encodeURIComponent(form.email)}`);
        return;
      }
      handleLoginSuccess(res.data.user, res.data.accessToken, res.data.refreshToken);
    } catch (err) { setErrors({ form: 'Invalid 2FA code' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Login to access your vault</p>
        </div>

        {errors.form && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">{errors.form}</div>}

        {twoFA ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Enter the 6-digit code from your authenticator app</p>
            <Input label="2FA Code" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} />
            <Button className="w-full" onClick={handle2FA} disabled={loading || twoFACode.length !== 6}>{loading ? 'Verifying...' : 'Verify & Login'}</Button>
            <button onClick={() => setTwoFA(null)} className="w-full text-sm text-gray-500 hover:text-orange-500">Cancel</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} error={errors.email} placeholder="john@example.com" />
            <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} error={errors.password} placeholder="Enter your password" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm(prev => ({ ...prev, rememberMe: e.target.checked }))} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register?plan=trial" className="text-orange-500 hover:underline">Start Free Trial</Link>
        </p>
      </div>
    </div>
  );
}