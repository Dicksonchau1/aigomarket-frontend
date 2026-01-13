import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { TokenProvider } from './context/TokenContext';
import { PaymentProvider } from './context/PaymentContext';

// Components
import LoadingState from './components/LoadingState';
import { PaymentErrorBoundary } from './components/PaymentErrorBoundary';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthModal from './components/AuthModal';
import NavbarNew from './components/NavbarNew';

// Pages
import AuthCallback from './pages/AuthCallback';
const HomeNew = lazy(() => import('./pages/HomeNew'));
const About = lazy(() => import('./pages/About'));
const Docs = lazy(() => import('./pages/Docs'));
const Benchmark = lazy(() => import('./pages/Benchmark'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FounderPayment = lazy(() => import('./pages/FounderPayment'));
const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const EditProject = lazy(() => import('./pages/EditProject'));
const Datasets = lazy(() => import('./pages/Datasets'));
const Models = lazy(() => import('./pages/Models'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Support = lazy(() => import('./pages/Support'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Error Fallback UI
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0f172a] border-2 border-red-500/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{error?.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-3">
          <button onClick={resetErrorBoundary} className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition">
            Try Again
          </button>
          <button onClick={() => window.location.href = '/'} className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENT: AppRoutes
 * Pass the handleOpenAuthModal function down to every page that needs it.
 */
function AppRoutes({ onOpenAuth }) {
  return (
    <Routes>
      {/* Public Pages - All receive onOpenAuthModal prop */}
      <Route path="/" element={<HomeNew onOpenAuthModal={onOpenAuth} />} />
      <Route path="/about" element={<About onOpenAuthModal={onOpenAuth} />} />
      <Route path="/docs" element={<Docs onOpenAuthModal={onOpenAuth} />} />
      <Route path="/benchmark" element={<Benchmark onOpenAuthModal={onOpenAuth} />} />
      <Route path="/pricing" element={<Pricing onOpenAuthModal={onOpenAuth} />} />
      <Route path="/marketplace" element={<Marketplace onOpenAuthModal={onOpenAuth} />} />
      <Route path="/support" element={<Support onOpenAuthModal={onOpenAuth} />} />

      {/* Auth callback for Social logins */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Payments */}
      <Route path="/founder" element={
        <PaymentErrorBoundary>
          <FounderPayment />
        </PaymentErrorBoundary>
      } />
      
      <Route path="/payment/status" element={
        <PaymentErrorBoundary>
          <PaymentStatusPage />
        </PaymentErrorBoundary>
      } />
      
      {/* Dashboard - Protected Layout with Sidebar */}
      <Route path="/dashboard" element={<ProtectedRoutes />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/create" element={<CreateProject />} />
        <Route path="projects/edit/:id" element={<EditProject />} />
        <Route path="datasets" element={<Datasets />} />
        <Route path="models" element={<Models />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  /**
   * GLOBAL MODAL HANDLER
   * This is the function that fixes the "o is not a function" error.
   */
  const handleOpenAuthModal = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.href = '/'}>
      <BrowserRouter>
        <AuthProvider>
          <TokenProvider>
            <PaymentProvider>
              {/* Navbar - Fixed globally */}
              <NavbarNew onOpenAuthModal={handleOpenAuthModal} />

              <Suspense fallback={<LoadingState message="Loading AIGO..." />}>
                <AppRoutes onOpenAuth={handleOpenAuthModal} />
              </Suspense>

              {/* Global Auth Modal - Only one instance to prevent "Processing" hangs */}
              <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialMode={authMode} 
              />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '16px',
                  },
                }}
              />
            </PaymentProvider>
          </TokenProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;