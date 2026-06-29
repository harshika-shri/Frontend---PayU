import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type {
  AssociateReportFilters,
  ReportFilterOptionsResponse,
} from '../types/report.types';

const inputClassName =
  'flex h-8 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]';

const labelClassName = 'text-xs font-medium text-[var(--color-muted-foreground)]';

interface AssociateReportFiltersPanelProps {
  filters: AssociateReportFilters;
  options?: ReportFilterOptionsResponse;
  showAssociateFilter: boolean;
  onChange: (filters: AssociateReportFilters) => void;
  onReset: () => void;
}

export const AssociateReportFiltersPanel: React.FC<AssociateReportFiltersPanelProps> = ({
  filters,
  options,
  showAssociateFilter,
  onChange,
  onReset,
}) => {
  const update = (patch: Partial<AssociateReportFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className={labelClassName}>From Date</label>
          <input
            type="date"
            value={filters.from_date ?? ''}
            onChange={(e) => update({ from_date: e.target.value || undefined })}
            className={inputClassName}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>To Date</label>
          <input
            type="date"
            value={filters.to_date ?? ''}
            onChange={(e) => update({ to_date: e.target.value || undefined })}
            className={inputClassName}
          />
        </div>

        {showAssociateFilter && (
          <div className="space-y-1">
            <label className={labelClassName}>Finance Associate</label>
            <select
              value={filters.finance_associate_id ?? ''}
              onChange={(e) =>
                update({ finance_associate_id: e.target.value || undefined })
              }
              className={inputClassName}
            >
              <option value="">All associates</option>
              {(options?.finance_associates ?? []).map((associate) => (
                <option key={associate.id} value={associate.id}>
                  {associate.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className={labelClassName}>Report View</label>
          <select
            value={filters.view_mode ?? 'overall'}
            onChange={(e) =>
              update({
                view_mode: e.target.value as AssociateReportFilters['view_mode'],
              })
            }
            className={inputClassName}
          >
            <option value="overall">Overall Report</option>
            <option value="daywise">Day-wise Report</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          className="text-[var(--color-muted-foreground)] text-xs"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
