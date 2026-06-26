import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Inbox,
  Briefcase,
  XCircle,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useFinanceManagerSummary } from '../../finance-manager/hooks/useFinanceManager';
import { useDashboardSummary } from '../../command-center/hooks/useDashboard';

const MANAGER_CARDS = [
  {
    key: 'my_escalated' as const,
    label: 'My Escalated',
    href: '/finance-manager/my-escalated',
    icon: <TrendingUp className="h-5 w-5 text-[var(--color-info)]" />,
    iconBg: 'bg-[var(--color-info-muted)]',
    description: 'Escalated to you for decision.',
  },
  {
    key: 'unassigned_queue' as const,
    label: 'Unassigned Queue',
    href: '/finance-manager/unassigned',
    icon: <Inbox className="h-5 w-5 text-[var(--color-warning)]" />,
    iconBg: 'bg-[var(--color-warning-muted)]',
    description: 'Waiting for ownership.',
  },
  {
    key: 'my_claimed_unresolved' as const,
    label: 'My Claimed',
    href: '/finance-manager/my-claimed',
    icon: <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    description: 'Invoices you own.',
  },
  {
    key: 'rejected' as const,
    label: 'Rejected',
    href: '/finance-manager/rejected',
    icon: <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />,
    iconBg: 'bg-[var(--color-destructive-muted)]',
    description: 'Under your management.',
  },
] as const;

type ManagerSummaryKey = (typeof MANAGER_CARDS)[number]['key'];

export const FinanceManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: mgr, isLoading: mgrLoading, isError: mgrError, refetch: mgrRefetch } = useFinanceManagerSummary();
  const { data: pipeline, isLoading: pipeLoading } = useDashboardSummary();

  if (mgrError) {
    return <ErrorState kind="generic" onRetry={() => mgrRefetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your finance management overview."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/command-center')}
            leftIcon={<LayoutDashboard className="h-4 w-4" />}
          >
            Command Center
          </Button>
        }
      />

      {/* Manager work queue */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        My Work Queue
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {MANAGER_CARDS.map(({ key, label, href, icon, iconBg, description }) => (
          <button
            key={key}
            onClick={() => navigate(href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-4 hover:shadow-[var(--shadow-sm)] hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} flex-shrink-0`}>
                {icon}
              </div>
              {mgrLoading ? (
                <Skeleton className="h-7 w-8 rounded" />
              ) : (
                <span className="text-2xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {mgr?.[key as ManagerSummaryKey] ?? 0}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[var(--color-foreground)]">{label}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
              {description}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              Open queue <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Platform pipeline overview */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Platform Pipeline
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['ready_for_approval', 'needs_review', 'escalated', 'ready_to_pay', 'rejected'] as const).map(
          (key) => {
            const labels: Record<typeof key, string> = {
              ready_for_approval: 'Ready',
              needs_review: 'Needs Review',
              escalated: 'Escalated',
              ready_to_pay: 'Ready to Pay',
              rejected: 'Rejected',
            };
            return (
              <div
                key={key}
                className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-center"
              >
                {pipeLoading ? (
                  <Skeleton className="h-6 w-10 mx-auto mb-1 rounded" />
                ) : (
                  <p className="text-xl font-semibold text-[var(--color-foreground)] tabular-nums">
                    {pipeline?.[key] ?? 0}
                  </p>
                )}
                <p className="text-[11px] text-[var(--color-muted-foreground)]">{labels[key]}</p>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};
