import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cwhthtgynavwinpbjplt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aHRodGd5bmF2d2lucGJqcGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjE3MTAsImV4cCI6MjA1MTg5NzcxMH0.f_cf7dKkW9fn_wEb-z24-VG3g4ELiHl3hqC77AW-8LQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-cwhthtgynavwinpbjplt-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

export default supabase;