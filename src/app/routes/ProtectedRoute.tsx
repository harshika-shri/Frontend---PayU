import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { UserRole } from '../../features/auth/constants/userRole';
import { getHomeRouteForRole } from '../../features/auth/utils/getHomeRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const homeRoute = getHomeRouteForRole(role);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={homeRoute} replace />;
  }

  if (requiredRole && !allowedRoles && role !== requiredRole) {
    return <Navigate to={homeRoute} replace />;
  }

  return <>{children}</>;
};
