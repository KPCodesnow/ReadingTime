import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, db } from '../../../lib/supabase';
import type { User, ChildFormData } from '../../../lib/types';

interface ChildAccount {
  id: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  addChild: (childData: ChildFormData) => Promise<{ email: string; password: string }>;
  childAccounts: ChildAccount[];
  getChildPassword: (childEmail: string) => Promise<string | undefined>;
  resetChildPassword: (childEmail: string) => Promise<{ email: string; password: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockParentUser: User = {
  id: '1',
  email: 'parent@example.com',
  username: 'parent',
  role: 'parent',
  family_id: '1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);

  useEffect(() => {
    // Simulate initial auth check
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Mock login for parent@example.com
      if (email === 'parent@example.com' && password === 'welcome1234') {
        setUser(mockParentUser);
        return mockParentUser;
      }

      throw new Error('Invalid credentials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setUser(null);
      setChildAccounts([]);
    } catch (err) {
      setError('Failed to log out');
      throw err;
    }
  };

  const addChild = async (childData: ChildFormData) => {
    if (!user || user.role !== 'parent') {
      throw new Error('Only parents can add children');
    }

    const childEmail = `${childData.name.toLowerCase().replace(/\s+/g, '.')}@family.com`;
    const temporaryPassword = `welcome${Date.now().toString().slice(-4)}`;

    const newChild = {
      id: Date.now().toString(),
      email: childEmail,
      password: temporaryPassword,
    };

    setChildAccounts(prev => [...prev, newChild]);
    return { email: childEmail, password: temporaryPassword };
  };

  const getChildPassword = async (childEmail: string) => {
    const child = childAccounts.find(account => account.email === childEmail);
    return child?.password;
  };

  const resetChildPassword = async (childEmail: string) => {
    const child = childAccounts.find(account => account.email === childEmail);
    if (!child) throw new Error('Child not found');

    const newPassword = `welcome${Date.now().toString().slice(-4)}`;
    
    setChildAccounts(prev => 
      prev.map(account =>
        account.email === childEmail
          ? { ...account, password: newPassword }
          : account
      )
    );

    return { email: childEmail, password: newPassword };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      addChild,
      childAccounts,
      getChildPassword,
      resetChildPassword
    }}>
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