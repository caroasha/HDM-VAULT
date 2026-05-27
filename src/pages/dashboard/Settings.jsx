import { useState, useEffect } from 'react';
import { User, Lock, CreditCard, Palette, FileText, Shield, QrCode, Check, X } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, changePassword, setup2FA, verify2FA, disable2FA } from '../../services/authService';
import { getLegal } from '../../services/publicService';
import { useToast } from '../../components/ui/Toast';

function LegalInline() {
  const [doc, setDoc] = useState(null);
  const [tab, setTab] = useState('terms');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLegal(tab).then(res => {
      if (res.success) setDoc(res.data?.content || res.data?.publishedContent || '<p>Not available</p>');
    }).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['terms','privacy','cookies'].map(k => (
          <Button key={k} variant={tab === k ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(k)} className="capitalize">{k === 'terms' ? 'Terms of Service' : k === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'}</Button>
        ))}
      </div>
      {loading ? <Spinner /> : <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: doc }} />}
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pass, setPass] = useState({ current: '', newPass: '' });

  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled || false);
  const [twoFAStep, setTwoFAStep] = useState('idle');
  const [twoFAData, setTwoFAData] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');

  const tabs = [
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'security', icon: Lock, label: 'Security' },
    { key: 'billing', icon: CreditCard, label: 'Plan & Billing' },
    { key: 'appearance', icon: Palette, label: 'Appearance' },
    { key: 'legal', icon: FileText, label: 'Legal' },
  ];

  const handleProfileUpdate = async () => {
    await updateProfile(profile);
    updateUser({...user, ...profile});
    addToast('Profile updated');
  };

  const handlePasswordChange = async () => {
    if (!pass.current || !pass.newPass) { addToast('Fill both fields', 'warning'); return; }
    await changePassword(pass.current, pass.newPass);
    addToast('Password changed');
    setPass({ current: '', newPass: '' });
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const res = await setup2FA();
      if (res.success) {
        setTwoFAData(res.data);
        setTwoFAStep('verify');
      } else {
        setTwoFAError(res.message || 'Setup failed');
      }
    } catch (err) {
      setTwoFAError('Something went wrong');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6) { setTwoFAError('Enter 6-digit code'); return; }
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const res = await verify2FA(twoFACode);
      if (res.success) {
        setTwoFAEnabled(true);
        setTwoFAStep('idle');
        setTwoFAData(null);
        setTwoFACode('');
        updateUser({...user, twoFactorEnabled: true});
        addToast('2FA enabled');
      } else {
        setTwoFAError(res.message || 'Invalid code');
      }
    } catch (err) {
      setTwoFAError('Verification failed');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (twoFACode.length !== 6) { setTwoFAError('Enter 6-digit code to disable'); return; }
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const res = await disable2FA(twoFACode);
      if (res.success) {
        setTwoFAEnabled(false);
        setTwoFAStep('idle');
        setTwoFACode('');
        updateUser({...user, twoFactorEnabled: false});
        addToast('2FA disabled');
      } else {
        setTwoFAError(res.message || 'Invalid code');
      }
    } catch (err) {
      setTwoFAError('Verification failed');
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => <Button key={t.key} variant={tab === t.key ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t.key)}><t.icon size={14} className="mr-1" /> {t.label}</Button>)}
      </div>
      <Card>
        <CardBody>
          {tab === 'profile' && (
            <div className="space-y-3">
              <Input label="Full Name" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
              <Input label="Phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              <Button onClick={handleProfileUpdate}>Save</Button>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Change Password</h3>
                <div className="space-y-3">
                  <Input label="Current Password" type="password" value={pass.current} onChange={e => setPass({...pass, current: e.target.value})} />
                  <Input label="New Password" type="password" value={pass.newPass} onChange={e => setPass({...pass, newPass: e.target.value})} />
                  <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">{twoFAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}</p>
                  </div>
                  <Badge color={twoFAEnabled ? 'green' : 'gray'}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>

                {twoFAStep === 'idle' && !twoFAEnabled && (
                  <Button onClick={handleSetup2FA} disabled={twoFALoading}>
                    <Shield size={14} className="mr-1" /> Setup 2FA
                  </Button>
                )}

                {twoFAStep === 'verify' && twoFAData && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium">Scan this QR code with your authenticator app:</p>
                    <div className="bg-white p-2 rounded-lg inline-block">
                      <img src={twoFAData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-gray-500 break-all">Secret: {twoFAData.secret}</p>
                    <Input
                      label="Enter 6-digit code from your app"
                      value={twoFACode}
                      onChange={e => { setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTwoFAError(''); }}
                      placeholder="000000"
                      maxLength={6}
                      error={twoFAError}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleVerify2FA} disabled={twoFALoading || twoFACode.length !== 6}>
                        <Check size={14} className="mr-1" /> Verify & Enable
                      </Button>
                      <Button variant="ghost" onClick={() => { setTwoFAStep('idle'); setTwoFAData(null); setTwoFACode(''); setTwoFAError(''); }}>
                        <X size={14} className="mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {twoFAEnabled && (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">2FA is active on your account.</p>
                    <Input
                      label="Enter 6-digit code to disable"
                      value={twoFACode}
                      onChange={e => { setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTwoFAError(''); }}
                      placeholder="000000"
                      maxLength={6}
                      error={twoFAError}
                    />
                    <Button variant="danger" onClick={handleDisable2FA} disabled={twoFALoading || twoFACode.length !== 6}>
                      Disable 2FA
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-3">
              <p className="text-sm">Manage your plan and billing history.</p>
              <Button onClick={() => window.location.href = '/dashboard/pricing'}>View Plans</Button>
            </div>
          )}

          {tab === 'appearance' && (
            <Toggle enabled={localStorage.getItem('hdm_theme') === 'dark'} onChange={v => { localStorage.setItem('hdm_theme', v ? 'dark' : 'light'); window.location.reload(); }} label="Dark Mode" />
          )}

          {tab === 'legal' && <LegalInline />}
        </CardBody>
      </Card>
    </div>
  );
}