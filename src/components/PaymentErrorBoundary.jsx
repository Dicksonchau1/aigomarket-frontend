import React from 'react';
import { XCircle, RefreshCw, Home } from 'lucide-react';

export class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Payment Error Boundary Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0f172a] border-2 border-red-500/20 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
            
            <p className="text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred during payment processing'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mb-6 p-4 bg-slate-900 rounded-lg text-left">
                <p className="text-xs text-slate-500 font-mono overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}