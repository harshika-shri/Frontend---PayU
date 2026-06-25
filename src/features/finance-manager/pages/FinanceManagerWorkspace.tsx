import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Inbox,
  Briefcase,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useFinanceManagerSummary } from '../hooks/useFinanceManager';

const QUEUE_CARDS = [
  {
    key: 'my-escalated' as const,
    label: 'My Escalated',
    description: 'Invoices escalated to you for decision.',
    icon: <TrendingUp className="h-5 w-5 text-[var(--color-info)]" />,
    iconBg: 'bg-[var(--color-info-muted)]',
    href: '/finance-manager/my-escalated',
    countKey: 'my_escalated' as const,
  },
  {
    key: 'unassigned' as const,
    label: 'Unassigned Queue',
    description: 'Invoices waiting for manager ownership.',
    icon: <Inbox className="h-5 w-5 text-[var(--color-warning)]" />,
    iconBg: 'bg-[var(--color-warning-muted)]',
    href: '/finance-manager/unassigned',
    countKey: 'unassigned_queue' as const,
  },
  {
    key: 'my-claimed' as const,
    label: 'My Claimed',
    description: 'Invoices you own that are still unresolved.',
    icon: <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    href: '/finance-manager/my-claimed',
    countKey: 'my_claimed_unresolved' as const,
  },
  {
    key: 'rejected' as const,
    label: 'Rejected',
    description: 'Invoices rejected under your management.',
    icon: <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />,
    iconBg: 'bg-[var(--color-destructive-muted)]',
    href: '/finance-manager/rejected',
    countKey: 'rejected' as const,
  },
];

export const FinanceManagerWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useFinanceManagerSummary();

  if (isError) {
    return <ErrorState kind="generic" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Finance Manager"
        description="Manage escalated invoices and your assigned work queue."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {QUEUE_CARDS.map((card) => (
          <button
            key={card.key}
            onClick={() => navigate(card.href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-5 hover:shadow-[var(--shadow-sm)] hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} flex-shrink-0`}
              >
                {card.icon}
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-10 rounded" />
              ) : (
                <span className="text-2xl font-semibold text-[var(--color-foreground)] tabular-nums">
                  {data?.[card.countKey] ?? 0}
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
              View queue <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
