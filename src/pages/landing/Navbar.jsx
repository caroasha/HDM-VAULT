import { Link } from 'react-router-dom';
import { Shield, Menu, X, ChevronDown, Mail, HelpCircle, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../../components/layout/ThemeToggle';
import Button from '../../components/ui/Button';

export default function Navbar({ onScroll, appName }) {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setSupportOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const scrollTo = (id) => { setOpen(false); setSupportOpen(false); onScroll(id); };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 cursor-pointer">
            <Shield className="text-orange-500" size={28} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">{appName || 'HDM Vault'}</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">FAQ</button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setSupportOpen(!supportOpen)} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Support <ChevronDown size={14} /></button>
              {supportOpen && (
                <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
                  <button onClick={() => scrollTo('footer')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"><Mail size={14} /> Contact</button>
                  <button onClick={() => scrollTo('downloads')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"><Download size={14} /> Downloads</button>
                  <button onClick={() => scrollTo('faq')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"><HelpCircle size={14} /> Help</button>
                </div>
              )}
            </div>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
                <button onClick={logout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Button size="sm" onClick={() => scrollTo('pricing')}>Start Free Trial</Button>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        {open && (
          <div className="md:hidden pb-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 py-2">Features</button>
            <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 py-2">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 py-2">FAQ</button>
            <button onClick={() => scrollTo('downloads')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 py-2">Downloads</button>
            <button onClick={() => scrollTo('footer')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 py-2">Contact</button>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Button size="sm" onClick={() => scrollTo('pricing')}>Start Free Trial</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}