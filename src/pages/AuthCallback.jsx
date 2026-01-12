import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Let AuthContext handle the redirect logic
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-slate-400">Please wait while we set up your account</p>
      </div>
    </div>
  );
}