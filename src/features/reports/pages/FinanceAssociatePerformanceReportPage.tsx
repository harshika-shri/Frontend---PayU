import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Users } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { formatDate } from '../../../utils/formatters';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { AssociateReportFiltersPanel } from '../components/AssociateReportFiltersPanel';
import { useReportFilterOptions } from '../hooks/useReports';
import {
  downloadReportBlob,
  reportService,
} from '../services/reportService';
import type {
  AssociateReportFilters,
  AssociateReportQuery,
  AssociateReportViewMode,
  FinanceAssociatePerformanceItem,
} from '../types/report.types';

const PAGE_SIZE = 20;

const metricColumns: Column<FinanceAssociatePerformanceItem>[] = [
  {
    key: 'total_assigned',
    header: 'Total Assigned',
    sortable: true,
    render: (row) => row.total_assigned,
  },
  {
    key: 'approved',
    header: 'Approved',
    sortable: true,
    render: (row) => row.approved,
  },
  {
    key: 'rejected',
    header: 'Rejected',
    sortable: true,
    render: (row) => row.rejected,
  },
  {
    key: 'needs_review',
    header: 'Needs Review',
    sortable: true,
    render: (row) => row.needs_review,
  },
  {
    key: 'ready_for_approval',
    header: 'Ready for Approval',
    sortable: true,
    render: (row) => row.ready_for_approval,
  },
  {
    key: 'ready_to_pay',
    header: 'Ready to Pay',
    sortable: true,
    render: (row) => row.ready_to_pay,
  },
  {
    key: 'overdue',
    header: 'Overdue',
    sortable: true,
    render: (row) => row.overdue,
  },
  {
    key: 'escalated',
    header: 'Escalated',
    sortable: true,
    render: (row) => row.escalated,
  },
  {
    key: 'resolved_count',
    header: 'Resolved',
    sortable: true,
    render: (row) => row.resolved_count,
  },
  {
    key: 'recovered_count',
    header: 'Recovered',
    sortable: true,
    render: (row) => row.recovered_count,
  },
  {
    key: 'approval_rate',
    header: 'Approval Rate',
    sortable: true,
    render: (row) => `${row.approval_rate.toFixed(1)}%`,
  },
  {
    key: 'rejection_rate',
    header: 'Rejection Rate',
    sortable: true,
    render: (row) => `${row.rejection_rate.toFixed(1)}%`,
  },
];

const buildColumns = (
  viewMode: AssociateReportViewMode,
): Column<FinanceAssociatePerformanceItem>[] => {
  const columns: Column<FinanceAssociatePerformanceItem>[] = [
    {
      key: 'associate_name',
      header: 'Associate Name',
      sortable: true,
      render: (row) => <span className="font-medium">{row.associate_name}</span>,
    },
  ];

  if (viewMode === 'daywise') {
    columns.push({
      key: 'report_date',
      header: 'Report Date',
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-muted-foreground)]">
          {formatDate(row.report_date ?? null)}
        </span>
      ),
    });
  }

  return [...columns, ...metricColumns];
};

const defaultSortForView = (
  viewMode: AssociateReportViewMode,
): { sortBy: string; sortDir: 'asc' | 'desc' } =>
  viewMode === 'daywise'
    ? { sortBy: 'report_date', sortDir: 'desc' }
    : { sortBy: 'associate_name', sortDir: 'asc' };

export const FinanceAssociatePerformanceReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [draftFilters, setDraftFilters] = useState<AssociateReportFilters>({
    view_mode: 'overall',
  });
  const [appliedFilters, setAppliedFilters] = useState<AssociateReportFilters | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('associate_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [exporting, setExporting] = useState(false);

  const { data: filterOptions } = useReportFilterOptions();

  const activeViewMode = appliedFilters?.view_mode ?? 'overall';

  const columns = useMemo(
    () => buildColumns(activeViewMode),
    [activeViewMode],
  );

  const queryParams = useMemo<AssociateReportQuery | null>(() => {
    if (!appliedFilters) return null;

    return {
      ...appliedFilters,
      view_mode: appliedFilters.view_mode ?? 'overall',
      search: search || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      page_size: PAGE_SIZE,
    };
  }, [appliedFilters, page, search, sortBy, sortDir]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['reports', 'finance-associates', queryParams],
    queryFn: () => reportService.listFinanceAssociates(queryParams!),
    enabled: queryParams !== null,
  });

  const handleGenerate = () => {
    const viewMode = draftFilters.view_mode ?? 'overall';
    const defaults = defaultSortForView(viewMode);

    setAppliedFilters({ ...draftFilters, view_mode: viewMode });
    setSortBy(defaults.sortBy);
    setSortDir(defaults.sortDir);
    setPage(1);
  };

  const handleReset = () => {
    setDraftFilters({ view_mode: 'overall' });
  };

  const handleExport = useCallback(async () => {
    if (!queryParams) return;

    setExporting(true);
    try {
      const blob = await reportService.exportFinanceAssociates({
        ...queryParams,
        page: undefined,
        page_size: undefined,
      });
      const filename =
        activeViewMode === 'daywise'
          ? 'finance-associate-performance-daywise.xlsx'
          : 'finance-associate-performance.xlsx';
      downloadReportBlob(blob, filename);
    } finally {
      setExporting(false);
    }
  }, [activeViewMode, queryParams]);

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Reports
        </button>
        <PageHeader
          title="Finance Associate Performance Report"
          description={
            isManager
              ? 'Team workload, outcomes, and resolution metrics by Finance Associate.'
              : 'Your assigned invoice workload and performance metrics.'
          }
          className="mb-0"
        />
      </div>

      <div className="space-y-4">
        <AssociateReportFiltersPanel
          filters={draftFilters}
          options={filterOptions}
          showAssociateFilter={isManager}
          onChange={setDraftFilters}
          onReset={handleReset}
        />

        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={isFetching}>
            Generate Report
          </Button>
        </div>

        {appliedFilters && (
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            total={data?.total_records}
            page={page}
            pageSize={PAGE_SIZE}
            loading={isLoading || isFetching}
            error={isError}
            onPageChange={setPage}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onSortChange={(key, direction) => {
              setSortBy(key);
              setSortDir(direction);
              setPage(1);
            }}
            onRetry={() => refetch()}
            searchPlaceholder="Search associates…"
            emptyTitle="No performance data found"
            emptyDescription="Adjust your filters and generate the report again."
            rowKey={(row) =>
              activeViewMode === 'daywise'
                ? `${row.associate_id}-${row.report_date ?? 'unknown'}`
                : row.associate_id
            }
            headerActions={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExport}
                disabled={exporting || !data?.items.length}
              >
                {exporting ? 'Exporting…' : 'Export Excel'}
              </Button>
            }
          />
        )}

        {!appliedFilters && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/40 px-6 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-[var(--color-muted-foreground)]" />
            <p className="mt-3 text-sm font-medium text-[var(--color-foreground)]">
              Configure filters and generate the report
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Data loads only after you click Generate Report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
