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

// Helper function to generate a random password
const generatePassword = () => `welcome${Date.now().toString().slice(-4)}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const handleAuthChange = async (session: any) => {
      if (!mounted) return;

      try {
        if (!session?.user) {
          setUser(null);
          setChildAccounts([]);
          return;
        }

        const userData = await db.users.getById(session.user.id);
        if (!mounted) return;

        if (!userData) {
          setUser(null);
          setError('User data not found');
          return;
        }

        setUser(userData);

        if (userData.role === 'parent') {
          const children = await db.children.getByParentId(userData.id);
          if (mounted) {
            setChildAccounts(children.map(child => ({
              id: child.id,
              email: child.email,
              password: child.password
            })));
          }
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setChildAccounts([]);
          setError('Failed to fetch user data');
        }
      } finally {
        if (mounted && !isInitialized) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await handleAuthChange(session);
          
          // Only set up the subscription after initial session check
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            handleAuthChange(session);
          });
          authSubscription = subscription;
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize auth');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);

      // For parent@example.com, try to create the account first
      if (email === 'parent@example.com') {
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: 'parent' } }
        }).catch(() => {
          // Ignore error if user already exists
        });
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Login failed');

      let userData = await db.users.getById(data.user.id);
      
      if (!userData && email === 'parent@example.com') {
        userData = await db.users.createParentUser(data.user.id, email);
      }

      if (!userData) {
        throw new Error('User account not found');
      }

      return userData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (err) {
      setError('Failed to log out');
      throw err;
    }
  };

  const getChildPassword = async (childEmail: string) => {
    const child = childAccounts.find(account => account.email === childEmail);
    return child?.password;
  };

  const resetChildPassword = async (childEmail: string) => {
    const child = childAccounts.find(account => account.email === childEmail);
    if (!child) throw new Error('Child not found');

    const newPassword = generatePassword();
    await db.children.updatePassword(child.id, newPassword);

    setChildAccounts(prev => 
      prev.map(account =>
        account.email === childEmail
          ? { ...account, password: newPassword }
          : account
      )
    );

    return { email: childEmail, password: newPassword };
  };

  const addChild = async (childData: ChildFormData) => {
    if (!user || user.role !== 'parent') {
      throw new Error('Only parents can add children');
    }

    const childEmail = `${childData.name.toLowerCase().replace(/\s+/g, '.')}@family.com`;
    const temporaryPassword = generatePassword();

    const newChild = await db.children.create({
      username: childData.name,
      email: childEmail,
      age: childData.age,
      reading_level: 'beginner',
      interests: childData.readingInterests,
      parent_id: user.id,
      family_id: user.family_id,
      password: temporaryPassword
    });

    setChildAccounts(prev => [...prev, {
      id: newChild.id,
      email: childEmail,
      password: temporaryPassword
    }]);

    return { email: childEmail, password: temporaryPassword };
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