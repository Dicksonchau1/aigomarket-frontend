// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('??Missing Supabase environment variables');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? 'EXISTS' : 'MISSING');
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce', // ??Added for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  }
});

// ??Add connection health check
supabase.auth.getSession().catch(err => {
  console.warn('?ая? Initial Supabase connection check failed:', err.message);
});

export default supabase;
