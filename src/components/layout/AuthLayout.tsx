import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getHomeRouteForRole } from '../../features/auth/utils/getHomeRoute';
import { Spinner } from '../ui/Spinner';
import { BrandMark } from '../ui/BrandMark';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[var(--color-sidebar)] relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.18),transparent_50%)]"
          aria-hidden
        />

        <div className="relative">
          <BrandMark size="lg" variant="light" />
        </div>

        <div className="relative space-y-4">
          <h1 className="text-3xl font-semibold text-white leading-snug tracking-tight">
            Invoice processing
            <br />
            <span className="text-slate-400">made effortless</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Automate extraction, validation, and approval workflows for purchase
            orders and invoices — all in one place.
          </p>
        </div>

        <div className="relative flex gap-8">
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

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark size="lg" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
