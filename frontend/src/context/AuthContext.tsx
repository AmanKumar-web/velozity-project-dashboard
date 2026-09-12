import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.js';
import { authApi, setAccessToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attempt initial session restore via HttpOnly refresh token cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authApi.refresh();
        setToken(data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (err) {
        // No active session cookie found
        setToken(null);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session_expired', handleSessionExpired);
  }, []);

  const login = async (email: string, password: string = 'Password123!') => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.accessToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setAccessToken(null);
      setUser(null);
    }
  };

  const switchDemoUser = async (email: string) => {
    await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
