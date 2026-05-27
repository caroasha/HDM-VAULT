import { API_BASE_URL } from '../utils/constants';

const publicApi = async (endpoint) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getSiteInfo = () => publicApi('/public/content/site-info');
export const getHero = () => publicApi('/public/content/hero');
export const getFeatures = () => publicApi('/public/content/features');
export const getFaqs = () => publicApi('/public/content/faqs');
export const getTestimonials = () => publicApi('/public/content/testimonials');
export const getFooter = () => publicApi('/public/content/footer');
export const getPlans = () => publicApi('/public/plans');
export const getPaymentMethods = () => publicApi('/public/payment/methods');
export const getCurrency = () => publicApi('/public/payment/currency');
export const getDownloads = () => publicApi('/public/content/downloads');
export const getLegal = (type) => publicApi(`/public/content/legal/${type}`);

export const sendAIChat = async (message, visitorId, conversationId) => {
  const res = await fetch(`${API_BASE_URL}/public/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, visitorId, conversationId: conversationId || null })
  });
  const data = await res.json();
  return data;
};