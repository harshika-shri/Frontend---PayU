import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { queryClient } from '../lib/queryClient';
import { sseManager } from '../lib/sseManager';
import { useAuth } from '../features/auth/hooks/useAuth';

// Inner component that has access to the auth context
const AppInner: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      sseManager.connect();
    } else {
      sseManager.disconnect();
    }
    return () => {
      sseManager.disconnect();
    };
  }, [isAuthenticated]);

  return <AppRoutes />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
                fontSize: '0.875rem',
                padding: '10px 14px',
              },
              success: {
                iconTheme: { primary: '#16a34a', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#dc2626', secondary: '#fff' },
              },
            }}
          />
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
