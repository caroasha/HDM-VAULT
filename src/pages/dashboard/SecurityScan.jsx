import { useState, useEffect } from 'react';
import { Shield, Scan, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Spinner from '../../components/ui/Spinner';
import { runFullScan, getLatestScan, getScanHistory } from '../../services/securityService';
import { formatDateTime, getGradeColor } from '../../utils/formatters';

export default function SecurityScan() {
  const [scanning, setScanning] = useState(false);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLatestScan(), getScanHistory()]).then(([l, h]) => {
      if (l.success && l.data) setLatest(l.data);
      if (h.success) setHistory(h.data?.scans || h.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleScan = async () => {
    setScanning(true);
    const res = await runFullScan();
    if (res.success) {
      setLatest(res.data?.scan || res.data);
      setHistory(prev => [res.data?.scan || res.data, ...prev]);
    }
    setScanning(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Security Scan</h1>
        <Button onClick={handleScan} disabled={scanning}>
          <Scan size={16} className="mr-1" /> {scanning ? 'Scanning...' : 'Run Full Scan'}
        </Button>
      </div>

      {scanning && (
        <Card>
          <CardBody className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-orange-500 mx-auto mb-4" />
            <p className="font-medium">Scanning your security posture...</p>
            <p className="text-sm text-gray-500">Analyzing passwords, devices, breaches & threats</p>
          </CardBody>
        </Card>
      )}

      {latest && !scanning && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Latest Scan Results</h3>
              <span className="text-xs text-gray-500">{formatDateTime(latest.scannedAt || latest.createdAt)}</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke={getGradeColor(latest.grade)} strokeWidth="6" strokeDasharray={`${(latest.score || 0) * 2.01} 201`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xl font-bold" style={{ color: getGradeColor(latest.grade), marginTop: '-55px' }}>{latest.grade || 'N/A'}</span>
                </div>
                <p className="text-2xl font-bold">{latest.score || 0}/100</p>
                <p className="text-xs text-gray-500">Security Score</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Weak Passwords</span><span className="text-red-500">{latest.weakPasswords || 0}</span></div>
                  <ProgressBar value={latest.weakPasswords || 0} max={10} color="red" size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Reused Passwords</span><span className="text-yellow-500">{latest.reusedPasswords || 0}</span></div>
                  <ProgressBar value={latest.reusedPasswords || 0} max={10} color="orange" size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Breached Accounts</span><span className="text-red-500">{latest.breachedAccounts || 0}</span></div>
                  <ProgressBar value={latest.breachedAccounts || 0} max={10} color="red" size="sm" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">{latest.devicesScanned || 0} devices scanned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-orange-500" />
                  <span className="text-sm">{latest.threats?.length || 0} threats detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm">{latest.recommendations?.length || 0} recommendations</span>
                </div>
              </div>
            </div>

            {latest.threats?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Detected Threats</h4>
                <div className="space-y-1">
                  {latest.threats.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge color={t.severity === 'critical' ? 'red' : t.severity === 'warning' ? 'yellow' : 'blue'}>{t.severity}</Badge>
                      <span>{t.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {latest.recommendations?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {latest.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold">Scan History</h3></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {history.map((scan, i) => (
                <div key={scan._id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold" style={{ color: getGradeColor(scan.grade) }}>{scan.grade}</span>
                    <div>
                      <p className="text-sm font-medium">{scan.score}/100</p>
                      <p className="text-xs text-gray-500">{formatDateTime(scan.scannedAt || scan.createdAt)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost"><Download size={14} /></Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {!latest && !scanning && (
        <Card>
          <CardBody className="text-center py-12">
            <Shield size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No Scans Yet</p>
            <p className="text-sm text-gray-500 mb-4">Run your first security scan to analyze your security posture</p>
            <Button onClick={handleScan}><Scan size={16} className="mr-1" /> Start First Scan</Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}