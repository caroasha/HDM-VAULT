import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Header from './Header';
import Sidebar from './Sidebar';
import TrialBanner from '../shared/TrialBanner';
import { getLicenseUsage } from '../../services/licenseService';

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('hdm_sidebar_collapsed') === 'true');
  const [license, setLicense] = useState(null);

  useEffect(() => {
    getLicenseUsage().then(res => { if (res.success) setLicense(res.data); }).catch(() => {});
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      localStorage.setItem('hdm_sidebar_collapsed', !prev);
      return !prev;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header collapsed={collapsed} onToggle={toggleSidebar} />
        {license?.planTier === 'trial' && (
          <TrialBanner daysRemaining={license?.license?.daysRemaining} planTier={license?.planTier} />
        )}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}