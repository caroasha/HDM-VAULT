const ACCESS_KEY = 'hdm_access_token';
const REFRESH_KEY = 'hdm_refresh_token';
const USER_KEY = 'hdm_user';
const DEVICE_KEY = 'hdm_device_id';

export const getToken = () => localStorage.getItem(ACCESS_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getDeviceId = () => localStorage.getItem(DEVICE_KEY);

export const setDeviceId = (id) => {
  localStorage.setItem(DEVICE_KEY, id);
};

export const generateDeviceId = () => {
  return 'hdm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11);
};