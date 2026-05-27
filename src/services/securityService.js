import { api } from './api';

export const runFullScan = () =>
  api('/security/full-scan', { method: 'POST' });

export const getLatestScan = () => api('/security/scan-results');

export const getScanHistory = (page = 1) =>
  api(`/security/scan-history?page=${page}&limit=10`);

export const getScan = (id) => api(`/security/scan/${id}`);