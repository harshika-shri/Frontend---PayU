import React from 'react';
import { Mail } from 'lucide-react';
import { useMailMonitoring } from '../hooks/useMailMonitoring';
import { useProcessingInvoices } from '../hooks/useProcessingInvoices';
import { MonitoringControlPanel } from './MonitoringControlPanel';
import { ProcessingInvoicesTable } from './ProcessingInvoicesTable';

export const MailMonitoringView: React.FC = () => {
  const {
    status,
    isLoading: isStatusLoading,
    isToggling,
    startMonitoring,
    stopMonitoring,
  } = useMailMonitoring();

  const {
    invoices,
    total,
    isLoading: isInvoicesLoading,
  } = useProcessingInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-slate-500" />
          Mail Monitoring
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Control Gmail monitoring and review invoices currently being processed.
        </p>
      </div>

      <MonitoringControlPanel
        status={status}
        isLoading={isStatusLoading}
        isToggling={isToggling}
        onStart={startMonitoring}
        onStop={stopMonitoring}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Invoices In Process
          </h2>
          <span className="text-xs text-slate-500">{total} active</span>
        </div>
        <ProcessingInvoicesTable
          invoices={invoices}
          isLoading={isInvoicesLoading}
        />
      </div>
    </div>
  );
};
