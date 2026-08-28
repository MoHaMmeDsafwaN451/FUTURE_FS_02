import { api } from './api';
export const login = (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (name, email, password) => api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
export const getMe = (token) => api('/auth/me', { token });
export const updateProfile = (token, profile) => api('/auth/me', { token, method: 'PUT', body: JSON.stringify(profile) });
