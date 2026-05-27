import { api } from './api';

export const getItems = (page = 1, search = '', folderId = null) => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (search) params.append('search', search);
  if (folderId) params.append('folderId', folderId);
  return api(`/vault/items?${params}`);
};

export const createItem = (data) =>
  api('/vault/items', { method: 'POST', body: JSON.stringify(data) });

export const updateItem = (id, data) =>
  api(`/vault/items/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteItem = (id) =>
  api(`/vault/items/${id}`, { method: 'DELETE' });

export const shareItem = (id, email, permission = 'read') =>
  api(`/vault/items/${id}/share`, { method: 'POST', body: JSON.stringify({ email, permission }) });

export const getFolders = () => api('/folders');

export const createFolder = (data) =>
  api('/folders', { method: 'POST', body: JSON.stringify(data) });

export const updateFolder = (id, data) =>
  api(`/folders/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteFolder = (id) =>
  api(`/folders/${id}`, { method: 'DELETE' });

export const exportVault = () => api('/vault/export');

export const importVault = (items) =>
  api('/vault/import', { method: 'POST', body: JSON.stringify({ items }) });