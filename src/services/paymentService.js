import { api } from './api';

export const getPaymentMethods = () => api('/payment/methods');

export const createStripeCheckout = (data) =>
  api('/payment/stripe/create-checkout', { method: 'POST', body: JSON.stringify(data) });

export const mpesaStkPush = (data) =>
  api('/payment/mpesa/stkpush', { method: 'POST', body: JSON.stringify(data) });

export const mpesaManualConfirm = (data) =>
  api('/payment/mpesa/manual-confirm', { method: 'POST', body: JSON.stringify(data) });

export const createPayPalOrder = (data) =>
  api('/payment/paypal/create-order', { method: 'POST', body: JSON.stringify(data) });

export const capturePayPalOrder = (data) =>
  api('/payment/paypal/capture-order', { method: 'POST', body: JSON.stringify(data) });