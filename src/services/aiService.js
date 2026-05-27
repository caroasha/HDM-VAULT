import { api } from './api';

export const getAIStatus = () => api('/ai/status');

export const sendAIChat = (message, conversationId) =>
  api('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId })
  });

export const getSecurityOverview = () => api('/ai/security/overview');

export const getActiveAlerts = () => api('/ai/security/alerts');

export const sendCommand = (command) =>
  api('/ai/command', {
    method: 'POST',
    body: JSON.stringify({ command })
  });

export const generateReport = (reportType = 'security_overview') =>
  api('/ai/report/generate', {
    method: 'POST',
    body: JSON.stringify({ reportType })
  });