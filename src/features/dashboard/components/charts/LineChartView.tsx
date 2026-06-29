import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types/dashboardCharts.types';

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
      <p className="text-[11px] text-[var(--color-muted-foreground)]">
        {payload[0].value} processed
      </p>
    </div>
  );
};

interface LineChartViewProps {
  data: ChartData;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.labels.map((label, index) => ({
        name: label,
        value: data.values[index] ?? 0,
      })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
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
        <Line
          type="monotone"
          dataKey="value"
          stroke="#1d4ed8"
          strokeWidth={2}
          dot={{ r: 3, fill: '#1d4ed8', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
