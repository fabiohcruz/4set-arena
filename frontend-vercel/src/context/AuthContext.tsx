'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getToken: () => string | undefined;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updatePreferences: (preferences: Record<string, any>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          setAuthToken(token);
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const getToken = () => {
    return getAuthToken();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  const updatePreferences = async (preferences: Record<string, any>) => {
    try {
      await authAPI.updatePreferences(preferences);
      // Atualizar preferências no usuário atual
      if (user) {
        setUser({ ...user, preferences: { ...user.preferences, ...preferences } });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar preferências');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    getToken,
    updateProfile,
    changePassword,
    updatePreferences,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
