import { api, setAuthToken, clearAuthToken } from '@/shared/api';
import { setStoredUser, clearStoredUser } from '../model/authStorage.js';
import type { AuthResponse, LoginBody, RegisterBody } from '../model/types.js';

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/register', body);
  setAuthToken(res.token);
  setStoredUser(res.user);
  return res;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/login', body);
  setAuthToken(res.token);
  setStoredUser(res.user);
  return res;
}

export async function logout(): Promise<void> {
  clearAuthToken();
  clearStoredUser();
}
