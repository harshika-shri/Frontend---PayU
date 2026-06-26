import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { ReportFilterPanel } from '../components/ReportFilterPanel';
import { useReportAssociates } from '../hooks/useReports';
import type { ReportFilters, AssociateWorkloadItem } from '../types/report.types';
import type { Column } from '../../../components/ui/DataTable';

const COLUMNS: Column<AssociateWorkloadItem>[] = [
  {
    key: 'associate_name',
    header: 'Associate',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">{row.associate_name}</span>
    ),
  },
  {
    key: 'under_review',
    header: 'Under Review',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => <span className="tabular-nums">{row.under_review}</span>,
  },
  {
    key: 'approved',
    header: 'Approved',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="tabular-nums text-[var(--color-success)]">{row.approved}</span>
    ),
  },
  {
    key: 'rejected',
    header: 'Rejected',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="tabular-nums text-[var(--color-destructive)]">{row.rejected}</span>
    ),
  },
  {
    key: 'escalated',
    header: 'Escalated',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="tabular-nums text-[var(--color-warning)]">{row.escalated}</span>
    ),
  },
];

export const AssociatePerformanceReport: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data, isLoading, isError, refetch } = useReportAssociates(filters);

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Reports
      </button>
      <PageHeader
        title="Associate Performance"
        description="Workload and resolution rates per Finance Associate."
        className="mb-5"
      />

      <div className="max-w-3xl space-y-5">
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
          rowKey={(row) => row.associate_name}
          emptyTitle="No associate data"
          emptyDescription="No associate activity found for the selected filters."
          hidePagination
        />
      </div>
    </div>
  );
};
