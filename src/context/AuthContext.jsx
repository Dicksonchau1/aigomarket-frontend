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

  // ✅ DEFINE FUNCTION BEFORE useEffect (using useCallback)
  const handleNewUserSignIn = useCallback(async (user) => {
    try {
      console.log('🔵 Handling user sign-in:', user.id);
      
      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, membership_status, created_at')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Database fetch error:', fetchError);
        throw fetchError;
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
          throw insertError;
        }

        toast.success('Welcome! Complete your setup.');
        setTimeout(() => {
          window.location.href = '/payment/founder';
        }, 500);
        return;
      }

      // EXISTING USER
      console.log('🔵 Existing user, status:', existingUser.membership_status);
      
      if (existingUser.membership_status === 'pending') {
        toast('Please complete your payment', { icon: '💳' });
        setTimeout(() => {
          window.location.href = '/payment/founder';
        }, 500);
        return;
      }

      if (existingUser.membership_status === 'active') {
        toast.success('Welcome back!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
        return;
      }

      // Default
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (error) {
      console.error('❌ Error in handleNewUserSignIn:', error);
      toast.error('Authentication error. Please try again.');
    }
  }, []); // Empty dependency array since it doesn't depend on state

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);

        // Handle new sign-ins
        if (event === 'SIGNED_IN' && session?.user) {
          await handleNewUserSignIn(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleNewUserSignIn]); // ✅ Include in dependency array

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
      window.location.href = '/';
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