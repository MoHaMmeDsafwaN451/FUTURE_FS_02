import { createContext, useEffect, useState } from 'react';
import { getMe, login as loginRequest } from '../services/authService';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('crm-auth') || 'null'));
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!auth?.token) return setLoading(false); getMe(auth.token).then(({ user }) => setAuth((current) => ({ ...current, user }))).catch(() => { localStorage.removeItem('crm-auth'); setAuth(null); }).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => { const next = await loginRequest(email, password); localStorage.setItem('crm-auth', JSON.stringify(next)); setAuth(next); };
  const logout = () => { localStorage.removeItem('crm-auth'); setAuth(null); };
  return <AuthContext.Provider value={{ auth, loading, login, logout }}>{children}</AuthContext.Provider>;
}
