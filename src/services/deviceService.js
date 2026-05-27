import { api } from './api';

export const getDevices = () => api('/devices');

export const registerDevice = (data) =>
  api('/devices', { method: 'POST', body: JSON.stringify(data) });

export const updateDevice = (id, data) =>
  api(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const removeDevice = (id) =>
  api(`/devices/${id}`, { method: 'DELETE' });

export const lockDevice = (id) =>
  api(`/devices/${id}/lock`, { method: 'PUT' });