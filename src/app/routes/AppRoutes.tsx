import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../features/auth/constants/userRole';

// Feature pages
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { CommandCenterDashboard } from '../../features/command-center/pages/CommandCenterDashboard';
import { InvoiceBucketPage } from '../../features/command-center/pages/InvoiceBucketPage';
import { InvoiceReviewPage } from '../../features/command-center/pages/InvoiceReviewPage';
import { PurchaseOrdersPage } from '../../features/purchase-orders/components/PurchaseOrdersPage';
import { InvoiceUploadPage } from '../../features/invoices/pages/InvoiceUploadPage';
import { InvoiceProcessingPage } from '../../features/invoices/pages/InvoiceProcessingPage';
import { ExtractionReviewPage } from '../../features/extraction-review/pages/ExtractionReviewPage';
import { MailMonitoringView } from '../../features/mail-monitoring/components/MailMonitoringView';
import { UserManagementPage } from '../../features/admin/pages/UserManagementPage';
import { FinanceAssociatePage } from '../../features/finance-associate/pages/FinanceAssociatePage';
import { FinanceManagerPage } from '../../features/finance-manager/pages/FinanceManagerPage';
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage';
import { ReportsPage } from '../../features/reports/pages/ReportsPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      {/* Protected */}
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
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Command Center */}
        <Route
          path="command-center"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <CommandCenterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/ready-for-approval"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceBucketPage bucket="ready-for-approval" />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/needs-review"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceBucketPage bucket="needs-review" />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/escalated"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceBucketPage bucket="escalated" />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/ready-to-pay"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceBucketPage bucket="ready-to-pay" />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/rejected"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceBucketPage bucket="rejected" />
            </ProtectedRoute>
          }
        />
        <Route
          path="command-center/invoice/:invoiceId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <InvoiceReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Document Intake */}
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <PurchaseOrdersPage />
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
          path="invoices/processing"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
              <InvoiceProcessingPage />
            </ProtectedRoute>
          }
        />

        {/* Extraction Review — list + detail */}
        <Route
          path="extraction-review"
          element={
            <ProtectedRoute allowedRoles={[UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER]}>
              <ExtractionReviewListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="extraction-review/:invoiceId"
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
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Inline extraction review list — redirect to processing for now
const ExtractionReviewListPage: React.FC = () => {
  return <InvoiceProcessingPage />;
};
