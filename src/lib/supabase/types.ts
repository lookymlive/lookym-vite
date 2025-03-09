export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          public: boolean;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
        };
      };
    };
  };
}
