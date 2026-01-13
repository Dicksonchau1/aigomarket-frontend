import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-slate-400 text-lg">{message}</p>
    </div>
  );
}

export default LoadingState;