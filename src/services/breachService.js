import { api } from './api';

export const checkEmail = (email) =>
  api('/breaches/check', { method: 'POST', body: JSON.stringify({ email }) });

export const getBreachHistory = (page = 1) =>
  api(`/breaches/history?page=${page}&limit=10`);

export const getLatestBreach = () => api('/breaches/latest');