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
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "merchant" | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "merchant" | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "merchant" | null;
        };
      };
      videos: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          url: string;
          thumbnail_url: string | null;
          user_id: string;
          status: "processing" | "published" | "failed";
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          url: string;
          thumbnail_url?: string | null;
          user_id: string;
          status?: "processing" | "published" | "failed";
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          url?: string;
          thumbnail_url?: string | null;
          user_id?: string;
          status?: "processing" | "published" | "failed";
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
