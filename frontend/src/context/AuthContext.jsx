import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { attachToken } from '../lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bytelink_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    attachToken(token);
    api
      .get('/api/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        attachToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem(STORAGE_KEY, token);
    attachToken(token);
    setUser(userData);
  };

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/login', credentials);
      saveSession(response.data.token, response.data.user);
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to login. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/signup', userData);
      saveSession(response.data.token, response.data.user);
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to create account. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    attachToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({ user, loading, authError, login, signup, logout, setAuthError }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
