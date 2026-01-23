import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { TokenProvider } from './context/TokenContext';
import { PaymentProvider } from './context/PaymentProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TokenProvider>
        <PaymentProvider>
          <App />
          <Toaster position="top-right" />
        </PaymentProvider>
      </TokenProvider>
    </AuthProvider>
  </React.StrictMode>
);
