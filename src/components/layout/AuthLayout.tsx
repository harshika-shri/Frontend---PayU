import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Spinner } from '../ui/Spinner';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[var(--color-sidebar)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-primary)]">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-base font-semibold text-white tracking-tight">PayU Finance</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white leading-snug">
            Invoice Processing
            <br />
            <span className="text-slate-400">made effortless</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Automate extraction, validation, and approval workflows for purchase orders and invoices — all in one place.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { stat: '99%', label: 'Extraction accuracy' },
            { stat: '<5s', label: 'Per document' },
            { stat: '100%', label: 'Audit trail' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-xl font-semibold text-white">{stat}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
