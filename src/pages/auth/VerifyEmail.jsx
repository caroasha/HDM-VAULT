import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { verifyEmail } from '../../services/authService';
import Spinner from '../../components/ui/Spinner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    verifyEmail(token)
      .then(res => { setStatus(res.success ? 'success' : 'error'); })
      .catch(() => { setStatus('error'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>

        {status === 'loading' && (
          <div>
            <Spinner size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying Email...</h1>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-500" /></div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your email has been verified successfully.</p>
            <Link to="/login"><Button className="w-full">Continue to Login</Button></Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle size={32} className="text-red-500" /></div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This verification link is invalid or has expired.</p>
            <Link to="/login"><Button variant="outline" className="w-full">Go to Login</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}