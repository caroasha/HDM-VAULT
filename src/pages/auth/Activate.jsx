import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Monitor, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { registerDevice } from '../../services/deviceService';
import { useAuth } from '../../hooks/useAuth';
import { getToken, getRefreshToken, getDeviceId, setDeviceId, generateDeviceId } from '../../utils/tokens';
import { api } from '../../services/api';

const platforms = [
  { key: 'windows', icon: Monitor, label: 'Windows' },
  { key: 'macos', icon: Monitor, label: 'macOS' },
  { key: 'linux', icon: Monitor, label: 'Linux' },
  { key: 'ios', icon: Smartphone, label: 'iPhone/iPad' },
  { key: 'android', icon: Smartphone, label: 'Android' },
  { key: 'chrome', icon: Globe, label: 'Chrome' },
  { key: 'firefox', icon: Globe, label: 'Firefox' },
];

const deviceTypes = {
  windows: 'desktop', macos: 'desktop', linux: 'desktop',
  ios: 'mobile', android: 'mobile',
  chrome: 'browser', firefox: 'browser',
};

function formatLicenseKey(raw) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const withoutPrefix = cleaned.startsWith('HVM') ? cleaned.slice(3) : cleaned;
  if (withoutPrefix.length === 0) return '';
  const segments = [];
  for (let i = 0; i < withoutPrefix.length; i += 4) {
    segments.push(withoutPrefix.slice(i, i + 4));
  }
  return segments.join('-');
}

export default function Activate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = searchParams.get('email') || '';
  const inputRef = useRef(null);

  const [step, setStep] = useState('license');
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLicenseChange = (e) => {
    const input = e.target;
    const cursor = input.selectionStart;
    const oldLength = licenseKey.length;
    const raw = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length > 16) return;
    const formatted = formatLicenseKey(raw);
    setLicenseKey(formatted);

    setTimeout(() => {
      if (inputRef.current) {
        const newLength = formatted.length;
        const cursorShift = newLength - oldLength;
        const newCursor = cursor + (cursorShift > 0 ? 1 : 0);
        inputRef.current.setSelectionRange(Math.min(newCursor, newLength), Math.min(newCursor, newLength));
      }
    }, 0);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    let raw = pasted.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.startsWith('HVM')) raw = raw.slice(3);
    raw = raw.slice(0, 16);
    const formatted = formatLicenseKey(raw);
    setLicenseKey(formatted);
  };

  const handleVerifyLicense = async () => {
    const fullKey = `HVM-${licenseKey}`;
    if (licenseKey.replace(/-/g, '').length < 16) { setError('Enter complete license key (16 characters)'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await api(`/license/verify-key?key=${encodeURIComponent(fullKey)}`);
      if (!res.success) { setError(res.message || 'Invalid license key'); setLoading(false); return; }
      if (res.data?.email !== email) { setError('This license key does not match your email'); setLoading(false); return; }

      setStep('device');
      const ua = navigator.userAgent.toLowerCase();
      const detected = ua.includes('windows') ? 'windows' : ua.includes('mac') ? 'macos' : ua.includes('linux') ? 'linux' : ua.includes('iphone') || ua.includes('ipad') ? 'ios' : ua.includes('android') ? 'android' : 'chrome';
      setPlatform(detected);
      const names = { windows: 'My Windows PC', macos: 'My Mac', linux: 'My Linux PC', ios: 'My iPhone', android: 'My Android', chrome: 'My Browser', firefox: 'My Browser' };
      setDeviceName(names[detected] || 'My Device');
    } catch (err) { setError('Verification failed'); }
    finally { setLoading(false); }
  };

  const handleActivate = async () => {
    if (!deviceName.trim()) { setError('Enter a device name'); return; }
    if (!platform) { setError('Select a platform'); return; }

    setLoading(true);
    setError('');

    const deviceId = generateDeviceId();
    const deviceType = deviceTypes[platform] || 'browser';

    try {
      const res = await registerDevice({ deviceId, deviceName: deviceName.trim(), platform, deviceType, browser: platform === 'chrome' || platform === 'firefox' ? platform : null });
      if (res.success) { setDeviceId(deviceId); login(null, getToken(), getRefreshToken()); navigate('/dashboard'); }
      else setError(res.message || 'Activation failed');
    } catch (err) { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6"><Shield className="text-orange-500" size={32} /><span className="text-2xl font-bold text-gray-900 dark:text-white">HDM Vault</span></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4"><Shield size={14} /> Device Activation</div>
          <h1 className="text-2xl font-bold mb-2">{step === 'license' ? 'Verify License Key' : 'Name Your Device'}</h1>
          <p className="text-gray-600 dark:text-gray-400">{step === 'license' ? 'Enter the 16-character key from your email' : 'Give this device a name'}</p>
          {email && <p className="text-sm text-gray-500 mt-1">{email}</p>}
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-sm text-red-600">{error}</div>}

        {step === 'license' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Key</label>
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono text-sm border-r border-gray-300 dark:border-gray-600">HVM-</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={licenseKey}
                  onChange={handleLicenseChange}
                  onPaste={handlePaste}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="flex-1 px-3 py-2.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none font-mono text-sm tracking-wider"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">Type or paste your key. Auto-formats automatically.</p>
            <Button className="w-full" onClick={handleVerifyLicense} disabled={loading}>{loading ? 'Verifying...' : 'Verify & Continue'}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Device Name" value={deviceName} onChange={(e) => { setDeviceName(e.target.value); setError(''); }} placeholder="My MacBook Pro" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button key={p.key} type="button" onClick={() => { setPlatform(p.key); setError(''); }}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all ${platform === p.key ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                      <Icon size={16} /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button className="w-full" onClick={handleActivate} disabled={loading}>{loading ? 'Activating...' : 'Activate Device'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}