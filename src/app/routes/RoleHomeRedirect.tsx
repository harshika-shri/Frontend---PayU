import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getHomeRouteForRole } from '../../features/auth/utils/getHomeRoute';

export const RoleHomeRedirect: React.FC = () => {
  const { role } = useAuth();

  return <Navigate to={getHomeRouteForRole(role)} replace />;
};
