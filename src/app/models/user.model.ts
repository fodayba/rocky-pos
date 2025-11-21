export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  active: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}
