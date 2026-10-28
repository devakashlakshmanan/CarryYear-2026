import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('carryyear_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('carryyear_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (localStorage.getItem('carryyear_token')) {
        const userData = await authApi.getMe();
        setUser(userData);
        localStorage.setItem('carryyear_user', JSON.stringify(userData));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('carryyear_token');
      localStorage.removeItem('carryyear_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    const tokenData = await authApi.login(payload);
    setToken(tokenData.access_token);
    setUser(tokenData.user);
    localStorage.setItem('carryyear_token', tokenData.access_token);
    localStorage.setItem('carryyear_user', JSON.stringify(tokenData.user));
  };

  const register = async (payload: RegisterPayload) => {
    const tokenData = await authApi.register(payload);
    setToken(tokenData.access_token);
    setUser(tokenData.user);
    localStorage.setItem('carryyear_token', tokenData.access_token);
    localStorage.setItem('carryyear_user', JSON.stringify(tokenData.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('carryyear_token');
    localStorage.removeItem('carryyear_user');
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
