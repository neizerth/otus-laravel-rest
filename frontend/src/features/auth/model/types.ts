import type { User } from '@/entities/user';

export interface AuthResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'customer' | 'performer';
}
