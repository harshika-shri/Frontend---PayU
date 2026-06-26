import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { ReportFilterPanel } from '../components/ReportFilterPanel';
import { useReportManagers } from '../hooks/useReports';
import type { ReportFilters, ManagerWorkloadItem } from '../types/report.types';
import type { Column } from '../../../components/ui/DataTable';

const COLUMNS: Column<ManagerWorkloadItem>[] = [
  {
    key: 'manager_name',
    header: 'Manager',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">{row.manager_name}</span>
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
  {
    key: 'claimed_unresolved',
    header: 'Claimed Unresolved',
    sortable: true,
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => <span className="tabular-nums">{row.claimed_unresolved}</span>,
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
];

export const ManagerPerformanceReport: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data, isLoading, isError, refetch } = useReportManagers(filters);

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Reports
      </button>
      <PageHeader
        title="Manager Performance"
        description="Escalation handling and outcomes per Finance Manager."
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
          rowKey={(row) => row.manager_name}
          emptyTitle="No manager data"
          emptyDescription="No manager activity found for the selected filters."
          hidePagination
        />
      </div>
    </div>
  );
};
