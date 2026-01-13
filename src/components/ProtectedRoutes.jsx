import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar'; // This expects 'export default Sidebar'

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Use the standardized auth check
  return user ? (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* This renders Dashboard, Wallet, Settings, etc. */}
          <Outlet />
        </main>
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default ProtectedRoutes;