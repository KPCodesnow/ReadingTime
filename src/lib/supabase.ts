import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  users: {
    async getById(id: string) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return null;
        }
        return data;
      } catch (error) {
        console.error('Error in getById:', error);
        return null;
      }
    },

    async createParentUser(id: string, email: string) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            id,
            email,
            username: email.split('@')[0],
            role: 'parent',
            family_id: id,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating parent user:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in createParentUser:', error);
        throw error;
      }
    },

    async updateUser(id: string, userData: Partial<Database['public']['Tables']['users']['Update']>) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
  },

  children: {
    async getByParentId(parentId: string) {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentId);

        if (error) {
          console.error('Error fetching children:', error);
          return [];
        }
        return data;
      } catch (error) {
        console.error('Error in getByParentId:', error);
        return [];
      }
    },

    async create(childData: Omit<Database['public']['Tables']['children']['Insert'], 'id'>) {
      try {
        const { data, error } = await supabase
          .from('children')
          .insert(childData)
          .select()
          .single();

        if (error) {
          console.error('Error creating child:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in create:', error);
        throw error;
      }
    },

    async updateChild(id: string, childData: Partial<Database['public']['Tables']['children']['Update']>) {
      try {
        const { data, error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating child:', error);
        throw error;
      }
    },

    async updatePassword(id: string, password: string) {
      try {
        const { data, error } = await supabase
          .from('children')
          .update({ password })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating password:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in updatePassword:', error);
        throw error;
      }
    },
  },
};

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
}; 