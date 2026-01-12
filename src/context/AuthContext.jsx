import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleNewUserSignIn = useCallback(async (user) => {
    try {
      console.log('🔵 Handling user sign-in:', user.id);
      
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, membership_status, created_at')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Database fetch error:', fetchError);
        return; // Don't throw, just return
      }

      // NEW USER
      if (!existingUser) {
        console.log('🟢 New user - creating profile...');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            username: user.email.split('@')[0],
            membership_status: 'pending',
            tokens: 0,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          return;
        }

        toast.success('Welcome! Complete your setup.');
        // Use history navigation instead of hard redirect
        window.history.pushState({}, '', '/payment/founder');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      // EXISTING USER
      console.log('🔵 Existing user, status:', existingUser.membership_status);
      
      if (existingUser.membership_status === 'pending') {
        toast('Please complete your payment', { icon: '💳' });
        window.history.pushState({}, '', '/payment/founder');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      if (existingUser.membership_status === 'active') {
        toast.success('Welcome back!');
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

    } catch (error) {
      console.error('❌ Error in handleNewUserSignIn:', error);
      toast.error('Authentication error. Please try again.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          setLoading(false); // ✅ Always set loading to false
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) {
          setLoading(false); // ✅ Set loading false even on error
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (isMounted) {
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
        }

        // Handle new sign-ins
        if (event === 'SIGNED_IN' && session?.user) {
          await handleNewUserSignIn(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleNewUserSignIn]);

  const signUp = async (email, password, fullName = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName || email.split('@')[0]
          },
        },
      });
      if (error) throw error;
      toast.success('Account created! Check your email to verify.');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      
      toast.success('Signing in...');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Signed out successfully');
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};