import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with fallback values for development
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using demo mode.');
}

export const supabase = createClient(url, key);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_seed: string;
          role: 'guest' | 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_seed: string;
          role?: 'guest' | 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_seed?: string;
          role?: 'guest' | 'user' | 'admin';
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          usage_count: number;
          created_at: string;
        };
      };
      questions: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string;
          author_id: string;
          accepted_answer_id: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      question_tags: {
        Row: {
          question_id: string;
          tag_id: string;
        };
      };
      answers: {
        Row: {
          id: string;
          content: string;
          question_id: string;
          author_id: string;
          vote_score: number;
          is_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          answer_id: string;
          vote_type: 'up' | 'down';
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'new_answer' | 'comment' | 'mention' | 'answer_accepted';
          title: string;
          message: string;
          read: boolean;
          question_id: string | null;
          answer_id: string | null;
          created_at: string;
        };
      };
    };
  };
};