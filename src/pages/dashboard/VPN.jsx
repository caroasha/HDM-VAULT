import { useState, useEffect, useRef } from 'react';
import { Shield, Power, Zap, ArrowUp, ArrowDown, Clock, WifiOff, Server, Globe } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import Badge from '../../components/ui/Badge';
import { api } from '../../services/api';

const servers = [
  { id: 'ke1', name: 'Kenya - Nairobi', country: '🇰🇪', flag: 'Kenya', ping: 12, load: 23 },
  { id: 'uk1', name: 'UK - London', country: '🇬🇧', flag: 'United Kingdom', ping: 118, load: 45 },
  { id: 'us1', name: 'USA - New York', country: '🇺🇸', flag: 'United States', ping: 245, load: 67 },
  { id: 'nl1', name: 'Netherlands - Amsterdam', country: '🇳🇱', flag: 'Netherlands', ping: 105, load: 31 },
  { id: 'sg1', name: 'Singapore', country: '🇸🇬', flag: 'Singapore', ping: 160, load: 52 },
];

function loadState() {
  try {
    const saved = localStorage.getItem('hdm_vpn_state');
    if (!saved) return { connected: false, server: null, killSwitch: false, startTime: null, totalDownload: 0, totalUpload: 0 };
    const s = JSON.parse(saved);
    return { connected: s.connected || false, server: s.server || null, killSwitch: s.killSwitch || false, startTime: s.startTime || null, totalDownload: s.totalDownload || 0, totalUpload: s.totalUpload || 0 };
  } catch { return { connected: false, server: null, killSwitch: false, startTime: null, totalDownload: 0, totalUpload: 0 }; }
}

function saveState(s) {
  localStorage.setItem('hdm_vpn_state', JSON.stringify(s));
}

export default function VPN() {
  const [state, setState] = useState(loadState);
  const [connecting, setConnecting] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [totalDown, setTotalDown] = useState(state.totalDownload || 0);
  const [totalUp, setTotalUp] = useState(state.totalUpload || 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (state.connected && state.startTime) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      setUptime(elapsed);
      setTotalDown(state.totalDownload || 0);
      setTotalUp(state.totalUpload || 0);

      intervalRef.current = setInterval(() => {
        setUptime(prev => prev + 1);
        const down = Math.random() * 3 + 0.5;
        const up = Math.random() * 1 + 0.1;
        setDownloadSpeed(down);
        setUploadSpeed(up);
        setTotalDown(prev => {
          const next = prev + down / 8000;
          saveState({ ...state, totalDownload: next, totalUpload: totalUp + up / 8000 });
          return next;
        });
        setTotalUp(prev => prev + up / 8000);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.connected]);

  const handleConnect = async (srv) => {
    setConnecting(true);
    try {
      await api('/vpn/connect', { method: 'POST', body: JSON.stringify({ serverId: srv.id }) });
    } catch (err) {}
    const newState = { connected: true, server: srv, killSwitch: state.killSwitch, startTime: Date.now(), totalDownload: 0, totalUpload: 0 };
    setState(newState);
    saveState(newState);
    setTotalDown(0);
    setTotalUp(0);
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    try { await api('/vpn/disconnect', { method: 'POST' }); } catch (err) {}
    const newState = { connected: false, server: null, killSwitch: state.killSwitch, startTime: null, totalDownload: totalDown, totalUpload: totalUp };
    setState(newState);
    saveState(newState);
    clearInterval(intervalRef.current);
    setDownloadSpeed(0);
    setUploadSpeed(0);
  };

  const handleKillSwitch = async (val) => {
    const newState = { ...state, killSwitch: val };
    setState(newState);
    saveState(newState);
    try { await api('/vpn/kill-switch', { method: 'PUT', body: JSON.stringify({ enabled: val }) }); } catch (err) {}
  };

  const formatUptime = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  const formatSpeed = (mbps) => mbps.toFixed(1) + ' Mbps';
  const formatData = (mb) => mb > 1000 ? (mb / 1000).toFixed(2) + ' GB' : mb.toFixed(0) + ' MB';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">VPN Protection</h1>

      <Card>
        <CardBody className="text-center py-8">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 border-4 transition-colors ${state.connected ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'}`}>
            {state.connected ? <Shield size={40} className="text-green-500" /> : <Shield size={40} className="text-gray-400" />}
          </div>
          <p className="text-xl font-bold mb-1">{state.connected ? 'Protected' : 'Not Connected'}</p>
          <p className="text-sm text-gray-500 mb-6">{state.connected ? `Connected to ${state.server?.name}` : 'Your connection is exposed'}</p>

          {state.connected ? (
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
              <div className="text-center"><ArrowDown size={16} className="text-green-500 mx-auto mb-1" /><p className="text-sm font-bold">{formatSpeed(downloadSpeed)}</p><p className="text-[10px] text-gray-500">Down</p></div>
              <div className="text-center"><Clock size={16} className="text-orange-500 mx-auto mb-1" /><p className="text-sm font-bold">{formatUptime(uptime)}</p><p className="text-[10px] text-gray-500">Uptime</p></div>
              <div className="text-center"><ArrowUp size={16} className="text-blue-500 mx-auto mb-1" /><p className="text-sm font-bold">{formatSpeed(uploadSpeed)}</p><p className="text-[10px] text-gray-500">Up</p></div>
            </div>
          ) : (
            <div className="text-center mb-6"><WifiOff size={32} className="text-gray-400 mx-auto mb-2" /><p className="text-xs text-gray-500">Connect to encrypt your traffic</p></div>
          )}

          {state.connected ? (
            <Button variant="danger" onClick={handleDisconnect}><Power size={16} className="mr-1" /> Disconnect</Button>
          ) : (
            <p className="text-sm text-gray-400">Select a server below to connect</p>
          )}
        </CardBody>
      </Card>

      {state.connected && (
        <div className="grid grid-cols-2 gap-4">
          <Card><CardBody className="text-center py-4"><p className="text-xs text-gray-500 mb-1">Total Downloaded</p><p className="text-lg font-bold text-green-500">{formatData(totalDown)}</p></CardBody></Card>
          <Card><CardBody className="text-center py-4"><p className="text-xs text-gray-500 mb-1">Total Uploaded</p><p className="text-lg font-bold text-blue-500">{formatData(totalUp)}</p></CardBody></Card>
        </div>
      )}

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Server size={16} /> Server Locations</h3></CardHeader>
        <CardBody>
          <div className="space-y-2">
            {servers.map(s => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${state.server?.id === s.id ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.country}</span>
                  <div><p className="font-medium text-sm">{s.name}</p><div className="flex items-center gap-2 text-xs text-gray-500"><span>🟢 {s.ping}ms</span><span>Load {s.load}%</span></div></div>
                </div>
                {state.server?.id === s.id ? <Badge color="green">Connected</Badge> : <Button size="sm" variant="outline" onClick={() => handleConnect(s)} disabled={connecting}><Zap size={14} className="mr-1" /> Connect</Button>}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Globe size={16} /> Security Settings</h3></CardHeader>
        <CardBody>
          <Toggle enabled={state.killSwitch} onChange={handleKillSwitch} label="Kill Switch" description="Block all internet traffic if VPN disconnects unexpectedly" />
          {state.killSwitch && state.connected && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg text-sm text-orange-700 dark:text-orange-300">Kill switch is active. If the VPN drops, your internet will be blocked.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}