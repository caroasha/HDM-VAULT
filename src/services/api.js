import { getToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokens';
import { API_BASE_URL } from '../utils/constants';

export const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  let res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/public/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.success) {
          setTokens(data.data.accessToken, data.data.refreshToken);
          headers.Authorization = `Bearer ${data.data.accessToken}`;
          res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        }
      } else {
        clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};