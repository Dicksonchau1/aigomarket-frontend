import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔐 Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      // Get current session (safe method)
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setSession(null);
        setUser(null);
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email/password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await createUserProfile(data.user, fullName);
      }

      return data;
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      throw error;
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ GitHub sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  // Create user profile in database
  const createUserProfile = async (user, fullName) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        display_name: fullName || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        is_founder: false,
        created_at: new Date().toISOString(),
      };

      // Try profiles table first
      let { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      // Fallback to users table
      if (profileError && profileError.code === '42P01') {
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            username: fullName || user.email?.split('@')[0],
            is_founder: false,
            created_at: new Date().toISOString(),
          }]);

        if (userError) console.error('❌ User profile creation error:', userError);
      } else if (profileError) {
        console.error('❌ Profile creation error:', profileError);
      }

      // Create wallet
      await createUserWallet(user.id);
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
    }
  };

  // Create user wallet
  const createUserWallet = async (userId) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: 0,
          created_at: new Date().toISOString(),
        }]);

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('❌ Wallet creation error:', error);
      }
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGithub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};