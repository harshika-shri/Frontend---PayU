import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Banknote,
  XCircle,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useDashboardSummary } from '../../command-center/hooks/useDashboard';

const BUCKET_CARDS = [
  {
    key: 'ready_for_approval' as const,
    label: 'Ready for Approval',
    href: '/command-center/ready-for-approval',
    icon: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
    iconBg: 'bg-[var(--color-success-muted)]',
    description: 'Awaiting your review and approval.',
  },
  {
    key: 'needs_review' as const,
    label: 'Needs Review',
    href: '/command-center/needs-review',
    icon: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
    iconBg: 'bg-[var(--color-warning-muted)]',
    description: 'Flagged for manual review.',
  },
  {
    key: 'escalated' as const,
    label: 'Escalated',
    href: '/command-center/escalated',
    icon: <TrendingUp className="h-5 w-5 text-[var(--color-info)]" />,
    iconBg: 'bg-[var(--color-info-muted)]',
    description: 'Sent to Finance Manager.',
  },
  {
    key: 'ready_to_pay' as const,
    label: 'Ready to Pay',
    href: '/command-center/ready-to-pay',
    icon: <Banknote className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    description: 'Approved, awaiting payment.',
  },
  {
    key: 'rejected' as const,
    label: 'Rejected',
    href: '/command-center/rejected',
    icon: <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />,
    iconBg: 'bg-[var(--color-destructive-muted)]',
    description: 'Invoices that could not be processed.',
  },
] as const;

type SummaryKey = (typeof BUCKET_CARDS)[number]['key'];

export const FinanceAssociateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isError) {
    return <ErrorState kind="generic" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your invoice pipeline at a glance."
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/invoices/upload')}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Upload Invoice
          </Button>
        }
      />

      {/* Pipeline bucket cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {BUCKET_CARDS.map(({ key, label, href, icon, iconBg, description }) => (
          <button
            key={key}
            onClick={() => navigate(href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-4 hover:shadow-[var(--shadow-sm)] hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} flex-shrink-0`}
              >
                {icon}
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-8 rounded" />
              ) : (
                <span className="text-2xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {data?.[key as SummaryKey] ?? 0}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[var(--color-foreground)]">{label}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
              {description}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              View queue <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="border border-[var(--color-border)] rounded-lg bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/invoices/upload')}
            leftIcon={<Upload className="h-3.5 w-3.5" />}
          >
            Upload Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchase-orders')}
            leftIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Purchase Orders
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/command-center')}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            Command Center
          </Button>
        </div>
      </div>
    </div>
  );
};
