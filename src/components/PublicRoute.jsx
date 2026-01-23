import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && user?.membership_status === 'active') {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated but pending payment
  if (isAuthenticated && user?.membership_status === 'pending') {
    return <Navigate to="/payment/founder" replace />;
  }

  return children;
};

export default PublicRoute;
