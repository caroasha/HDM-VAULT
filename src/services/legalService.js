import { api } from './api';

export const getLegal = (type) => api(`/legal/${type}`);
export const getAllLegal = () => api('/legal');