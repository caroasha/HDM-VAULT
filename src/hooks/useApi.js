import { useState, useCallback } from 'react';
import { getToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokens';
import { API_BASE_URL } from '../utils/constants';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    try {
      let res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (res.status === 401) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const refreshRes = await fetch(`${API_BASE_URL}/public/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success) {
              setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
              headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
              res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            }
          } else {
            clearTokens();
            window.location.href = '/login';
            return { success: false, message: 'Session expired' };
          }
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');

      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
};