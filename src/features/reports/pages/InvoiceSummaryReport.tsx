import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Banknote, XCircle, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ReportFilterPanel } from '../components/ReportFilterPanel';
import { useReportSummary } from '../hooks/useReports';
import type { ReportFilters } from '../types/report.types';

const STAT_CARDS = [
  { key: 'total_invoices', label: 'Total Invoices', icon: <FileText className="h-4 w-4 text-[var(--color-primary)]" />, bg: 'bg-[var(--color-primary-muted)]' },
  { key: 'under_review', label: 'Under Review', icon: <TrendingUp className="h-4 w-4 text-[var(--color-warning)]" />, bg: 'bg-[var(--color-warning-muted)]' },
  { key: 'ready_to_pay', label: 'Ready to Pay', icon: <Banknote className="h-4 w-4 text-[var(--color-success)]" />, bg: 'bg-[var(--color-success-muted)]' },
  { key: 'rejected', label: 'Rejected', icon: <XCircle className="h-4 w-4 text-[var(--color-destructive)]" />, bg: 'bg-[var(--color-destructive-muted)]' },
  { key: 'escalated', label: 'Escalated', icon: <CheckCircle2 className="h-4 w-4 text-[var(--color-info)]" />, bg: 'bg-[var(--color-info-muted)]' },
] as const;

export const InvoiceSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data, isLoading, isError, refetch } = useReportSummary(filters);

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Reports
      </button>
      <PageHeader
        title="Invoice Summary"
        description="Platform-wide invoice volume and status breakdown."
        className="mb-5"
      />

      <div className="max-w-3xl space-y-5">
        <ReportFilterPanel filters={filters} onChange={setFilters} />

        {isError ? (
          <ErrorState kind="generic" onRetry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map(({ key, label, icon, bg }) => (
              <Card key={key} className="flex flex-col items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                  {icon}
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 rounded" />
                ) : (
                  <p className="text-2xl font-semibold tabular-nums text-[var(--color-foreground)]">
                    {data?.[key] ?? 0}
                  </p>
                )}
                <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
