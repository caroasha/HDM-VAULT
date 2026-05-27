import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Bug, Download, Filter, Search, X, Globe } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { getThreatLogs, getThreatSummary } from '../../services/threatService';
import { formatDateTime } from '../../utils/formatters';

const typeIcons = {
  url_blocked: Globe,
  phishing_detected: AlertTriangle,
  malware_detected: Bug,
  download_blocked: Download,
};

const typeLabels = {
  url_blocked: 'URL Blocked',
  phishing_detected: 'Phishing',
  malware_detected: 'Malware',
  download_blocked: 'Download',
};

export default function ThreatLog() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', severity: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadData(); }, [page, filter]);

  const loadData = async () => {
    setLoading(true);
    const [logRes, sumRes] = await Promise.all([getThreatLogs(page, filter), getThreatSummary()]);
    if (logRes.success) { setLogs(logRes.data?.logs || logRes.data || []); setTotal(logRes.data?.total || logRes.data?.length || 0); }
    if (sumRes.success) setSummary(sumRes.data || sumRes);
    setLoading(false);
  };

  const handleExport = () => {
    const csv = 'Date,Type,Severity,URL,Description\n' + logs.map(l => `"${formatDateTime(l.blockedAt)}","${l.type}","${l.severity}","${l.url}","${l.description || ''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `threat-log-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const severityColor = (s) => s === 'critical' ? 'red' : s === 'warning' ? 'yellow' : 'blue';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Threat Log</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" /> Filter</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download size={14} className="mr-1" /> Export CSV</Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardBody className="text-center py-3"><p className="text-2xl font-bold">{summary.total}</p><p className="text-xs text-gray-500">Total Threats</p></CardBody></Card>
          <Card><CardBody className="text-center py-3"><p className="text-2xl font-bold text-red-500">{summary.critical || 0}</p><p className="text-xs text-gray-500">Critical</p></CardBody></Card>
          <Card><CardBody className="text-center py-3"><p className="text-2xl font-bold text-yellow-500">{summary.warning || 0}</p><p className="text-xs text-gray-500">Warnings</p></CardBody></Card>
          <Card><CardBody className="text-center py-3"><p className="text-2xl font-bold text-blue-500">{summary.info || 0}</p><p className="text-xs text-gray-500">Info</p></CardBody></Card>
        </div>
      )}

      {showFilters && (
        <Card>
          <CardBody>
            <div className="flex gap-3 flex-wrap">
              <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value="">All Types</option>
                <option value="url_blocked">URL Blocked</option>
                <option value="phishing_detected">Phishing</option>
                <option value="malware_detected">Malware</option>
                <option value="download_blocked">Download Blocked</option>
              </select>
              <select value={filter.severity} onChange={e => setFilter({...filter, severity: e.target.value})} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <Button size="sm" variant="ghost" onClick={() => { setFilter({ type: '', severity: '' }); setPage(1); }}><X size={14} className="mr-1" /> Clear</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {loading ? <Spinner /> : logs.length === 0 ? (
        <Card><CardBody className="text-center py-12"><Shield size={48} className="text-green-300 mx-auto mb-4" /><p className="font-medium mb-2">No Threats Detected</p><p className="text-sm text-gray-500">You're all clear! Threats will appear here when blocked.</p></CardBody></Card>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const Icon = typeIcons[log.type] || Shield;
            return (
              <Card key={log._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${log.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/50' : log.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                    <Icon size={18} className={log.severity === 'critical' ? 'text-red-500' : log.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{typeLabels[log.type] || log.type}</p>
                      <Badge color={severityColor(log.severity)}>{log.severity}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{log.url}</p>
                    {log.description && <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.blockedAt)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 py-2">Page {page} of {Math.ceil(total / 20)}</span>
          <Button size="sm" variant="outline" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}