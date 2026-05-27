import { api } from './api';

export const checkUrl = (url) =>
  api(`/threats/check?url=${encodeURIComponent(url)}`);

export const getThreatLogs = (page = 1, filter = {}) => {
  const params = new URLSearchParams({ page, limit: 20, ...filter });
  return api(`/threats/logs?${params}`);
};

export const getThreatSummary = () => api('/threats/summary');