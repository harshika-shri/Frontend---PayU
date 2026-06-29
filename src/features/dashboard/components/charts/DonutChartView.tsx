import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types/dashboardCharts.types';
import { colorForLabel } from './AnalyticsChartCard';

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload?: { fill?: string } }[];
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-semibold text-[var(--color-foreground)]">{item.name}</p>
      <p className="text-[11px] text-[var(--color-muted-foreground)]">{item.value} invoices</p>
    </div>
  );
};

interface DonutChartViewProps {
  data: ChartData;
}

export const DonutChartView: React.FC<DonutChartViewProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.labels
        .map((label, index) => ({
          name: label,
          value: data.values[index] ?? 0,
          fill: colorForLabel(label, index),
        }))
        .filter((item) => item.value > 0),
    [data],
  );

  if (chartData.length === 0) {
    return null;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={84}
            dataKey="value"
            paddingAngle={2}
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-[10px] text-slate-500">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
