import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Banknote,
  XCircle,
  LayoutDashboard,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useDashboardSummary } from '../hooks/useDashboard';
import type { DashboardBucket } from '../types/dashboard.types';

interface BucketCard {
  bucket: DashboardBucket;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string;
}

const BUCKETS: BucketCard[] = [
  {
    bucket: 'ready-for-approval',
    label: 'Ready for Approval',
    description: 'Invoices that passed validation and await approval.',
    icon: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
    iconBg: 'bg-[var(--color-success-muted)]',
    href: '/command-center/ready-for-approval',
  },
  {
    bucket: 'needs-review',
    label: 'Needs Review',
    description: 'Invoices flagged during validation that require attention.',
    icon: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
    iconBg: 'bg-[var(--color-warning-muted)]',
    href: '/command-center/needs-review',
  },
  {
    bucket: 'escalated',
    label: 'Escalated',
    description: 'Invoices escalated to a manager for decision.',
    icon: <TrendingUp className="h-5 w-5 text-[var(--color-info)]" />,
    iconBg: 'bg-[var(--color-info-muted)]',
    href: '/command-center/escalated',
  },
  {
    bucket: 'ready-to-pay',
    label: 'Approved',
    description: 'Invoices approved and ready for payment processing.',
    icon: <Banknote className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    href: '/command-center/ready-to-pay',
  },
  {
    bucket: 'rejected',
    label: 'Rejected',
    description: 'Invoices rejected due to unresolvable issues.',
    icon: <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />,
    iconBg: 'bg-[var(--color-destructive-muted)]',
    href: '/command-center/rejected',
  },
  {
    bucket: 'overdue',
    label: 'Overdue',
    description: 'Invoices past their due date that require immediate attention.',
    icon: <Clock className="h-5 w-5 text-[var(--color-destructive)]" />,
    iconBg: 'bg-[var(--color-destructive-muted)]',
    href: '/command-center/overdue',
  },
];

export const CommandCenterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  const countFor = (bucket: DashboardBucket): number => {
    if (!data) return 0;
    const map: Record<DashboardBucket, number> = {
      'ready-for-approval': data.ready_for_approval,
      'needs-review': data.needs_review,
      'escalated': data.escalated,
      'ready-to-pay': data.ready_to_pay,
      'rejected': data.rejected,
      'overdue': data.overdue,
    };
    return map[bucket];
  };

  if (isError) {
    return <ErrorState kind="generic" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Command Center"
        description="Overview of all invoices across the processing pipeline."
      />

      {/* Total count strip */}
      {!isLoading && data && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <LayoutDashboard className="h-4 w-4" />
          <span>
            <span className="font-semibold text-[var(--color-foreground)]">{data.total}</span>{' '}
            total invoices in the pipeline
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {BUCKETS.map((card) => (
          <button
            key={card.bucket}
            onClick={() => navigate(card.href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-5 hover:shadow-[var(--shadow-sm)] hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} flex-shrink-0`}>
                {card.icon}
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                <span className="text-2xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {countFor(card.bucket)}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{card.label}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                {card.description}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              View invoices <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
