import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { forgotPassword } from '../../services/authService';
import { validateEmail } from '../../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><Mail size={24} className="text-orange-500" /></div>
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your email and we'll send you a reset link.</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">{error}</div>}

        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <p className="text-green-700 dark:text-green-300 font-medium">Check Your Email</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-orange-500 hover:underline"><ArrowLeft size={14} /> Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="john@example.com" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
            <Link to="/login" className="block text-center text-sm text-orange-500 hover:underline"><ArrowLeft size={14} className="inline mr-1" /> Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}