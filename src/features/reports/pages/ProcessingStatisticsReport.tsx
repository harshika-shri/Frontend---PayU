import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingDown } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ReportFilterPanel } from '../components/ReportFilterPanel';
import { useReportPerformance } from '../hooks/useReports';
import type { ReportFilters } from '../types/report.types';

const toHoursLabel = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
};

export const ProcessingStatisticsReport: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data, isLoading, isError, refetch } = useReportPerformance(filters);

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Reports
      </button>
      <PageHeader
        title="Processing Statistics"
        description="Average time to approve and reject invoices across the platform."
        className="mb-5"
      />

      <div className="max-w-2xl space-y-5">
        <ReportFilterPanel filters={filters} onChange={setFilters} />

        {isError ? (
          <ErrorState kind="generic" onRetry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-success-muted)]">
                <Clock className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <p className="text-3xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {toHoursLabel(data?.avg_approval_time_hours ?? 0)}
                </p>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Avg. Approval Time
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  From submission to approval
                </p>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-destructive-muted)]">
                <TrendingDown className="h-5 w-5 text-[var(--color-destructive)]" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <p className="text-3xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {toHoursLabel(data?.avg_rejection_time_hours ?? 0)}
                </p>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Avg. Rejection Time
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  From submission to rejection
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
