import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { FinanceAssociateDashboard } from '../components/FinanceAssociateDashboard';
import { FinanceManagerDashboard } from '../components/FinanceManagerDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  if (role === UserRole.FINANCE_ASSOCIATE) {
    return <FinanceAssociateDashboard />;
  }

  if (role === UserRole.FINANCE_MANAGER) {
    return <FinanceManagerDashboard />;
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
      <h2 className="text-2xl font-semibold text-slate-800">Dashboard</h2>
      <p className="mt-2 text-slate-500">
        Welcome to your dashboard. Select an option from the sidebar to continue.
      </p>
    </div>
  );
};
