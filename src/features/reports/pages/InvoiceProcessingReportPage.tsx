import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { InvoiceReportFiltersPanel } from '../components/InvoiceReportFiltersPanel';
import { useReportFilterOptions } from '../hooks/useReports';
import {
  downloadReportBlob,
  reportService,
} from '../services/reportService';
import type {
  InvoiceReportFilters,
  InvoiceReportItem,
  InvoiceReportQuery,
} from '../types/report.types';
import {
  getValidationOutcomeBadgeVariant,
  getValidationOutcomeLabel,
} from '../../command-center/utils/validationOutcomeUtils';

const PAGE_SIZE = 20;

const formatStatusLabel = (value: string | null | undefined) => {
  if (!value) return '—';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const columns: Column<InvoiceReportItem>[] = [
  {
    key: 'invoice_number',
    header: 'Invoice #',
    sortable: true,
    render: (row) => row.invoice_number || '—',
  },
  {
    key: 'invoice_date',
    header: 'Invoice Date',
    sortable: true,
    render: (row) => formatDate(row.invoice_date),
  },
  {
    key: 'due_date',
    header: 'Due Date',
    sortable: true,
    render: (row) => formatDate(row.due_date),
  },
  {
    key: 'invoice_status',
    header: 'Invoice Status',
    sortable: true,
    render: (row) =>
      row.invoice_status ? (
        <StatusBadge status={row.invoice_status} type="invoice" />
      ) : (
        '—'
      ),
  },
  {
    key: 'validation_outcome',
    header: 'Validation Outcome',
    sortable: true,
    render: (row) =>
      row.validation_outcome ? (
        <Badge variant={getValidationOutcomeBadgeVariant(row.validation_outcome)}>
          {getValidationOutcomeLabel(row.validation_outcome)}
        </Badge>
      ) : (
        '—'
      ),
  },
  {
    key: 'total_amount',
    header: 'Total Amount',
    sortable: true,
    render: (row) => formatCurrency(row.total_amount, row.currency ?? 'INR'),
  },
  {
    key: 'tax_amount',
    header: 'Tax Amount',
    render: (row) => formatCurrency(row.tax_amount, row.currency ?? 'INR'),
  },
  {
    key: 'currency',
    header: 'Currency',
    render: (row) => row.currency || '—',
  },
  {
    key: 'vendor_name',
    header: 'Vendor Name',
    sortable: true,
    render: (row) => row.vendor_name || '—',
  },
  {
    key: 'vendor_gstin',
    header: 'Vendor GSTIN',
    render: (row) => row.vendor_gstin || '—',
  },
  {
    key: 'vendor_email',
    header: 'Vendor Email',
    render: (row) => row.vendor_email || '—',
  },
  {
    key: 'company_name',
    header: 'Company Name',
    sortable: true,
    render: (row) => row.company_name || '—',
  },
  {
    key: 'po_number',
    header: 'PO Number',
    sortable: true,
    render: (row) => row.po_number || '—',
  },
  {
    key: 'po_date',
    header: 'PO Date',
    render: (row) => formatDate(row.po_date),
  },
  {
    key: 'po_status',
    header: 'PO Status',
    render: (row) => (row.po_status ? formatStatusLabel(row.po_status) : '—'),
  },
  {
    key: 'assigned_finance_associate',
    header: 'Finance Associate',
    render: (row) => row.assigned_finance_associate || '—',
  },
  {
    key: 'assigned_finance_manager',
    header: 'Finance Manager',
    render: (row) => row.assigned_finance_manager || '—',
  },
  {
    key: 'resolution_type',
    header: 'Resolution Type',
    render: (row) => row.resolution_type || '—',
  },
  {
    key: 'validation_issue_count',
    header: 'Issues',
    render: (row) => row.validation_issue_count,
  },
  {
    key: 'highest_issue_severity',
    header: 'Highest Severity',
    render: (row) =>
      row.highest_issue_severity ? (
        <Badge variant="outline">{formatStatusLabel(row.highest_issue_severity)}</Badge>
      ) : (
        '—'
      ),
  },
  {
    key: 'workflow_status',
    header: 'Workflow Status',
    render: (row) => formatStatusLabel(row.workflow_status),
  },
  {
    key: 'approved_by',
    header: 'Approved By',
    render: (row) => row.approved_by || '—',
  },
  {
    key: 'rejected_by',
    header: 'Rejected By',
    render: (row) => row.rejected_by || '—',
  },
  {
    key: 'escalated_by',
    header: 'Escalated By',
    render: (row) => row.escalated_by || '—',
  },
];

export const InvoiceProcessingReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [draftFilters, setDraftFilters] = useState<InvoiceReportFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<InvoiceReportFilters | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('invoice_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState(false);

  const { data: filterOptions } = useReportFilterOptions();

  const queryParams = useMemo<InvoiceReportQuery | null>(() => {
    if (!appliedFilters) return null;

    return {
      ...appliedFilters,
      search: search || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      page_size: PAGE_SIZE,
    };
  }, [appliedFilters, page, search, sortBy, sortDir]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['reports', 'invoices', queryParams],
    queryFn: () => reportService.listInvoices(queryParams!),
    enabled: queryParams !== null,
  });

  const handleGenerate = () => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  };

  const handleReset = () => {
    setDraftFilters({});
  };

  const handleExport = useCallback(async () => {
    if (!queryParams) return;

    setExporting(true);
    try {
      const blob = await reportService.exportInvoices({
        ...queryParams,
        page: undefined,
        page_size: undefined,
      });
      downloadReportBlob(blob, 'invoice-processing-report.xlsx');
    } finally {
      setExporting(false);
    }
  }, [queryParams]);

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
          title="Invoice Processing Report"
          description="Filter, analyze, and export comprehensive invoice processing data."
          className="mb-0"
        />
      </div>

      <div className="space-y-4">
        <InvoiceReportFiltersPanel
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
            searchPlaceholder="Search invoices…"
            emptyTitle="No invoices found"
            emptyDescription="Adjust your filters and generate the report again."
            className="overflow-x-auto"
            rowKey={(row) => row.invoice_id}
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
            <FileSpreadsheet className="mx-auto h-8 w-8 text-[var(--color-muted-foreground)]" />
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
