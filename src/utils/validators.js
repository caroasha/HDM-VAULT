export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s()-]/g, '');
  if (!/^\+?\d{7,15}$/.test(cleaned)) return 'Invalid phone number';
  return null;
};