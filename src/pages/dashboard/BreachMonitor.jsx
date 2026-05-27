import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Shield, CheckCircle, ExternalLink, Clock, RefreshCw, Mail, Database } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { checkEmail, getBreachHistory, getLatestBreach } from '../../services/breachService';
import { formatDateTime } from '../../utils/formatters';

export default function BreachMonitor() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBreachHistory(), getLatestBreach()]).then(([h, l]) => {
      if (h.success) setHistory(h.data?.checks || h.data || []);
      if (l.success && l.data) setLatest(l.data);
    }).finally(() => setPageLoading(false));
  }, []);

  const handleCheck = async () => {
    if (!email) { addToast('Enter an email address', 'warning'); return; }
    setLoading(true);
    setResults(null);
    try {
      const res = await checkEmail(email);
      if (res.success) {
        setResults(res.data);
        if (res.data?.breached) {
          addToast(`Found in ${res.data.breaches.length} breaches!`, 'warning');
        } else {
          addToast('No breaches found!', 'success');
        }
        const hRes = await getBreachHistory();
        if (hRes.success) setHistory(hRes.data?.checks || hRes.data || []);
      }
    } catch (err) { addToast('Check failed', 'error'); }
    finally { setLoading(false); }
  };

  if (pageLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Breach Monitor</h1>

      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter email to check..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              className="flex-1"
              type="email"
            />
            <Button onClick={handleCheck} disabled={loading}>
              <Search size={16} className="mr-1" /> {loading ? 'Checking...' : 'Check Now'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Shield size={12} /> Uses k-anonymity — your email is never sent in plain text
          </p>
        </CardBody>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Results for {email}</h3>
              <Badge color={results.breached ? 'red' : 'green'}>
                {results.breached ? `${results.breaches.length} Breaches` : 'Clean'}
              </Badge>
            </div>
          </CardHeader>
          <CardBody>
            {results.breached ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Your email was found in {results.breaches.length} data breaches</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">Change your passwords immediately for affected accounts. Enable 2FA where available.</p>
                  </div>
                </div>

                {results.breaches.map((breach, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{breach.name}</h4>
                        <p className="text-xs text-gray-500">{breach.title}</p>
                      </div>
                      {breach.date && <span className="text-xs text-gray-400"><Clock size={10} className="inline mr-1" />{breach.date}</span>}
                    </div>
                    {breach.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{breach.description}</p>}
                    {breach.compromisedData?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {breach.compromisedData.map((d, j) => <Badge key={j} color="orange">{d}</Badge>)}
                      </div>
                    )}
                    {breach.affectedUsers && (
                      <p className="text-xs text-gray-500 mt-2">
                        <Database size={10} className="inline mr-1" />
                        {breach.affectedUsers.toLocaleString()} accounts affected
                      </p>
                    )}
                  </div>
                ))}

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-orange-800 dark:text-orange-200 mb-2">Recommended Actions</h4>
                  <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                    <li>• Change passwords for all breached accounts</li>
                    <li>• Use unique, strong passwords for each account</li>
                    <li>• Enable Two-Factor Authentication (2FA) immediately</li>
                    <li>• Check your vault for reused passwords</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">No breaches found!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Your email was not found in any known data breaches.</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {latest && !results && (
        <Card>
          <CardHeader><h3 className="font-semibold">Last Checked</h3></CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="font-medium">{latest.email}</p>
                <p className="text-xs text-gray-500">{formatDateTime(latest.checkedAt || latest.createdAt)} — {latest.breaches?.length || 0} breaches found</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold">Check History</h3></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div key={h._id || i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-sm">{h.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={h.breaches?.length > 0 ? 'red' : 'green'}>{h.breaches?.length || 0} breaches</Badge>
                    <span className="text-xs text-gray-500">{formatDateTime(h.checkedAt || h.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}