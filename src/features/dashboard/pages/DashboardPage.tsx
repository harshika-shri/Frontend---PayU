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
        description="Welcome back. Select an option from the navigation to get started."
      />
      <div className="max-w-md">
        {role === UserRole.ADMIN && (
          <Button size="sm" onClick={() => navigate('/admin/users')}>
            User Management
          </Button>
        )}
      </div>
    </div>
  );
};
