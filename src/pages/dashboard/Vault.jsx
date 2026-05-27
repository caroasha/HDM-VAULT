import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Folder, Edit, Trash2, Eye, EyeOff, Copy, Check, Upload, Download, Shield, Zap, Key, RefreshCw } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { getItems, createItem, updateItem, deleteItem, getFolders, createFolder, importVault, exportVault } from '../../services/vaultService';
import { formatRelativeTime } from '../../utils/formatters';

function PasswordGenerator({ onUse }) {
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) return;
    let result = '';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    setPassword(result);
  };

  useEffect(() => { generate(); }, [length, uppercase, lowercase, numbers, symbols]);

  const getStrength = () => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (uppercase) score++;
    if (lowercase) score++;
    if (numbers) score++;
    if (symbols) score++;
    if (score <= 2) return { label: 'Weak', color: 'red', pct: 33 };
    if (score <= 4) return { label: 'Medium', color: 'yellow', pct: 66 };
    return { label: 'Strong', color: 'green', pct: 100 };
  };

  const strength = getStrength();

  return (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Password Generator</h4>
        <div className="flex gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full bg-${strength.color}-100 text-${strength.color}-600 dark:bg-${strength.color}-900 dark:text-${strength.color}-400`}>{strength.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-2 border">
        <code className="flex-1 text-sm font-mono truncate">{password}</code>
        <button onClick={() => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
        <button onClick={generate} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><RefreshCw size={14} /></button>
      </div>
      <ProgressBar value={strength.pct} max={100} color={strength.color} size="sm" />
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1 text-xs"><input type="range" min="8" max="32" value={length} onChange={e => setLength(+e.target.value)} className="w-20" /> {length}</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={uppercase} onChange={() => setUppercase(!uppercase)} /> A-Z</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={lowercase} onChange={() => setLowercase(!lowercase)} /> a-z</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={numbers} onChange={() => setNumbers(!numbers)} /> 0-9</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={symbols} onChange={() => setSymbols(!symbols)} /> !@#</label>
      </div>
      <Button size="sm" onClick={() => onUse(password)}><Key size={14} className="mr-1" /> Use This Password</Button>
    </div>
  );
}

export default function Vault() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState(null);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ siteName: '', username: '', password: '', siteUrl: '', folderId: null, notes: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { loadData(); }, [search, folderFilter]);

  const loadData = async () => {
    setLoading(true);
    const [iRes, fRes] = await Promise.all([getItems(1, search, folderFilter), getFolders()]);
    if (iRes.success) setItems(iRes.data?.items || iRes.data || []);
    if (fRes.success) setFolders(fRes.data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.siteName || !form.username || !form.password) { addToast('Fill required fields', 'warning'); return; }
    if (editItem) await updateItem(editItem._id, form);
    else await createItem(form);
    setModal(false); setEditItem(null);
    setForm({ siteName: '', username: '', password: '', siteUrl: '', folderId: null, notes: '' });
    setShowGenerator(false);
    await loadData();
    addToast(editItem ? 'Item updated' : 'Item added');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await deleteItem(id);
    await loadData();
    addToast('Item deleted');
  };

  const handleExport = async () => {
    const data = await exportVault();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hdm-vault-export-${Date.now()}.enc`; a.click();
    URL.revokeObjectURL(url);
    addToast('Vault exported');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importVault(data.items || data);
      await loadData();
      addToast('Vault imported');
    } catch (err) { addToast('Import failed', 'error'); }
    finally { setImporting(false); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ siteName: item.siteName, username: item.username, password: '', siteUrl: item.siteUrl || '', folderId: item.folderId || null, notes: item.notes || '' });
    setShowGenerator(false);
    setModal(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ siteName: '', username: '', password: '', siteUrl: '', folderId: folderFilter || null, notes: '' });
    setShowGenerator(false);
    setModal(true);
  };

  const getIcon = (url) => {
    if (!url) return <Shield size={16} className="text-gray-400" />;
    const domain = url.replace(/https?:\/\//, '').split('/')[0];
    return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-5 h-5 rounded" onError={e => { e.target.style.display = 'none'; }} alt="" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Vault</h1>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleImport} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}><Upload size={14} className="mr-1" /> Import</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download size={14} className="mr-1" /> Export</Button>
          <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" /> Add Item</Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search vault..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <select value={folderFilter || ''} onChange={e => setFolderFilter(e.target.value || null)} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="">All Folders</option>
          {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <Card><CardBody className="text-center py-12"><Shield size={48} className="text-gray-300 mx-auto mb-4" /><p className="font-medium mb-2">No Items Found</p><p className="text-sm text-gray-500 mb-4">{search ? 'Try a different search' : 'Add your first password'}</p><Button onClick={openAdd}><Plus size={14} className="mr-1" /> Add Item</Button></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <Card key={item._id} hover className="p-4 cursor-pointer" onClick={() => openEdit(item)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.siteUrl)}
                  <div>
                    <p className="font-semibold text-sm">{item.siteName}</p>
                    <p className="text-xs text-gray-500">{item.username}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {item.siteUrl && <p className="text-xs text-gray-400 truncate mt-1">{item.siteUrl}</p>}
              <div className="flex items-center gap-2 mt-2">
                {item.passwordStrength !== null && item.passwordStrength !== undefined && (
                  <Badge color={item.passwordStrength >= 3 ? 'green' : item.passwordStrength >= 2 ? 'yellow' : 'red'}>
                    {item.passwordStrength >= 3 ? 'Strong' : item.passwordStrength >= 2 ? 'Medium' : 'Weak'}
                  </Badge>
                )}
                {item.updatedAt && <span className="text-xs text-gray-400">{formatRelativeTime(item.updatedAt)}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Item' : 'Add Item'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Site Name *" value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} placeholder="Google, Netflix..." />
            <Input label="Username *" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="john@example.com" />
          </div>
          <Input label="URL" value={form.siteUrl} onChange={e => setForm({...form, siteUrl: e.target.value})} placeholder="https://..." />
          <div className="relative">
            <Input label="Password *" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400"><Eye size={16} /></button>
          </div>
          <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="text-sm text-orange-500 hover:underline">
            <Zap size={14} className="inline mr-1" /> {showGenerator ? 'Hide' : 'Show'} Password Generator
          </button>
          {showGenerator && <PasswordGenerator onUse={(pw) => { setForm({...form, password: pw}); setShowGenerator(false); }} />}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Folder</label>
              <select value={form.folderId || ''} onChange={e => setForm({...form, folderId: e.target.value || null})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value="">None</option>
                {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Security question..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editItem ? 'Update' : 'Save Item'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}