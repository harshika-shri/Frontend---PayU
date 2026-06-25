import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../features/auth/constants/userRole';

// Feature pages
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { PurchaseOrdersView } from '../../features/purchase-orders/components/PurchaseOrdersView';
import { MailMonitoringView } from '../../features/mail-monitoring/components/MailMonitoringView';
import { UserManagementPage } from '../../features/admin/pages/UserManagementPage';
import { InvoiceUploadPage } from '../../features/invoices/pages/InvoiceUploadPage';
import { ExtractionReviewPage } from '../../features/extraction-review/pages/ExtractionReviewPage';
import { FinanceAssociatePage } from '../../features/finance-associate/pages/FinanceAssociatePage';
import { FinanceManagerPage } from '../../features/finance-manager/pages/FinanceManagerPage';
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage';
import { ReportsPage } from '../../features/reports/pages/ReportsPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard — all roles */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Notifications — all roles */}
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Settings — all roles */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Documents */}
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <PurchaseOrdersView />
            </ProtectedRoute>
          }
        />

        <Route
          path="invoices/upload"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceUploadPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="extraction-review"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <ExtractionReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Workflow */}
        <Route
          path="finance/associate"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <FinanceAssociatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="finance/manager"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
              <FinanceManagerPage />
            </ProtectedRoute>
          }
        />

        {/* System */}
        <Route
          path="mail-monitoring"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
              <MailMonitoringView />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
