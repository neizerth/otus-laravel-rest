export type UserRole = 'customer' | 'performer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
