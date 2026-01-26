import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Components
import NavbarNew from './components/NavbarNew';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomeNew from './pages/HomeNew';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing'; // ✅ MOVED TO PUBLIC

// ✅ Email Confirmation (PUBLIC - no auth required)
import ConfirmEmail from './pages/ConfirmEmail';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import TrainingQueue from './pages/TrainingQueue';
import UploadProduct from './pages/UploadProduct';
import FounderPayment from './pages/FounderPayment';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentCancel from './pages/PaymentCancel';
import Domains from './pages/Domains';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AIGOBot from './pages/AIGOBot';
import SeedAI from './pages/SeedAI';
import OneClick from './pages/OneClick';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-white">AIGO</h2>
          <p className="text-slate-400 mt-2">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1420] text-white">
      {/* Show Navbar ONLY on public pages (when user is NOT logged in) */}
      {!user && <NavbarNew />}

      <main className="min-h-screen">
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <HomeNew />} 
          />
          
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
          />

          {/* ✅ PRICING - PUBLIC (anyone can view) */}
          <Route 
            path="/pricing" 
            element={<Pricing />} 
          />

          {/* ✅ Email Confirmation - PUBLIC (after signup) */}
          <Route 
            path="/confirm-email" 
            element={<ConfirmEmail />} 
          />

          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />

          {/* ==================== PROTECTED ROUTES ==================== */}
          
          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Marketplace & AIGO Bot */}
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/aigobot" 
            element={
              <ProtectedRoute>
                <AIGOBot />
              </ProtectedRoute>
            } 
          />

          {/* Upload & Training */}
          <Route 
            path="/upload-product" 
            element={
              <ProtectedRoute>
                <UploadProduct />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/training-queue" 
            element={
              <ProtectedRoute>
                <TrainingQueue />
              </ProtectedRoute>
            } 
          />

          {/* Compression & Export */}
          <Route 
            path="/seed-ai" 
            element={
              <ProtectedRoute>
                <SeedAI />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mobile-export" 
            element={
              <ProtectedRoute>
                <OneClick />
              </ProtectedRoute>
            } 
          />

          {/* Analytics & Support */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } 
          />

          {/* Wallet, Domains, Settings */}
          <Route 
            path="/wallet" 
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/domains" 
            element={
              <ProtectedRoute>
                <Domains />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Pricing & Payment */}
          <Route 
            path="/founder" 
            element={
              <ProtectedRoute>
                <FounderPayment />
              </ProtectedRoute>
            } 
          />

          {/* ✅ SUCCESS PAGE - PUBLIC (Stripe redirects here) */}
          <Route 
            path="/success" 
            element={<PaymentStatusPage />} 
          />

          <Route 
            path="/payment/success" 
            element={<PaymentStatusPage />} 
          />

          {/* ✅ CANCEL PAGE - PUBLIC */}
          <Route 
            path="/payment/cancel" 
            element={<PaymentCancel />} 
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;