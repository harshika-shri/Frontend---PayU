import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { ReportFilterPanel } from '../components/ReportFilterPanel';
import { useReportVendors } from '../hooks/useReports';
import type { ReportFilters } from '../types/report.types';
import type { Column } from '../../../components/ui/DataTable';
import type { VendorSummaryItem } from '../types/report.types';

const COLUMNS: Column<VendorSummaryItem>[] = [
  {
    key: 'vendor_name',
    header: 'Vendor',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">{row.vendor_name}</span>
    ),
  },
  {
    key: 'invoice_count',
    header: 'Invoice Count',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="tabular-nums font-medium">{row.invoice_count}</span>
    ),
  },
];

export const VendorPerformanceReport: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data, isLoading, isError, refetch } = useReportVendors(filters);

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Reports
      </button>
      <PageHeader
        title="Vendor Performance"
        description="Invoice submission volumes per vendor."
        className="mb-5"
      />

      <div className="max-w-2xl space-y-5">
        <ReportFilterPanel filters={filters} onChange={setFilters} />

        <DataTable
          columns={COLUMNS}
          data={data ?? []}
          total={data?.length ?? 0}
          page={1}
          pageSize={data?.length ?? 0}
          loading={isLoading}
          error={isError}
          onRetry={() => refetch()}
          rowKey={(row) => row.vendor_name}
          emptyTitle="No vendor data"
          emptyDescription="No vendor activity found for the selected filters."
          hidePagination
        />
      </div>
    </div>
  );
};
