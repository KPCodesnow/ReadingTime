export interface User {
  id: string;
  email: string;
  username: string;
  role: 'parent' | 'child';
  family_id: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  username: string;
  email: string;
  age: number;
  reading_level: string;
  interests: string[];
  parent_id: string;
  family_id: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface ChildFormData {
  name: string;
  age: number;
  readingInterests: string[];
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      children: {
        Row: Child;
        Insert: Omit<Child, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['children']['Insert']>;
      };
    };
    Functions: {
      create_users_table: {
        Args: Record<string, never>;
        Returns: void;
      };
      create_children_table: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
} 