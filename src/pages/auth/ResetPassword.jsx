import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { resetPassword } from '../../services/authService';
import { validatePassword } from '../../utils/validators';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid or expired reset link'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await resetPassword(token, password);
      if (res.success) setDone(true);
      else setError(res.message || 'Reset failed');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={24} className="text-green-500" /></div>
          <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your password has been changed successfully.</p>
          <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={24} className="text-orange-500" /></div>
          <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your new password below.</p>
        </div>

        {!token && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">Invalid or expired reset link. Please request a new one.</div>}
        {error && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">{error}</div>}

        {token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="New Password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Min 8 characters" />
            <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} placeholder="Re-enter password" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
            <Link to="/login" className="block text-center text-sm text-orange-500 hover:underline"><ArrowLeft size={14} className="inline mr-1" /> Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}