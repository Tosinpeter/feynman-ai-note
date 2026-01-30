import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Replace these with your Supabase project credentials
// You can find these in your Supabase dashboard under Settings > API
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// Database types - extend these based on your Supabase tables
// These types match the tables created by the migrations
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          content: string;
          summary: string | null;
          key_points: string[] | null;
          source: string | null;
          language: string | null;
          image_uri: string | null;
          is_saved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          content: string;
          summary?: string | null;
          key_points?: string[] | null;
          source?: string | null;
          language?: string | null;
          image_uri?: string | null;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          content?: string;
          summary?: string | null;
          key_points?: string[] | null;
          source?: string | null;
          language?: string | null;
          image_uri?: string | null;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      handle_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
  };
};

// Type alias for Note from database
export type DbNote = Database['public']['Tables']['notes']['Row'];
export type DbNoteInsert = Database['public']['Tables']['notes']['Insert'];
export type DbNoteUpdate = Database['public']['Tables']['notes']['Update'];
