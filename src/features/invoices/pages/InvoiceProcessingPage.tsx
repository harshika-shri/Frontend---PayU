import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ClipboardCheck, Clock } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DataTable } from '../../../components/ui/DataTable';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useProcessingInvoices } from '../hooks/useProcessingInvoices';
import { formatDate, formatDateTime, formatCurrency } from '../../../utils/formatters';
import type { InvoiceProcessingItem } from '../types/invoice.types';
import type { Column } from '../../../components/ui/DataTable';

const REVIEW_STATUSES = new Set(['human_review_needed', 'low_confidence']);

const columns = (onReview: (id: string) => void): Column<InvoiceProcessingItem>[] => [
  {
    key: 'invoice_number',
    header: 'Invoice #',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">
        {row.invoice_number || <span className="text-[var(--color-muted-foreground)] italic">Extracting…</span>}
      </span>
    ),
  },
  {
    key: 'invoice_date',
    header: 'Invoice Date',
    render: (row) => <span className="text-[var(--color-muted-foreground)]">{formatDate(row.invoice_date)}</span>,
  },
  {
    key: 'total_amount',
    header: 'Amount',
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="font-medium">
        {row.total_amount != null
          ? formatCurrency(row.total_amount, row.currency || 'INR')
          : '—'}
      </span>
    ),
  },
  {
    key: 'extraction_status',
    header: 'Extraction',
    render: (row) => <StatusBadge status={row.extraction_status} type="extraction" />,
  },
  {
    key: 'invoice_status',
    header: 'Invoice Status',
    render: (row) =>
      row.invoice_status ? (
        <StatusBadge status={row.invoice_status} type="invoice" />
      ) : (
        <span className="text-[var(--color-muted-foreground)]">—</span>
      ),
  },
  {
    key: 'created_at',
    header: 'Received',
    render: (row) => <span className="text-[var(--color-muted-foreground)]">{formatDateTime(row.created_at)}</span>,
  },
  {
    key: 'actions',
    header: '',
    render: (row) =>
      REVIEW_STATUSES.has(row.extraction_status) ? (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onReview(row.id); }}
          leftIcon={<ClipboardCheck className="h-3.5 w-3.5" />}
        >
          Review
        </Button>
      ) : null,
  },
];

export const InvoiceProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError, refetch, isFetching } = useProcessingInvoices(page, PAGE_SIZE);

  const handleReview = (id: string) => navigate(`/extraction-review/${id}`);

  return (
    <div>
      <PageHeader
        title="Invoice Processing"
        description="Monitor invoices currently being extracted and validated. Auto-refreshes every 5 seconds."
        actions={
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Refreshing
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {!isLoading && !isError && data?.items.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-white">
          <EmptyState
            icon={<Clock className="h-6 w-6 text-[var(--color-muted-foreground)]" />}
            title="No invoices processing"
            description="Invoices uploaded via email monitoring or the upload page will appear here during extraction."
            action={{ label: 'Upload an invoice', onClick: () => navigate('/invoices/upload') }}
          />
        </div>
      ) : (
        <DataTable
          columns={columns(handleReview)}
          data={data?.items ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          loading={isLoading}
          error={isError}
          onPageChange={setPage}
          onRetry={() => refetch()}
          rowKey={(row) => row.id}
          emptyTitle="No invoices found"
        />
      )}
    </div>
  );
};
