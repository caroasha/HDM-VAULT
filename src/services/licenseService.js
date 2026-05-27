import { api } from './api';

export const getLicenseUsage = () => api('/license/usage');

export const calculateUpgrade = () =>
  api('/license/upgrade/calculate', { method: 'POST' });

export const confirmUpgrade = (paymentMethod) =>
  api('/license/upgrade/confirm', { method: 'POST', body: JSON.stringify({ paymentMethod }) });