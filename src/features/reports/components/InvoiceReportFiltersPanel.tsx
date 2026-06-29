import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type {
  InvoiceReportFilters,
  ReportFilterOptionsResponse,
} from '../types/report.types';

const inputClassName =
  'flex h-8 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]';

const labelClassName = 'text-xs font-medium text-[var(--color-muted-foreground)]';

interface InvoiceReportFiltersPanelProps {
  filters: InvoiceReportFilters;
  options?: ReportFilterOptionsResponse;
  showAssociateFilter: boolean;
  onChange: (filters: InvoiceReportFilters) => void;
  onReset: () => void;
}

export const InvoiceReportFiltersPanel: React.FC<InvoiceReportFiltersPanelProps> = ({
  filters,
  options,
  showAssociateFilter,
  onChange,
  onReset,
}) => {
  const update = (patch: Partial<InvoiceReportFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

        <div className="space-y-1">
          <label className={labelClassName}>Invoice Status</label>
          <select
            value={filters.invoice_status ?? ''}
            onChange={(e) => update({ invoice_status: e.target.value || undefined })}
            className={inputClassName}
          >
            <option value="">All statuses</option>
            {(options?.invoice_statuses ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>Validation Outcome</label>
          <select
            value={filters.validation_outcome ?? ''}
            onChange={(e) => update({ validation_outcome: e.target.value || undefined })}
            className={inputClassName}
          >
            <option value="">All outcomes</option>
            {(options?.validation_outcomes ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>Vendor</label>
          <select
            value={filters.vendor_id ?? ''}
            onChange={(e) => update({ vendor_id: e.target.value || undefined })}
            className={inputClassName}
          >
            <option value="">All vendors</option>
            {(options?.vendors ?? []).map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.vendor_name}
              </option>
            ))}
          </select>
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
          <label className={labelClassName}>Validation Node</label>
          <select
            value={filters.validation_node ?? ''}
            onChange={(e) => update({ validation_node: e.target.value || undefined })}
            className={inputClassName}
          >
            <option value="">All nodes</option>
            {(options?.validation_nodes ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>Issue Severity</label>
          <select
            value={filters.issue_severity ?? ''}
            onChange={(e) => update({ issue_severity: e.target.value || undefined })}
            className={inputClassName}
          >
            <option value="">All severities</option>
            {(options?.issue_severities ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>Overdue</label>
          <select
            value={filters.overdue ?? 'all'}
            onChange={(e) =>
              update({ overdue: e.target.value === 'all' ? undefined : e.target.value })
            }
            className={inputClassName}
          >
            {(options?.overdue_options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>PO Number</label>
          <input
            type="text"
            value={filters.po_number ?? ''}
            onChange={(e) => update({ po_number: e.target.value || undefined })}
            placeholder="Search PO number"
            className={inputClassName}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>Invoice Number</label>
          <input
            type="text"
            value={filters.invoice_number ?? ''}
            onChange={(e) => update({ invoice_number: e.target.value || undefined })}
            placeholder="Search invoice number"
            className={inputClassName}
          />
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
