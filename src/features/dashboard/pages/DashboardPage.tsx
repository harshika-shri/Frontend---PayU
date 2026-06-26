import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { FinanceAssociateDashboard } from '../components/FinanceAssociateDashboard';
import { FinanceManagerDashboard } from '../components/FinanceManagerDashboard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role === UserRole.FINANCE_ASSOCIATE) {
    return <FinanceAssociateDashboard />;
  }

  if (role === UserRole.FINANCE_MANAGER) {
    return <FinanceManagerDashboard />;
  }

  // Admin / unknown role fallback
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to PayU Finance."
      />
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-8 text-center max-w-md">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select an option from the sidebar to get started.
        </p>
        {role === UserRole.ADMIN && (
          <Button
            className="mt-4"
            size="sm"
            onClick={() => navigate('/admin/users')}
          >
            User Management
          </Button>
        )}
      </div>
    </div>
  );
};
