'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, UserRole, AuthResponse } from '@/services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const DEFAULT_OPERATIONS_PROFILE: UserProfile = {
  id: 'usr_rtmac_engineer',
  email: 'engineer@nwisdemo.com',
  fullName: 'Senior Drilling Engineer',
  role: 'Drilling Engineer',
  status: 'Active',
  createdAt: '2026-01-15T08:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<UserProfile | null>(DEFAULT_OPERATIONS_PROFILE);
  const [loading] = useState<boolean>(false);

  const refreshUser = async () => {};

  const signIn = async (): Promise<AuthResponse> => {
    return { success: true, user: DEFAULT_OPERATIONS_PROFILE };
  };

  const signUp = async (): Promise<AuthResponse> => {
    return { success: true, user: DEFAULT_OPERATIONS_PROFILE };
  };

  const signOut = async (): Promise<void> => {};

  const resetPassword = async (): Promise<AuthResponse> => {
    return { success: true, message: 'Password reset email sent.' };
  };

  const updatePassword = async (): Promise<AuthResponse> => {
    return { success: true, message: 'Password updated.' };
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return true;
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (): boolean => {
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: true,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        hasRole,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
