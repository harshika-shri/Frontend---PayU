import React from 'react';
import { Navigate } from 'react-router-dom';

// Finance Associates access their workflows through the Command Center.
// This route redirects directly to the command center.
export const FinanceAssociatePage: React.FC = () => (
  <Navigate to="/command-center" replace />
);
