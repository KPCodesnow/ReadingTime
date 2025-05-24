export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'parent' | 'child';
          family_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      children: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['children']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['children']['Insert']>;
      };
    };
    Functions: {
      create_users_table: {
        Args: Record<string, never>;
        Returns: void;
      };
      create_function_if_not_exists: {
        Args: {
          function_name: string;
          function_body: string;
        };
        Returns: void;
      };
    };
  };
}; 