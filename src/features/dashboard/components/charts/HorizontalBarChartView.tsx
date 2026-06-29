import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartData } from '../../types/dashboardCharts.types';
import { MUTED_CHART_COLORS } from './AnalyticsChartCard';

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-semibold text-[var(--color-foreground)]">{label}</p>
      <p className="text-[11px] text-[var(--color-muted-foreground)]">{payload[0].value} invoices</p>
    </div>
  );
};

interface HorizontalBarChartViewProps {
  data: ChartData;
  barColor?: string;
}

export const HorizontalBarChartView: React.FC<HorizontalBarChartViewProps> = ({
  data,
  barColor = '#1d4ed8',
}) => {
  const chartData = useMemo(
    () =>
      data.labels.map((label, index) => ({
        name: label.length > 22 ? `${label.slice(0, 20)}…` : label,
        fullName: label,
        value: data.values[index] ?? 0,
        fill: MUTED_CHART_COLORS[index % MUTED_CHART_COLORS.length] ?? barColor,
      })),
    [data, barColor],
  );

  const rowHeight = Math.max(220, chartData.length * 34);

  return (
    <ResponsiveContainer width="100%" height={rowHeight}>
      <BarChart
        data={chartData}
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
          width={108}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload as { value: number }[] | undefined}
              label={(payload?.[0]?.payload as { fullName?: string } | undefined)?.fullName ?? label}
            />
          )}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {chartData.map((entry) => (
            <Cell key={entry.fullName} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
