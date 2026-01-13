import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingState from '../components/LoadingState';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        toast.success('Successfully signed in!');
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed');
      navigate('/');
    }
  };

  return <LoadingState message="Completing authentication..." />;
}