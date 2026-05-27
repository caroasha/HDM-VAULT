import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/layout/ThemeToggle';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></Link>
        <div className="text-8xl font-bold text-orange-500 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button className="w-full"><Home size={16} className="mr-2" /> Back to Home</Button></Link>
      </div>
    </div>
  );
}