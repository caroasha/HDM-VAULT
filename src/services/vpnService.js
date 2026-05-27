import { api } from './api';

export const getVPNStatus = () => api('/vpn/status');

export const connectVPN = (serverId) =>
  api('/vpn/connect', { method: 'POST', body: JSON.stringify({ serverId }) });

export const disconnectVPN = () =>
  api('/vpn/disconnect', { method: 'POST' });

export const toggleKillSwitch = (enabled) =>
  api('/vpn/kill-switch', { method: 'PUT', body: JSON.stringify({ enabled }) });