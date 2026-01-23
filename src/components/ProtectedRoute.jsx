import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-accent-cyan animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm font-outfit">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // 🔒 FIRST SECURITY LAYER: Route-level protection
  if (!user) {
    console.log('🔒 ProtectedRoute: No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated:', user.email);
  return children;
}