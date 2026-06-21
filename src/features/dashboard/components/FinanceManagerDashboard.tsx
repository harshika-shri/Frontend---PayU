import React from 'react';
import { Mail } from 'lucide-react';
import { useMailMonitoring } from '../../mail-monitoring/hooks/useMailMonitoring';
import { useProcessingInvoices } from '../../mail-monitoring/hooks/useProcessingInvoices';
import { DEFAULT_MONITORING_EMAIL } from '../../mail-monitoring/constants/defaultEmail';
import { DashboardQuickLink } from './DashboardQuickLink';

export const FinanceManagerDashboard: React.FC = () => {
  const { status, isLoading: isStatusLoading } = useMailMonitoring();
  const { invoices, total, isLoading: isInvoicesLoading } = useProcessingInvoices({
    enablePolling: false,
  });

  const isMonitoring = status?.is_monitoring ?? false;
  const pendingExtractionCount = invoices.filter((invoice) =>
    ['pending', 'ocr_processing'].includes(invoice.extraction_status),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of invoice mail monitoring and processing activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Monitoring
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {isStatusLoading ? '—' : isMonitoring ? 'Active' : 'Stopped'}
          </p>
          <p className="mt-1 text-xs text-slate-400 truncate">{DEFAULT_MONITORING_EMAIL}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            In Process
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {isInvoicesLoading ? '—' : total}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pending Extraction
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {isInvoicesLoading ? '—' : pendingExtractionCount}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <DashboardQuickLink
          to="/mail-monitoring"
          title="Mail Monitoring"
          description="Start or stop Gmail monitoring and review all invoices currently in process."
          icon={<Mail className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};
