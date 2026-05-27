import { api } from './api';

export const getBackups = (page = 1) =>
  api(`/backup?page=${page}&limit=10`);

export const createManualBackup = () =>
  api('/backup/manual', { method: 'POST' });

export const downloadBackup = async (id) => {
  const token = localStorage.getItem('hdm_access_token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/backup/download/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Download failed');
  return res.text();
};

export const restoreBackup = (backupId, data) =>
  api('/backup/restore', {
    method: 'POST',
    body: JSON.stringify({ backupId, data })
  });

export const deleteBackup = (id) =>
  api(`/backup/${id}`, { method: 'DELETE' });