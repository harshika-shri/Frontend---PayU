import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
import type { DashboardSummary } from '../../command-center/types/dashboard.types';

// ── Palette aligned with the app design system ───────────────────────────────
const HEX = {
  ready_for_approval: '#16a34a',
  needs_review: '#d97706',
  escalated: '#0284c7',
  ready_to_pay: '#1d4ed8',
  rejected: '#dc2626',
  overdue: '#9333ea',
} as const;

// ── Pipeline bucket configuration ─────────────────────────────────────────────
const BUCKETS = [
  {
    key: 'ready_for_approval' as keyof DashboardSummary,
    label: 'Ready for Approval',
    shortLabel: 'Ready',
    href: '/command-center/ready-for-approval',
    Icon: CheckCircle2,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    hex: HEX.ready_for_approval,
  },
  {
    key: 'needs_review' as keyof DashboardSummary,
    label: 'Needs Review',
    shortLabel: 'Needs Review',
    href: '/command-center/needs-review',
    Icon: AlertTriangle,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    hex: HEX.needs_review,
  },
  {
    key: 'escalated' as keyof DashboardSummary,
    label: 'Escalated',
    shortLabel: 'Escalated',
    href: '/command-center/escalated',
    Icon: TrendingUp,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    hex: HEX.escalated,
  },
  {
    key: 'ready_to_pay' as keyof DashboardSummary,
    label: 'Approved',
    shortLabel: 'Approved',
    href: '/command-center/ready-to-pay',
    Icon: Banknote,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    hex: HEX.ready_to_pay,
  },
  {
    key: 'rejected' as keyof DashboardSummary,
    label: 'Rejected',
    shortLabel: 'Rejected',
    href: '/command-center/rejected',
    Icon: XCircle,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    hex: HEX.rejected,
  },
  {
    key: 'overdue' as keyof DashboardSummary,
    label: 'Overdue',
    shortLabel: 'Overdue',
    href: '/command-center/overdue',
    Icon: Clock,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hex: HEX.overdue,
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
    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-semibold text-[var(--color-foreground)] mb-1">
        {label ?? payload[0]?.name}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-[11px]" style={{ color: p.fill ?? p.color ?? '#64748b' }}>
          {p.value} invoices
        </p>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const FinanceAssociateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isError) return <ErrorState kind="generic" onRetry={() => refetch()} />;

  const total = data?.total ?? 0;
  const healthyCount = (data?.ready_for_approval ?? 0) + (data?.ready_to_pay ?? 0);
  const healthyPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

  // Donut chart — only non-zero slices
  const donutData = BUCKETS.map((b) => ({
    name: b.label,
    value: (data?.[b.key] as number) ?? 0,
    color: b.hex,
  })).filter((d) => d.value > 0);

  // Bar chart — all statuses
  const barData = BUCKETS.map((b) => ({
    name: b.shortLabel,
    value: (data?.[b.key] as number) ?? 0,
    fill: b.hex,
  }));

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

      {/* ── KPI tiles ── */}
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

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Donut — Pipeline Distribution */}
        <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
            Pipeline Distribution
          </p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mb-4">
            Share of invoices per status
          </p>

          {isLoading ? (
            <Skeleton className="h-52 w-full rounded" />
          ) : total === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
              <FileText className="h-8 w-8 opacity-30" />
              <p className="text-sm">No invoices yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    dataKey="value"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1 justify-center">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar — Status Breakdown */}
        <div className="lg:col-span-3 rounded-lg border border-[var(--color-border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
            Status Breakdown
          </p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mb-4">
            Invoice count by current status
          </p>

          {isLoading ? (
            <Skeleton className="h-52 w-full rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
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
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Pipeline Queue cards ── */}
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

      {/* ── Quick Actions ── */}
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
