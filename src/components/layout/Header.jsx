import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ChevronDown, LogOut, Settings, CreditCard, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import PlanBadge from '../shared/PlanBadge';

export default function Header({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const map = { vault: '/dashboard/vault', breach: '/dashboard/breaches', threat: '/dashboard/threats', device: '/dashboard/devices', vpn: '/dashboard/vpn', scan: '/dashboard/security', backup: '/dashboard/backup', ai: '/dashboard/ai', setting: '/dashboard/settings', plan: '/dashboard/pricing', pricing: '/dashboard/pricing' };
    for (const [key, path] of Object.entries(map)) { if (q.includes(key)) { navigate(path); break; } }
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"><Menu size={20} /></button>
        <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hidden sm:flex"><Search size={18} /></button>
        {searchOpen && (
          <form onSubmit={handleSearch} className="hidden sm:flex items-center">
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-48 px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800" />
            <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 p-1 text-gray-400"><X size={14} /></button>
          </form>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 relative"><Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white dark:bg-gray-800 border rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b"><p className="text-sm font-medium">Notifications</p></div>
              <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"><p className="font-medium">Enable 2FA</p><p className="text-xs text-gray-500">Secure your account</p></div>
              <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"><p className="font-medium">Scan devices</p><p className="text-xs text-gray-500">Devices need scanning</p></div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">{user?.fullName?.[0]?.toUpperCase() || 'U'}</div>
            <span className="text-sm font-medium hidden md:block">{user?.fullName?.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white dark:bg-gray-800 border rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b"><p className="text-sm font-medium">{user?.fullName}</p><p className="text-xs text-gray-500">{user?.email}</p><div className="mt-2"><PlanBadge /></div></div>
              <button onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"><Settings size={16} /> Settings</button>
              <button onClick={() => { navigate('/dashboard/pricing'); setProfileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"><CreditCard size={16} /> Plan & Billing</button>
              <div className="border-t mt-1 pt-1"><button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"><LogOut size={16} /> Logout</button></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}