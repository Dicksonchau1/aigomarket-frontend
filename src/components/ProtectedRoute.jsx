import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireMembership = true,
  requireCreator = false,
  requireAdmin = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Require membership
  if (requireMembership && user?.membership_status !== 'active') {
    return <Navigate to="/payment/founder" replace />;
  }

  // Require creator status
  if (requireCreator && !user?.is_creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Creator Access Required
          </h1>
          <p className="text-gray-600">
            This feature is only available to creators.
          </p>
        </div>
      </div>
    );
  }

  // Require admin status
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Admin Access Required
          </h1>
          <p className="text-gray-600">
            This feature is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;