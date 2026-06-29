import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Inbox,
  Briefcase,
  XCircle,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Timer,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useFinanceManagerSummary } from '../../finance-manager/hooks/useFinanceManager';
import { useDashboardSummary } from '../../command-center/hooks/useDashboard';
import { useReportPerformance, useReportVendors, useReportAssociates } from '../../reports/hooks/useReports';
import type { FinanceManagerSummary } from '../../finance-manager/types/financeManager.types';
import type { DashboardSummary } from '../../command-center/types/dashboard.types';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ready_for_approval: '#16a34a',
  needs_review: '#d97706',
  escalated: '#0284c7',
  ready_to_pay: '#1d4ed8',
  rejected: '#dc2626',
  overdue: '#9333ea',
  under_review: '#d97706',
  approved: '#16a34a',
  claimed: '#1d4ed8',
} as const;

// ── Work queue card config ────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────────

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

const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, loading, empty, emptyText = 'No data available', children, className = '' }) => (
  <div className={`rounded-lg border border-[var(--color-border)] bg-white p-5 ${className}`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-0.5">
      {title}
    </p>
    {subtitle && (
      <p className="text-[11px] text-[var(--color-muted-foreground)] mb-4">{subtitle}</p>
    )}
    {!subtitle && <div className="mb-4" />}
    {loading ? (
      <Skeleton className="h-52 w-full rounded" />
    ) : empty ? (
      <div className="flex h-52 flex-col items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
        <FileText className="h-8 w-8 opacity-30" />
        <p className="text-sm">{emptyText}</p>
      </div>
    ) : (
      children
    )}
  </div>
);

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill?: string; color?: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 shadow-md min-w-[120px]">
      <p className="text-[11px] font-semibold text-[var(--color-foreground)] mb-1.5">
        {label ?? payload[0]?.name}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.fill ?? p.color ?? '#64748b' }}
            />
            <span className="text-[10px] text-slate-500">{p.name}</span>
          </div>
          <span className="text-[11px] font-semibold text-[var(--color-foreground)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const formatHours = (h: number | undefined | null): string => {
  if (h == null || isNaN(h)) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h.toFixed(1)}h`;
};

// ── Main component ────────────────────────────────────────────────────────────

export const FinanceManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: mgr, isLoading: mgrLoading, isError: mgrError, refetch: mgrRefetch } =
    useFinanceManagerSummary();
  const { data: pipeline, isLoading: pipeLoading } = useDashboardSummary();
  const { data: perf, isLoading: perfLoading } = useReportPerformance();
  const { data: vendors, isLoading: vendorsLoading } = useReportVendors();
  const { data: associates, isLoading: assocLoading } = useReportAssociates();

  if (mgrError) return <ErrorState kind="generic" onRetry={() => mgrRefetch()} />;

  const total = pipeline?.total ?? 0;

  // Platform pipeline bar data
  const pipelineBarData: { name: string; value: number; fill: string }[] = [
    { name: 'Ready', value: pipeline?.ready_for_approval ?? 0, fill: C.ready_for_approval },
    { name: 'Needs Review', value: pipeline?.needs_review ?? 0, fill: C.needs_review },
    { name: 'Escalated', value: pipeline?.escalated ?? 0, fill: C.escalated },
    { name: 'Approved', value: pipeline?.ready_to_pay ?? 0, fill: C.ready_to_pay },
    { name: 'Rejected', value: pipeline?.rejected ?? 0, fill: C.rejected },
    { name: 'Overdue', value: pipeline?.overdue ?? 0, fill: C.overdue },
  ];

  // Work queue donut data
  const queueDonutData = QUEUE_CARDS.map((c) => ({
    name: c.label,
    value: (mgr?.[c.key] as number) ?? 0,
    color: c.hex,
  })).filter((d) => d.value > 0);

  const totalQueueItems = QUEUE_CARDS.reduce(
    (sum, c) => sum + ((mgr?.[c.key] as number) ?? 0),
    0,
  );

  // Top 8 vendors
  const vendorData = (vendors ?? [])
    .slice(0, 8)
    .map((v) => ({
      name: v.vendor_name.length > 18 ? v.vendor_name.slice(0, 16) + '…' : v.vendor_name,
      count: v.invoice_count,
    }))
    .reverse();

  // Associate workload — top 8
  const assocData = (associates ?? []).slice(0, 8).map((a) => ({
    name: a.associate_name.split(' ')[0], // first name only
    'Under Review': a.under_review,
    Approved: a.approved,
    Escalated: a.escalated,
    Rejected: a.rejected,
  }));

  const pipelineEmpty = !pipeLoading && total === 0;
  const queueEmpty = !mgrLoading && totalQueueItems === 0;
  const vendorsEmpty = !vendorsLoading && (!vendors || vendors.length === 0);
  const assocEmpty = !assocLoading && (!associates || associates.length === 0);

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

      {/* ── KPI tiles ── */}
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
          label="Avg Approval Time"
          value={formatHours(perf?.avg_approval_time_hours)}
          sub="From upload to approval"
          loading={perfLoading}
          accent="#16a34a"
          Icon={Timer}
          iconBg="bg-green-50"
        />
        <KpiTile
          label="Avg Rejection Time"
          value={formatHours(perf?.avg_rejection_time_hours)}
          sub="From upload to rejection"
          loading={perfLoading}
          accent="#dc2626"
          Icon={Timer}
          iconBg="bg-red-50"
        />
      </div>

      {/* ── Charts row 1: Pipeline + Work Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Platform pipeline bar */}
        <ChartCard
          title="Platform Pipeline"
          subtitle="Invoice count across all processing stages"
          loading={pipeLoading}
          empty={pipelineEmpty}
          emptyText="No invoices in the pipeline"
          className="lg:col-span-3"
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={pipelineBarData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={52}>
                {pipelineBarData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* My Work Queue donut */}
        <ChartCard
          title="My Work Queue"
          subtitle="Distribution of assigned items"
          loading={mgrLoading}
          empty={queueEmpty}
          emptyText="No items in your queue"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={queueDonutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={78}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {queueDonutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                formatter={(value: string) => (
                  <span style={{ fontSize: 10, color: '#64748b' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts row 2: Associate Workload + Top Vendors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Associate workload stacked bar */}
        <ChartCard
          title="Associate Workload"
          subtitle="Invoice volume per finance associate"
          loading={assocLoading}
          empty={assocEmpty}
          emptyText="No associate data available"
          className="lg:col-span-3"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assocData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                formatter={(value: string) => (
                  <span style={{ fontSize: 10, color: '#64748b' }}>{value}</span>
                )}
              />
              <Bar dataKey="Under Review" stackId="a" fill={C.under_review} />
              <Bar dataKey="Approved" stackId="a" fill={C.approved} />
              <Bar dataKey="Escalated" stackId="a" fill={C.escalated} />
              <Bar
                dataKey="Rejected"
                stackId="a"
                fill={C.rejected}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top vendors horizontal bar */}
        <ChartCard
          title="Top Vendors"
          subtitle="By invoice submission volume"
          loading={vendorsLoading}
          empty={vendorsEmpty}
          emptyText="No vendor data available"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={vendorData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Invoices" fill="#1d4ed8" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── My Work Queue action cards ── */}
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

      {/* ── Associate summary strip ── */}
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
