import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// FIX: Added .jsx extension to force exact resolution
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// ============================================
// EAGER LOADED COMPONENTS (Critical)
// ============================================
import HomeNew from './pages/HomeNew';
import AuthCallback from './pages/AuthCallback';

// ============================================
// LAZY LOADED COMPONENTS (Code Splitting)
// ============================================

// Public Pages
const Docs = lazy(() => import('./pages/Docs'));
const FounderPayment = lazy(() => import('./pages/Payment/Founder'));

// Dashboard Layout & Pages
const DashboardLayout = lazy(() => import('./pages/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Architect = lazy(() => import('./pages/Architect'));
const AIVerificationGuard = lazy(() => import('./pages/AIVerificationGuard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Settings = lazy(() => import('./pages/Settings'));
const Domains = lazy(() => import('./pages/Domains'));
const OneClick = lazy(() => import('./pages/OneClick'));
const SeedAI = lazy(() => import('./pages/SeedAI'));
const UploadProduct = lazy(() => import('./pages/UploadProduct'));

// ============================================
// LOADING FALLBACK
// ============================================
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  const { loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ============================================ */}
          {/* PUBLIC ROUTES */}
          {/* ============================================ */}

          {/* Main Landing Page */}
          <Route path="/" element={<HomeNew />} />

          {/* Public Documentation */}
          <Route path="/docs" element={<Docs />} />

          {/* OAuth Callback Handler */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Founder Payment Page */}
          <Route path="/payment/founder" element={<FounderPayment />} />

          {/* ============================================ */}
          {/* PROTECTED DASHBOARD ROUTES */}
          {/* ============================================ */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Marketplace */}
            <Route path="marketplace" element={<Marketplace />} />

            {/* AI Tools */}
            <Route path="architect" element={<Architect />} />
            <Route path="verification-guard" element={<AIVerificationGuard />} />
            <Route path="seed-ai" element={<SeedAI />} />

            {/* Development Tools */}
            <Route path="domains" element={<Domains />} />
            <Route path="one-click" element={<OneClick />} />

            {/* User Management */}
            <Route path="wallet" element={<Wallet />} />
            <Route path="settings" element={<Settings />} />

            {/* Upload Product */}
            <Route path="upload" element={<UploadProduct />} />
          </Route>

          {/* ============================================ */}
          {/* ERROR ROUTES */}
          {/* ============================================ */}

          {/* 404 Not Found */}
          <Route
            path="/404"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;