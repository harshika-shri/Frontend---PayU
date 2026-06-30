import React from 'react';
import { Mail } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useMailMonitoring } from '../hooks/useMailMonitoring';
import { useRecentMail } from '../hooks/useRecentMail';
import { MonitoringControlPanel } from './MonitoringControlPanel';
import { RecentMailTable } from './RecentMailTable';

export const MailMonitoringView: React.FC = () => {
  const {
    status,
    isLoading: isStatusLoading,
    isToggling,
    startMonitoring,
    stopMonitoring,
    fetchStatus,
  } = useMailMonitoring();

  const {
    items,
    total,
    isLoading: isMailLoading,
    fetchMail,
  } = useRecentMail();

  const handleStart = async () => {
    await startMonitoring();
    await fetchMail();
  };

  const handleStop = async () => {
    await stopMonitoring();
    await fetchStatus();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mail Monitoring"
        description="Control Gmail monitoring and review recently processed mailbox activity."
      />

      <MonitoringControlPanel
        status={status}
        isLoading={isStatusLoading}
        isToggling={isToggling}
        onStart={handleStart}
        onStop={handleStop}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wide flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Recent Mail Activity
          </h2>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {total} processed
          </span>
        </div>
        <RecentMailTable items={items} isLoading={isMailLoading} />
      </div>
    </div>
  );
};
