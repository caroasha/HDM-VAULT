import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, Tablet, MapPin, Clock, Shield, Wifi, WifiOff, Lock, Unlock, Trash2, RefreshCw, Laptop } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { getDevices, removeDevice, lockDevice, updateDevice } from '../../services/deviceService';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

const iconMap = { desktop: Monitor, mobile: Smartphone, tablet: Tablet, browser: Globe, laptop: Laptop };
const osIcons = { windows: '🪟', macos: '🍎', linux: '🐧', ios: '📱', android: '🤖', chrome: '🌐', firefox: '🦊' };

export default function Devices() {
  const { addToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await getDevices();
      if (res.success) setDevices(res.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { loadDevices(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
    addToast('Device list refreshed');
  };

  const handleRemove = async (device) => {
    if (!confirm(`Remove ${device.deviceName}?`)) return;
    try {
      await removeDevice(device._id);
      addToast('Device removed');
      await loadDevices();
      setDetailOpen(false);
    } catch (err) { addToast('Failed to remove device', 'error'); }
  };

  const handleLock = async (device) => {
    try {
      const res = await lockDevice(device._id);
      addToast(device.locked ? 'Device unlocked' : 'Device locked');
      await loadDevices();
      if (res.success) setSelectedDevice(res.data || { ...device, locked: !device.locked });
    } catch (err) { addToast('Failed', 'error'); }
  };

  const handleTrust = async (device) => {
    try {
      await updateDevice(device._id, { trusted: !device.trusted });
      addToast(device.trusted ? 'Device untrusted' : 'Device trusted');
      await loadDevices();
    } catch (err) { addToast('Failed', 'error'); }
  };

  const openDetail = (device) => {
    setSelectedDevice(device);
    setDetailOpen(true);
  };

  const getStatusColor = (device) => {
    if (device.locked) return 'red';
    if (!device.online) return 'gray';
    if (device.trusted) return 'green';
    return 'blue';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devices</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? <Spinner /> : devices.length === 0 ? (
        <Card><CardBody className="text-center py-12"><Smartphone size={48} className="text-gray-300 mx-auto mb-4" /><p className="font-medium mb-2">No Devices Registered</p><p className="text-sm text-gray-500">Devices appear here when you log in from a new device</p></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.map(device => {
            const Icon = iconMap[device.deviceType] || Monitor;
            const statusColor = getStatusColor(device);
            return (
              <Card key={device._id} hover className="p-4 cursor-pointer" onClick={() => openDetail(device)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${device.online ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Icon size={20} className={device.online ? 'text-green-500' : 'text-gray-400'} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{device.deviceName}</p>
                    <p className="text-xs text-gray-500">
                      {osIcons[device.platform] || ''} {device.platform} {device.osVersion || ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge color={device.online ? 'green' : 'gray'}>{device.online ? 'Online' : 'Offline'}</Badge>
                  {device.trusted && <Badge color="blue">Trusted</Badge>}
                  {device.locked && <Badge color="red">Locked</Badge>}
                  <Badge color="orange">{device.deviceType}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={10} /> {formatRelativeTime(device.lastSeenAt)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Device Details">
        {selectedDevice && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedDevice.online ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {React.createElement(iconMap[selectedDevice.deviceType] || Monitor, { size: 32, className: selectedDevice.online ? 'text-green-500' : 'text-gray-400' })}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedDevice.deviceName}</h3>
                <p className="text-sm text-gray-500">{osIcons[selectedDevice.platform] || ''} {selectedDevice.platform} {selectedDevice.osVersion || ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Device ID</p>
                <p className="font-mono text-xs truncate">{selectedDevice.deviceId}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">App Version</p>
                <p>{selectedDevice.appVersion || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">IP Address</p>
                <p className="font-mono text-xs">{selectedDevice.ipAddress || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="flex items-center gap-1"><MapPin size={12} /> {selectedDevice.location || 'Unknown'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">First Seen</p>
                <p className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(selectedDevice.firstSeenAt)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                <p className="flex items-center gap-1"><Clock size={12} /> {formatRelativeTime(selectedDevice.lastSeenAt)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => handleLock(selectedDevice)}>
                {selectedDevice.locked ? <Unlock size={14} className="mr-1" /> : <Lock size={14} className="mr-1" />}
                {selectedDevice.locked ? 'Unlock' : 'Lock'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleTrust(selectedDevice)}>
                <Shield size={14} className="mr-1" /> {selectedDevice.trusted ? 'Untrust' : 'Trust'}
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleRemove(selectedDevice)}>
                <Trash2 size={14} className="mr-1" /> Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React from 'react';