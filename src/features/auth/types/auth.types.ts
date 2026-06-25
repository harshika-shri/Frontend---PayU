import type { UserRole } from '../constants/userRole';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
