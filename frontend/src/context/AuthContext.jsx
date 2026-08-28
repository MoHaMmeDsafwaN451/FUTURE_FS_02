import { createContext, useEffect, useState } from 'react';
import { getMe, login as loginRequest, register as registerRequest, updateProfile as updateProfileRequest } from '../services/authService';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('crm-auth') || 'null'));
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!auth?.token) return setLoading(false); getMe(auth.token).then(({ user }) => setAuth((current) => ({ ...current, user }))).catch(() => { localStorage.removeItem('crm-auth'); setAuth(null); }).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => { const next = await loginRequest(email, password); localStorage.setItem('crm-auth', JSON.stringify(next)); setAuth(next); };
  const register = async (name, email, password) => { const next = await registerRequest(name, email, password); localStorage.setItem('crm-auth', JSON.stringify(next)); setAuth(next); };
  const updateProfile = async (profile) => { const { user } = await updateProfileRequest(auth.token, profile); const next = { ...auth, user }; localStorage.setItem('crm-auth', JSON.stringify(next)); setAuth(next); };
  const logout = () => { localStorage.removeItem('crm-auth'); setAuth(null); };
  return <AuthContext.Provider value={{ auth, loading, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>;
}
