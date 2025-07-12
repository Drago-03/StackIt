import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_seed: string;
  role: 'guest' | 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const createProfile = useCallback(async (user: User) => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
        console.warn('Supabase not configured. Skipping profile creation.');
        return;
      }

      const avatarSeed = Math.random().toString(36).substring(7);
      const displayName = user.email?.split('@')[0] || 'User';

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: displayName,
          avatar_seed: avatarSeed,
          role: 'user',
        })
        .select()
        .single();

      if (error) {
        // If it's a conflict error (409), the profile might already exist
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          console.log('Profile already exists, fetching existing profile...');
          // Try to fetch the existing profile
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!fetchError && existingProfile) {
            setProfile(existingProfile);
            return;
          }
        }
        throw error;
      }
      setProfile(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating profile:', errorMessage, error);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
        console.warn('Supabase not configured. Skipping profile fetch.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await createProfile(user.data.user);
        }
      } else if (error) {
        console.error('Error fetching profile:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
      } else if (data) {
        setProfile(data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching profile:', errorMessage, error);
    } finally {
      setLoading(false);
    }
  }, [createProfile]);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
      console.warn('Supabase not configured. Auth disabled.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const avatarSeed = Math.random().toString(36).substring(7);
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          display_name: displayName,
          avatar_seed: avatarSeed,
          role: 'user',
        });
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };
}