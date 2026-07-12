import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as authApi from '../api/auth';
import { getToken, setToken, clearToken } from '../lib/token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true); // true until the initial /me check resolves

  // On first load, validate any persisted token against the live session.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.fetchMe();
        if (active) setManager(me);
      } catch {
        clearToken();
        if (active) setManager(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // React to a 401 from any protected request (session ended / superseded).
  useEffect(() => {
    function onUnauthorized(e) {
      // Only surface if we thought we were logged in.
      setManager((prev) => {
        if (prev) toast.error(e.detail?.message || 'Session ended. Please log in again.');
        return null;
      });
    }
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, manager: mgr } = await authApi.login(email, password);
    setToken(token);
    setManager(mgr);
    return mgr;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear locally so the user is signed out.
    }
    clearToken();
    setManager(null);
  }, []);

  const value = {
    manager,
    isAuthenticated: Boolean(manager),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
