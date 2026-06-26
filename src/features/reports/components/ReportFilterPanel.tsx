import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import type { ReportFilters } from '../types/report.types';

interface ReportFilterPanelProps {
  filters: ReportFilters;
  onChange: (f: ReportFilters) => void;
}

export const ReportFilterPanel: React.FC<ReportFilterPanelProps> = ({
  filters,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const hasFilters =
    filters.start_date || filters.end_date || filters.invoice_status;

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-[var(--color-muted)] transition-colors"
      >
        <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
          <Filter className="h-4 w-4" />
          <span className="font-medium">
            Filters
            {hasFilters && (
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white">
                •
              </span>
            )}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        )}
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-64 border-t border-[var(--color-border)]' : 'max-h-0',
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
              From Date
            </label>
            <input
              type="date"
              value={filters.start_date ?? ''}
              onChange={(e) => onChange({ ...filters, start_date: e.target.value || undefined })}
              className="flex h-8 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
              To Date
            </label>
            <input
              type="date"
              value={filters.end_date ?? ''}
              onChange={(e) => onChange({ ...filters, end_date: e.target.value || undefined })}
              className="flex h-8 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
              Invoice Status
            </label>
            <select
              value={filters.invoice_status ?? ''}
              onChange={(e) =>
                onChange({ ...filters, invoice_status: e.target.value || undefined })
              }
              className="flex h-8 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            >
              <option value="">All statuses</option>
              <option value="ready_for_approval">Ready for Approval</option>
              <option value="needs_review">Needs Review</option>
              <option value="escalated">Escalated</option>
              <option value="ready_to_pay">Ready to Pay</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="px-4 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({})}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-[var(--color-muted-foreground)] text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
