import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthModel } from 'pocketbase';

import {
  loginWithEmail,
  logout as logoutService,
  registerWithEmail,
  requestPasswordReset as requestPasswordResetService,
  updateUserProfile,
} from '@/src/services/authService';
import { pb } from '@/src/services/pocketbase';

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  favoriteClubId?: string;
  preferredEarnMethods?: string[];
  onboardingGoal?: string;
  selectedStarterPath?: string;
};

type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  username?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateProfile: (input: { name?: string; username?: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const USERS_COLLECTION = 'users';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (pb.authStore.isValid) {
          await pb.collection(USERS_COLLECTION).authRefresh();
          setUser(normalizeUser(getAuthModel()));
        } else {
          pb.authStore.clear();
          setUser(null);
        }
      } catch {
        if (__DEV__) {
          console.warn('Session restore failed');
        }
        pb.authStore.clear();
        setUser(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    restoreSession();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(token && model ? normalizeUser(model) : null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const record = await loginWithEmail(email, password);
      setUser(normalizeUser(record));
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to propagate to UI
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      await registerWithEmail(input);
      const record = await loginWithEmail(input.email, input.password);
      setUser(normalizeUser(record));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (pb.authStore.isValid && user) {
        const record = await pb.collection(USERS_COLLECTION).getOne(user.id);
        setUser(normalizeUser(record));
      }
    } catch {
      if (__DEV__) {
        console.warn('Refresh user failed');
      }
    }
  };

  const requestPasswordReset = async (email: string) => {
    await requestPasswordResetService(email);
  };

  const updateProfile = async (input: { name?: string; username?: string; avatar?: string }) => {
    setIsLoading(true);
    try {
      const record = await updateUserProfile(input);
      setUser(normalizeUser(record));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    register,
    refreshUser,
    requestPasswordReset,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getAuthModel() {
  return (
    (pb.authStore as unknown as { record?: AuthModel | null; model?: AuthModel | null }).record ??
    pb.authStore.model
  );
}

function normalizeUser(model?: AuthModel | null): AuthUser | null {
  if (!model) return null;
  return {
    id: model.id,
    email: String(model.email ?? ''),
    username: typeof model.username === 'string' ? model.username : undefined,
    name: typeof model.name === 'string' ? model.name : undefined,
    avatar: typeof model.avatar === 'string' ? model.avatar : undefined,
    onboardingCompleted: model.onboardingCompleted === true,
    onboardingCompletedAt: typeof model.onboardingCompletedAt === 'string' ? model.onboardingCompletedAt : undefined,
    favoriteClubId: typeof model.favoriteClubId === 'string' ? model.favoriteClubId : undefined,
    preferredEarnMethods: normalizeStringArray(model.preferredEarnMethods),
    onboardingGoal: typeof model.onboardingGoal === 'string' ? model.onboardingGoal : undefined,
    selectedStarterPath: typeof model.selectedStarterPath === 'string' ? model.selectedStarterPath : undefined,
  };
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : undefined;
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return undefined;
}
