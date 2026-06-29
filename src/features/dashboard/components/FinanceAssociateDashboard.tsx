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
  Clock,
  FileText,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useDashboardSummary } from '../../command-center/hooks/useDashboard';
import {
  useAssociateProcessingTrend,
  useAssociateStatusDistribution,
  useAssociateValidationBreakdown,
} from '../hooks/useDashboardCharts';
import {
  AnalyticsChartCard,
  chartHasData,
} from './charts/AnalyticsChartCard';
import { DonutChartView } from './charts/DonutChartView';
import { HorizontalBarChartView } from './charts/HorizontalBarChartView';
import { LineChartView } from './charts/LineChartView';
import type { DashboardSummary } from '../../command-center/types/dashboard.types';

const HEX = {
  ready_for_approval: '#16a34a',
  needs_review: '#d97706',
  escalated: '#0284c7',
  ready_to_pay: '#1d4ed8',
  rejected: '#dc2626',
  overdue: '#9333ea',
} as const;

const BUCKETS = [
  {
    key: 'ready_for_approval' as keyof DashboardSummary,
    label: 'Ready for Approval',
    href: '/command-center/ready-for-approval',
    Icon: CheckCircle2,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    hex: HEX.ready_for_approval,
  },
  {
    key: 'needs_review' as keyof DashboardSummary,
    label: 'Needs Review',
    href: '/command-center/needs-review',
    Icon: AlertTriangle,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    hex: HEX.needs_review,
  },
  {
    key: 'escalated' as keyof DashboardSummary,
    label: 'Escalated',
    href: '/command-center/escalated',
    Icon: TrendingUp,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    hex: HEX.escalated,
  },
  {
    key: 'ready_to_pay' as keyof DashboardSummary,
    label: 'Approved',
    href: '/command-center/ready-to-pay',
    Icon: Banknote,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    hex: HEX.ready_to_pay,
  },
  {
    key: 'rejected' as keyof DashboardSummary,
    label: 'Rejected',
    href: '/command-center/rejected',
    Icon: XCircle,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    hex: HEX.rejected,
  },
  {
    key: 'overdue' as keyof DashboardSummary,
    label: 'Overdue',
    href: '/command-center/overdue',
    Icon: Clock,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hex: HEX.overdue,
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

export const FinanceAssociateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  const statusChart = useAssociateStatusDistribution();
  const validationChart = useAssociateValidationBreakdown();
  const trendChart = useAssociateProcessingTrend();

  if (isError) return <ErrorState kind="generic" onRetry={() => refetch()} />;

  const total = data?.total ?? 0;
  const healthyCount = (data?.ready_for_approval ?? 0) + (data?.ready_to_pay ?? 0);
  const healthyPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiTile
          label="Total Invoices"
          value={total}
          loading={isLoading}
          accent="#1d4ed8"
          Icon={FileText}
          iconBg="bg-blue-50"
        />
        <KpiTile
          label="Overdue"
          value={data?.overdue ?? 0}
          sub="Past due date"
          loading={isLoading}
          accent="#9333ea"
          Icon={Clock}
          iconBg="bg-purple-50"
        />
        <KpiTile
          label="Needs Review"
          value={data?.needs_review ?? 0}
          sub="Flagged for manual check"
          loading={isLoading}
          accent="#d97706"
          Icon={AlertTriangle}
          iconBg="bg-amber-50"
        />
        <KpiTile
          label="Healthy Rate"
          value={`${healthyPct}%`}
          sub="Approved + Ready to pay"
          loading={isLoading}
          accent="#16a34a"
          Icon={Activity}
          iconBg="bg-green-50"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Analytics
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <AnalyticsChartCard
          title="Invoice Status Distribution"
          description="Current workload across your assigned invoices"
          loading={statusChart.isLoading}
          isError={statusChart.isError}
          onRetry={() => statusChart.refetch()}
          empty={!statusChart.isLoading && !chartHasData(statusChart.data?.values)}
          emptyText="No assigned invoices yet"
          className="xl:col-span-1"
        >
          {statusChart.data && <DonutChartView data={statusChart.data} />}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Validation Issues Breakdown"
          description="Unresolved issues by validation category"
          loading={validationChart.isLoading}
          isError={validationChart.isError}
          onRetry={() => validationChart.refetch()}
          empty={!validationChart.isLoading && !chartHasData(validationChart.data?.values)}
          emptyText="No open validation issues"
          className="xl:col-span-1"
        >
          {validationChart.data && <HorizontalBarChartView data={validationChart.data} />}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="My Processing Trend"
          description="Invoices processed over the last 7 days"
          loading={trendChart.isLoading}
          isError={trendChart.isError}
          onRetry={() => trendChart.refetch()}
          empty={!trendChart.isLoading && !chartHasData(trendChart.data?.values)}
          emptyText="No processing activity in the last 7 days"
          className="xl:col-span-1"
        >
          {trendChart.data && <LineChartView data={trendChart.data} />}
        </AnalyticsChartCard>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Invoice Queues
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {BUCKETS.map(({ key, label, href, Icon, bg, iconColor, hex }) => (
          <button
            key={key}
            onClick={() => navigate(href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} mb-2`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-8 rounded mb-1" />
            ) : (
              <p className="text-xl font-bold tabular-nums leading-none mb-1" style={{ color: hex }}>
                {(data?.[key] as number) ?? 0}
              </p>
            )}
            <p className="text-[10px] font-semibold text-[var(--color-foreground)] leading-tight">
              {label}
            </p>
            <div
              className="mt-2 flex items-center gap-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: hex }}
            >
              View <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Quick Actions
        </p>
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
            onClick={() => navigate('/command-center/needs-review')}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            Review Pending
          </Button>
        </div>
      </div>
    </div>
  );
};
