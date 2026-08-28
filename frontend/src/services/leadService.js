import { api } from './api';
export const getLeads = (token, query = '') => api(`/leads${query}`, { token });
export const getStats = (token) => api('/leads/stats', { token });
export const createLead = (token, lead) => api('/leads', { token, method: 'POST', body: JSON.stringify(lead) });
export const updateLead = (token, id, lead) => api(`/leads/${id}`, { token, method: 'PUT', body: JSON.stringify(lead) });
export const removeLead = (token, id) => api(`/leads/${id}`, { token, method: 'DELETE' });
