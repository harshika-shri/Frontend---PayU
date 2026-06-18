import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';
import { normalizeRole } from '../constants/userRole';
import type { AuthContextType, DecodedToken } from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<AuthContextType['role']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setRole(normalizeRole(decoded.role));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Invalid token', error);
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setIsAuthenticated(false);
      setRole(null);
    }
  };

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      initAuth(token);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authService.login(username, password);
    Cookies.set('access_token', data.access_token, { secure: window.location.protocol === 'https:', sameSite: 'lax' });
    Cookies.set('refresh_token', data.refresh_token, { secure: window.location.protocol === 'https:', sameSite: 'lax' });
    initAuth(data.access_token);
  };

  const logout = async () => {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
