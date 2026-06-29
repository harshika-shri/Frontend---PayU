import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Inbox,
  Briefcase,
  XCircle,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useFinanceManagerSummary } from '../../finance-manager/hooks/useFinanceManager';
import { useDashboardSummary } from '../../command-center/hooks/useDashboard';
import {
  useManagerPendingWorkByVendor,
  useManagerStatusDistribution,
  useManagerTeamPerformance,
  useManagerValidationBreakdown,
} from '../hooks/useDashboardCharts';
import {
  AnalyticsChartCard,
  chartHasData,
} from './charts/AnalyticsChartCard';
import { DonutChartView } from './charts/DonutChartView';
import { HorizontalBarChartView } from './charts/HorizontalBarChartView';

import type { FinanceManagerSummary } from '../../finance-manager/types/financeManager.types';

const C = {
  escalated: '#0284c7',
  needs_review: '#d97706',
  ready_to_pay: '#1d4ed8',
  rejected: '#dc2626',
} as const;

const QUEUE_CARDS = [
  {
    key: 'my_escalated' as keyof FinanceManagerSummary,
    label: 'My Escalated',
    href: '/finance-manager/my-escalated',
    Icon: TrendingUp,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    hex: C.escalated,
    description: 'Escalated to you for decision',
  },
  {
    key: 'unassigned_queue' as keyof FinanceManagerSummary,
    label: 'Unassigned Queue',
    href: '/finance-manager/unassigned',
    Icon: Inbox,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    hex: C.needs_review,
    description: 'Waiting for ownership',
  },
  {
    key: 'my_claimed_unresolved' as keyof FinanceManagerSummary,
    label: 'My Claimed',
    href: '/finance-manager/my-claimed',
    Icon: Briefcase,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    hex: C.ready_to_pay,
    description: 'Invoices you own',
  },
  {
    key: 'rejected' as keyof FinanceManagerSummary,
    label: 'Rejected',
    href: '/finance-manager/rejected',
    Icon: XCircle,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    hex: C.rejected,
    description: 'Under your management',
  },
] as const;

interface KpiTileProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
  accent: string;
  Icon: React.ElementType;
  iconBg: string;
}

const KpiTile: React.FC<KpiTileProps> = ({ label, value, sub, loading, accent, Icon, iconBg }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 flex items-start gap-3">
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${iconBg}`}>
      <Icon className="h-4 w-4" style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      {loading ? (
        <>
          <Skeleton className="h-6 w-14 rounded mb-1" />
          <Skeleton className="h-3 w-24 rounded" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: accent }}>
            {value}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {label}
          </p>
          {sub && (
            <p className="mt-0.5 text-[10px] text-[var(--color-muted-foreground)]">{sub}</p>
          )}
        </>
      )}
    </div>
  </div>
);

export const FinanceManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: mgr, isLoading: mgrLoading, isError: mgrError, refetch: mgrRefetch } =
    useFinanceManagerSummary();
  const { data: pipeline, isLoading: pipeLoading } = useDashboardSummary();

  const statusChart = useManagerStatusDistribution();
  const pendingVendorChart = useManagerPendingWorkByVendor();
  const teamChart = useManagerTeamPerformance();
  const validationChart = useManagerValidationBreakdown();

  if (mgrError) return <ErrorState kind="generic" onRetry={() => mgrRefetch()} />;

  const total = pipeline?.total ?? 0;
  const needsReview = pipeline?.needs_review ?? 0;
  const readyForApproval = pipeline?.ready_for_approval ?? 0;
  const escalated = pipeline?.escalated ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Finance operations overview."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/command-center')}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiTile
          label="Total Invoices"
          value={total}
          loading={pipeLoading}
          accent="#1d4ed8"
          Icon={FileText}
          iconBg="bg-blue-50"
        />
        <KpiTile
          label="Overdue"
          value={pipeline?.overdue ?? 0}
          sub="Past due date"
          loading={pipeLoading}
          accent="#9333ea"
          Icon={Clock}
          iconBg="bg-purple-50"
        />
        <KpiTile
          label="Needs Review"
          value={needsReview}
          sub="Awaiting associate action"
          loading={pipeLoading}
          accent="#d97706"
          Icon={Inbox}
          iconBg="bg-amber-50"
        />
        <KpiTile
          label="Ready for Approval"
          value={readyForApproval}
          sub={`${escalated} escalated company-wide`}
          loading={pipeLoading}
          accent="#16a34a"
          Icon={CheckCircle2}
          iconBg="bg-green-50"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Analytics
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <AnalyticsChartCard
          title="Overall Invoice Status Distribution"
          description="System-wide workload across key invoice states"
          loading={statusChart.isLoading}
          isError={statusChart.isError}
          onRetry={() => statusChart.refetch()}
          empty={!statusChart.isLoading && !chartHasData(statusChart.data?.values)}
          emptyText="No invoices in the system"
        >
          {statusChart.data && <DonutChartView data={statusChart.data} />}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Pending Work by Vendor"
          description="Vendors with the highest number of invoices currently requiring action"
          loading={pendingVendorChart.isLoading}
          isError={pendingVendorChart.isError}
          onRetry={() => pendingVendorChart.refetch()}
          empty={!pendingVendorChart.isLoading && !chartHasData(pendingVendorChart.data?.values)}
          emptyText="No pending vendor workload"
        >
          {pendingVendorChart.data && (
            <HorizontalBarChartView data={pendingVendorChart.data} />
          )}
        </AnalyticsChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <AnalyticsChartCard
          title="Team Performance"
          description="Invoices processed by each finance associate"
          loading={teamChart.isLoading}
          isError={teamChart.isError}
          onRetry={() => teamChart.refetch()}
          empty={!teamChart.isLoading && !chartHasData(teamChart.data?.values)}
          emptyText="No associate processing activity yet"
        >
          {teamChart.data && <HorizontalBarChartView data={teamChart.data} />}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Validation Failure Distribution"
          description="Organization-wide unresolved issues by validation category"
          loading={validationChart.isLoading}
          isError={validationChart.isError}
          onRetry={() => validationChart.refetch()}
          empty={!validationChart.isLoading && !chartHasData(validationChart.data?.values)}
          emptyText="No open validation issues"
        >
          {validationChart.data && <HorizontalBarChartView data={validationChart.data} />}
        </AnalyticsChartCard>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        My Work Queue
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {QUEUE_CARDS.map(({ key, label, href, Icon, bg, iconColor, hex, description }) => (
          <button
            key={key}
            onClick={() => navigate(href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              {mgrLoading ? (
                <Skeleton className="h-6 w-8 rounded" />
              ) : (
                <span className="text-xl font-bold tabular-nums" style={{ color: hex }}>
                  {(mgr?.[key] as number) ?? 0}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[var(--color-foreground)]">{label}</p>
            <p className="mt-0.5 text-[10px] text-[var(--color-muted-foreground)] leading-relaxed">
              {description}
            </p>
            <div
              className="mt-3 flex items-center gap-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: hex }}
            >
              Open queue <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Team Overview
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/finance-manager/unassigned')}
            leftIcon={<Users className="h-3.5 w-3.5" />}
          >
            Assign Invoices
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/finance-manager/my-escalated')}
            leftIcon={<TrendingUp className="h-3.5 w-3.5" />}
          >
            Review Escalations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
            leftIcon={<FileText className="h-3.5 w-3.5" />}
          >
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
};
