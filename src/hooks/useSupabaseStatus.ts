import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        setIsConnected(false);
        setIsChecking(false);
        return;
      }

      // Try a simple query to test connection
      const { error } = await supabase.from('profiles').select('count').limit(1).single();
      
      // If we get here without throwing, connection is working
      // Error code PGRST116 means "not found" which is still a successful connection
      setIsConnected(!error || error.code === 'PGRST116');
    } catch (error) {
      console.warn('Supabase connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  return { isConnected, isChecking, checkConnection };
}
