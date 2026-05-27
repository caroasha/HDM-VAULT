export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const PLAN_TIERS = {
  trial: 'Free Trial',
  standard: 'HDM Vault Standard',
  pro: 'HDM Vault Pro+'
};

export const ROLES = {
  superAdmin: 'Super Admin',
  orgOwner: 'Organization Owner',
  orgAdmin: 'Admin',
  orgUser: 'User'
};

export const DEVICE_TYPES = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  browser: 'Browser'
};

export const THREAT_TYPES = {
  url_blocked: 'URL Blocked',
  phishing_detected: 'Phishing Detected',
  malware_detected: 'Malware Detected',
  download_blocked: 'Download Blocked'
};

export const SEVERITY_COLORS = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
};