import { useState, useEffect } from 'react';
import { Shield, Key, AlertTriangle, Smartphone, Lock, Wifi, WifiOff } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import SecurityScore from '../../components/shared/SecurityScore';
import LicenseMeter from '../../components/shared/LicenseMeter';
import TrialBanner from '../../components/shared/TrialBanner';
import PlanBadge from '../../components/shared/PlanBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ vaultItems: 0, threatsBlocked: 0, devices: 0 });
  const [license, setLicense] = useState(null);
  const [scanScore, setScanScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vpnState, setVpnState] = useState(null);

  useEffect(() => {
    Promise.all([
      api('/license/usage'),
      api('/security/scan-results'),
      api('/devices'),
      api('/threats/summary'),
      api('/vault/items?limit=1'),
    ]).then(([lic, scan, devices, threats, vault]) => {
      if (lic.success) setLicense(lic.data);
      if (scan.success && scan.data) setScanScore({ score: scan.data.score, grade: scan.data.grade });
      setStats({
        vaultItems: vault?.total || 0,
        threatsBlocked: threats?.data?.total || 0,
        devices: devices?.data?.length || 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));

    try {
      const saved = localStorage.getItem('hdm_vpn_state');
      if (saved) setVpnState(JSON.parse(saved));
    } catch (e) {}
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your security overview</p>
        </div>
        <PlanBadge />
      </div>

      <TrialBanner daysRemaining={license?.license?.daysRemaining} planTier={license?.planTier} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{scanScore?.score ?? '--'}</p>
              <p className="text-xs text-gray-500">{scanScore?.grade ? `Grade ${scanScore.grade}` : 'No scan'}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
              <Key size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.vaultItems}</p>
              <p className="text-xs text-gray-500">Vault Items</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.threatsBlocked}</p>
              <p className="text-xs text-gray-500">Threats</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.devices}</p>
              <p className="text-xs text-gray-500">Devices</p>
            </div>
          </CardBody>
        </Card>

        <Card className={vpnState?.connected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}>
          <CardBody className="flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${vpnState?.connected ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {vpnState?.connected ? <Wifi size={20} className="text-green-500" /> : <WifiOff size={20} className="text-gray-400" />}
            </div>
            <div>
              <p className="text-xl font-bold"><Badge color={vpnState?.connected ? 'green' : 'gray'}>{vpnState?.connected ? 'ON' : 'OFF'}</Badge></p>
              <p className="text-xs text-gray-500">VPN</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold">License Usage</h3></CardHeader>
          <CardBody>{license ? <LicenseMeter data={license} /> : <p className="text-sm text-gray-500">Loading...</p>}</CardBody>
        </Card>
        <Card>
          <CardHeader><h3 className="font-semibold">Quick Actions</h3></CardHeader>
          <CardBody className="space-y-2">
            {['Vault','Breaches','Threats','Devices','VPN','Scanner','Backup','Security','AI Chat','Settings','Plans'].map(a => (
              <a key={a} href={`/dashboard/${a.toLowerCase().replace(' ','-')}`} className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">🔹 {a}</a>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}