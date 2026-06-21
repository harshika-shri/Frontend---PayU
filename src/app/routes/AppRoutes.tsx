import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { UserManagementPage } from '../../features/admin/pages/UserManagementPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { PurchaseOrdersView } from '../../features/purchase-orders/components/PurchaseOrdersView';
import { MailMonitoringView } from '../../features/mail-monitoring/components/MailMonitoringView';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../features/auth/constants/userRole';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}
            >
              <PurchaseOrdersView />
            </ProtectedRoute>
          }
        />

        <Route
          path="mail-monitoring"
          element={
            <ProtectedRoute requiredRole={UserRole.FINANCE_MANAGER}>
              <MailMonitoringView />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
