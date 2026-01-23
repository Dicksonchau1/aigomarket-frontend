import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1420]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ?? SECOND SECURITY LAYER: Layout-level protection
  if (!user) {
    console.log('?? DashboardLayout: No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('??DashboardLayout: Rendering for user:', user.email);

  // User is authenticated - render full dashboard layout
  return (
    <div className="flex min-h-screen bg-[#0f1420]">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
