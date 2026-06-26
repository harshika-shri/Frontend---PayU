import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../features/auth/constants/userRole';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

// --- Lazy-loaded pages ---

// Dashboard
const DashboardPage = lazy(() =>
  import('../../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

// Command Center
const CommandCenterDashboard = lazy(() =>
  import('../../features/command-center/pages/CommandCenterDashboard').then((m) => ({ default: m.CommandCenterDashboard })),
);
const InvoiceBucketPage = lazy(() =>
  import('../../features/command-center/pages/InvoiceBucketPage').then((m) => ({ default: m.InvoiceBucketPage })),
);
const InvoiceReviewPage = lazy(() =>
  import('../../features/command-center/pages/InvoiceReviewPage').then((m) => ({ default: m.InvoiceReviewPage })),
);
const ClarificationWorkflowPage = lazy(() =>
  import('../../features/command-center/pages/ClarificationWorkflowPage').then((m) => ({ default: m.ClarificationWorkflowPage })),
);
const RejectionWorkflowPage = lazy(() =>
  import('../../features/command-center/pages/RejectionWorkflowPage').then((m) => ({ default: m.RejectionWorkflowPage })),
);

// Document Intake
const PurchaseOrdersPage = lazy(() =>
  import('../../features/purchase-orders/components/PurchaseOrdersPage').then((m) => ({ default: m.PurchaseOrdersPage })),
);
const InvoiceUploadPage = lazy(() =>
  import('../../features/invoices/pages/InvoiceUploadPage').then((m) => ({ default: m.InvoiceUploadPage })),
);
const InvoiceProcessingPage = lazy(() =>
  import('../../features/invoices/pages/InvoiceProcessingPage').then((m) => ({ default: m.InvoiceProcessingPage })),
);

// Extraction
const ExtractionReviewPage = lazy(() =>
  import('../../features/extraction-review/pages/ExtractionReviewPage').then((m) => ({ default: m.ExtractionReviewPage })),
);

// Finance Manager
const FinanceManagerWorkspace = lazy(() =>
  import('../../features/finance-manager/pages/FinanceManagerWorkspace').then((m) => ({ default: m.FinanceManagerWorkspace })),
);
const ManagerQueuePage = lazy(() =>
  import('../../features/finance-manager/pages/ManagerQueuePage').then((m) => ({ default: m.ManagerQueuePage })),
);

// Notifications + Settings
const NotificationsPage = lazy(() =>
  import('../../features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const SettingsPage = lazy(() =>
  import('../../features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

// Reports
const ReportsPage = lazy(() =>
  import('../../features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const InvoiceSummaryReport = lazy(() =>
  import('../../features/reports/pages/InvoiceSummaryReport').then((m) => ({ default: m.InvoiceSummaryReport })),
);
const VendorPerformanceReport = lazy(() =>
  import('../../features/reports/pages/VendorPerformanceReport').then((m) => ({ default: m.VendorPerformanceReport })),
);
const AssociatePerformanceReport = lazy(() =>
  import('../../features/reports/pages/AssociatePerformanceReport').then((m) => ({ default: m.AssociatePerformanceReport })),
);
const ManagerPerformanceReport = lazy(() =>
  import('../../features/reports/pages/ManagerPerformanceReport').then((m) => ({ default: m.ManagerPerformanceReport })),
);
const ProcessingStatisticsReport = lazy(() =>
  import('../../features/reports/pages/ProcessingStatisticsReport').then((m) => ({ default: m.ProcessingStatisticsReport })),
);

// Admin
const UserManagementPage = lazy(() =>
  import('../../features/admin/pages/UserManagementPage').then((m) => ({ default: m.UserManagementPage })),
);
const MailMonitoringView = lazy(() =>
  import('../../features/mail-monitoring/components/MailMonitoringView').then((m) => ({ default: m.MailMonitoringView })),
);

// 404
const NotFoundPage = lazy(() =>
  import('../../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

// Suspense fallback
const Fallback = <PageLoader />;

const CC_ROLES = [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER];

export const AppRoutes: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={Fallback}>
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
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <CommandCenterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/ready-for-approval"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceBucketPage bucket="ready-for-approval" />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/needs-review"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceBucketPage bucket="needs-review" />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/escalated"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceBucketPage bucket="escalated" />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/ready-to-pay"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceBucketPage bucket="ready-to-pay" />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/rejected"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceBucketPage bucket="rejected" />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/invoice/:invoiceId"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/invoice/:invoiceId/clarification"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <ClarificationWorkflowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="command-center/invoice/:invoiceId/rejection"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <RejectionWorkflowPage />
              </ProtectedRoute>
            }
          />

          {/* Document Intake */}
          <Route
            path="purchase-orders"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/upload"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/processing"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceProcessingPage />
              </ProtectedRoute>
            }
          />

          {/* Extraction Review */}
          <Route
            path="extraction-review"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <InvoiceProcessingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="extraction-review/:invoiceId"
            element={
              <ProtectedRoute allowedRoles={CC_ROLES}>
                <ExtractionReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Finance Manager workspace */}
          <Route
            path="finance-manager"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <FinanceManagerWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance-manager/my-escalated"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ManagerQueuePage queue="my-escalated" />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance-manager/unassigned"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ManagerQueuePage queue="unassigned" />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance-manager/my-claimed"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ManagerQueuePage queue="my-claimed" />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance-manager/rejected"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ManagerQueuePage queue="rejected" />
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
            path="reports/summary"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <InvoiceSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/vendor"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <VendorPerformanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/associate"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <AssociatePerformanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/manager"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ManagerPerformanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/processing"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FINANCE_MANAGER]}>
                <ProcessingStatisticsReport />
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

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);
