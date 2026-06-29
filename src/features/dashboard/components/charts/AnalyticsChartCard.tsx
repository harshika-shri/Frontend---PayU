import React from 'react';
import { FileText } from 'lucide-react';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { ErrorState } from '../../../../components/ui/ErrorState';

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({
  title,
  description,
  loading,
  isError,
  onRetry,
  empty,
  emptyText = 'No data available',
  children,
  className = '',
}) => (
  <div className={`rounded-lg border border-[var(--color-border)] bg-white p-5 ${className}`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {title}
    </p>
    {description && (
      <p className="mt-1 text-[11px] text-[var(--color-muted-foreground)]">{description}</p>
    )}

    <div className="mt-4">
      {loading ? (
        <Skeleton className="h-52 w-full rounded" />
      ) : isError ? (
        <div className="h-52 flex items-center justify-center">
          <ErrorState kind="generic" title="Unable to load chart" onRetry={onRetry} />
        </div>
      ) : empty ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
          <FileText className="h-8 w-8 opacity-30" />
          <p className="text-sm">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export const chartHasData = (values?: number[]): boolean =>
  Boolean(values?.some((value) => value > 0));

export const STATUS_COLORS: Record<string, string> = {
  'Ready for Approval': '#16a34a',
  'Needs Review': '#d97706',
  'Ready to Pay': '#1d4ed8',
  Overdue: '#9333ea',
  Rejected: '#dc2626',
  Resolved: '#16a34a',
  Recovered: '#0284c7',
  Escalated: '#d97706',
};

export const MUTED_CHART_COLORS = [
  '#1d4ed8',
  '#64748b',
  '#0f766e',
  '#7c3aed',
  '#b45309',
  '#0369a1',
  '#475569',
];

export const colorForLabel = (label: string, index: number): string =>
  STATUS_COLORS[label] ?? MUTED_CHART_COLORS[index % MUTED_CHART_COLORS.length];
