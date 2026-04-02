import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (token && user) {
      setAdmin(JSON.parse(user));
      api.get('/admin/verify').catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/admin/login', { username, password });
    localStorage.setItem('adminToken', res.data.token);
    localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  // ✅ Allows updating admin info (name etc.) from anywhere
  const updateAdmin = (updates) => {
    const updated = { ...admin, ...updates };
    localStorage.setItem('adminUser', JSON.stringify(updated));
    setAdmin(updated);
  };

  return (
    <AuthContext.Provider value={{ admin, setAdmin: updateAdmin, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
