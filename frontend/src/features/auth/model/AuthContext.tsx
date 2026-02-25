import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { isAuthenticated } from '@/shared/api';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/authApi.js';
import { getStoredUser } from './authStorage.js';
import type { LoginBody, RegisterBody } from './types.js';

interface AuthState {
  user: ReturnType<typeof getStoredUser>;
  loaded: boolean;
}

interface AuthContextValue extends AuthState {
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialUser(): AuthState['user'] {
  return isAuthenticated() ? getStoredUser() : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: getInitialUser(),
    loaded: true,
  }));

  const login = useCallback(async (body: LoginBody) => {
    const res = await apiLogin(body);
    setState({ user: res.user, loaded: true });
  }, []);

  const register = useCallback(async (body: RegisterBody) => {
    const res = await apiRegister(body);
    setState({ user: res.user, loaded: true });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, loaded: true });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout }),
    [state.user, state.loaded, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
