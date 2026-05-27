import { api } from './api';

export const loginUser = (email, password, rememberMe = false) =>
  api('/public/auth/login', { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) });

export const registerUser = (data) =>
  api('/public/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const verifyEmail = (token) =>
  api('/public/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });

export const forgotPassword = (email) =>
  api('/public/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token, newPassword) =>
  api('/public/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });

export const complete2FA = (tempToken, code) =>
  api('/public/auth/2fa/complete', { method: 'POST', body: JSON.stringify({ tempToken, code }) });

export const getProfile = () => api('/user/profile');

export const updateProfile = (data) =>
  api('/user/profile', { method: 'PUT', body: JSON.stringify(data) });

export const changePassword = (currentPassword, newPassword) =>
  api('/user/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });

export const setup2FA = () => api('/user/2fa/setup', { method: 'POST' });

export const verify2FA = (token) =>
  api('/user/2fa/verify', { method: 'POST', body: JSON.stringify({ token }) });

export const disable2FA = (token) =>
  api('/user/2fa/disable', { method: 'POST', body: JSON.stringify({ token }) });