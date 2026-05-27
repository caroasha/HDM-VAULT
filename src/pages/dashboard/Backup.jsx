import { useState, useEffect } from 'react';
import { HardDrive, Download, Trash2, Share2, Clock, RefreshCw, FileText, Calendar } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Toggle from '../../components/ui/Toggle';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { getBackups, createManualBackup, downloadBackup, restoreBackup, deleteBackup } from '../../services/backupService';
import { api } from '../../services/api';
import { formatDateTime, formatFileSize } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export default function Backup() {
  const { addToast } = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [backingUp, setBackingUp] = useState(false);
  const [restoreModal, setRestoreModal] = useState(false);
  const [restoreData, setRestoreData] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    loadBackups();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api('/backup/settings');
      if (res.success && res.data) {
        setAutoBackup(res.data.autoBackup || false);
        setFrequency(res.data.frequency || 'daily');
      }
    } catch (err) {}
  };

  const saveSettings = async (auto, freq) => {
    try {
      await api('/backup/settings', {
        method: 'PUT',
        body: JSON.stringify({ autoBackup: auto, frequency: freq })
      });
    } catch (err) {}
  };

  const handleAutoBackupToggle = (val) => {
    setAutoBackup(val);
    saveSettings(val, frequency);
  };

  const handleFrequencyChange = (freq) => {
    setFrequency(freq);
    saveSettings(autoBackup, freq);
  };

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await getBackups();
      if (res.success) setBackups(res.data?.backups || res.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    try {
      const res = await createManualBackup();
      if (res.success) { addToast('Backup created'); await loadBackups(); }
      else addToast('Backup failed', 'error');
    } catch (err) { addToast('Backup failed', 'error'); }
    finally { setBackingUp(false); }
  };

  const handleDownload = async (backup) => {
    try {
      const data = await downloadBackup(backup._id);
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename || `hdm-backup-${backup._id}.enc`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast('Download started');
    } catch (err) { addToast('Download failed', 'error'); }
  };

  const handleDelete = async (backup) => {
    if (!confirm(`Delete backup?`)) return;
    try { await deleteBackup(backup._id); addToast('Backup deleted'); await loadBackups(); }
    catch (err) { addToast('Delete failed', 'error'); }
  };

  const handleShare = async (backup) => {
    try {
      const data = await downloadBackup(backup._id);
      if (navigator.share) {
        await navigator.share({ title: 'HDM Vault Backup', text: `Backup from ${formatDateTime(backup.createdAt)}`, files: [new File([data], backup.filename || 'backup.enc', { type: 'application/octet-stream' })] });
      } else {
        await navigator.clipboard.writeText(data);
        addToast('Copied to clipboard');
      }
    } catch (err) {}
  };

  const handleRestore = async () => {
    if (!selectedBackup || !restoreData) return;
    setRestoring(true);
    try {
      const res = await restoreBackup(selectedBackup._id, restoreData);
      if (res.success) { addToast(`Restored ${res.data?.restored || 0} items`); setRestoreModal(false); setRestoreData(''); setSelectedBackup(null); }
      else addToast('Restore failed', 'error');
    } catch (err) { addToast('Restore failed', 'error'); }
    finally { setRestoring(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
        <Button onClick={handleManualBackup} disabled={backingUp}><HardDrive size={16} className="mr-1" /> {backingUp ? 'Creating...' : 'Manual Backup'}</Button>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Clock size={16} /> Auto-Backup Schedule</h3></CardHeader>
        <CardBody>
          <Toggle enabled={autoBackup} onChange={handleAutoBackupToggle} label="Enable automatic backups" description="Automatically backup your vault on a schedule" />
          {autoBackup && (
            <div className="mt-3 flex gap-2">
              {['daily', 'weekly', 'monthly'].map(f => (
                <Button key={f} variant={frequency === f ? 'primary' : 'outline'} size="sm" onClick={() => handleFrequencyChange(f)} className="capitalize"><Calendar size={14} className="mr-1" /> {f}</Button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Backup History ({backups.length})</h3></CardHeader>
        <CardBody>
          {loading ? <Spinner /> : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><HardDrive size={40} className="mx-auto mb-3 text-gray-300" /><p>No backups yet.</p></div>
          ) : (
            <div className="space-y-2">
              {backups.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center shrink-0"><FileText size={18} className="text-orange-500" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.filename || `Backup ${b._id.slice(-6)}`}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDateTime(b.createdAt)}</span>
                        <span>{b.itemCount || 0} items</span>
                        {b.size > 0 && <span>{formatFileSize(b.size)}</span>}
                        <Badge color={b.type === 'auto' ? 'blue' : 'orange'}>{b.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(b)}><Download size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleShare(b)}><Share2 size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedBackup(b); setRestoreData(''); setRestoreModal(true); }}><RefreshCw size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(b)}><Trash2 size={14} className="text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={restoreModal} onClose={() => setRestoreModal(false)} title="Restore from Backup">
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">Restoring will add items from this backup. Existing items will not be overwritten.</div>
          {selectedBackup && <div className="text-sm text-gray-500"><p>Backup: {selectedBackup.filename}</p><p>Date: {formatDateTime(selectedBackup.createdAt)}</p><p>Items: {selectedBackup.itemCount || 0}</p></div>}
          <textarea value={restoreData} onChange={e => setRestoreData(e.target.value)} placeholder="Paste encrypted backup data..." className="w-full h-32 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm resize-none" />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setRestoreModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleRestore} disabled={restoring || !restoreData}><RefreshCw size={14} className="mr-1" /> {restoring ? 'Restoring...' : 'Restore'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}