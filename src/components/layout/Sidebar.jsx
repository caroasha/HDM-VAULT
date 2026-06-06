import { NavLink } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import PlanBadge from '../shared/PlanBadge';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../utils/constants';
import { LayoutDashboard, Key, AlertTriangle, Shield as ShieldIcon, Smartphone, Lock, FolderOpen, HardDrive, Scan, Settings, Sparkles, CreditCard } from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/vault', icon: Key, label: 'Vault' },
  { to: '/dashboard/breaches', icon: AlertTriangle, label: 'Breaches' },
  { to: '/dashboard/threats', icon: ShieldIcon, label: 'Threats' },
  { to: '/dashboard/devices', icon: Smartphone, label: 'Devices' },
  { to: '/dashboard/vpn', icon: Lock, label: 'VPN' },
  { to: '/dashboard/scanner', icon: FolderOpen, label: 'Scanner' },
  { to: '/dashboard/backup', icon: HardDrive, label: 'Backup' },
  { to: '/dashboard/security', icon: Scan, label: 'Security' },
  { to: '/dashboard/ai', icon: Sparkles, label: 'AI Chat' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/pricing', icon: CreditCard, label: 'Plans' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const [appName, setAppName] = useState('HDM Vault');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/content/site-info`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data?.appName) setAppName(data.data.appName); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.orgId) {
      api(`/admin/organizations/${user.orgId}`).then(res => {
        if (res.success && res.data?.name) setOrgName(res.data.name);
      }).catch(() => {});
    }
  }, [user?.orgId]);

  return (
    <aside className={`h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Shield className="text-orange-500 shrink-0" size={24} />
          {!collapsed && <span className="text-lg font-bold text-gray-900 dark:text-white truncate">{appName}</span>}
        </div>
        {!collapsed && orgName && (
          <div className="flex items-center gap-1.5 mt-1 ml-9">
            <Building2 size={12} className="text-orange-400 shrink-0" />
            <span className="text-xs text-orange-500 dark:text-orange-400 truncate font-medium">{orgName}</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <PlanBadge />
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button onClick={onToggle} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}