import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate, formatDateTime, formatCurrency } from '../../../utils/formatters';
import type { DashboardInvoiceListItem } from '../types/dashboard.types';
import type { Column } from '../../../components/ui/DataTable';

interface InvoiceTableProps {
  items: DashboardInvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearch?: (q: string) => void;
  bucket: string;
}

const makeColumns = (
  onView: (id: string) => void,
): Column<DashboardInvoiceListItem>[] => [
  {
    key: 'invoice_number',
    header: 'Invoice #',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">
        {row.invoice_number || <span className="text-[var(--color-muted-foreground)] italic">—</span>}
      </span>
    ),
  },
  {
    key: 'vendor_name',
    header: 'Vendor',
    render: (row) => (
      <span className="text-[var(--color-foreground)] max-w-[160px] truncate block">
        {row.vendor_name || '—'}
      </span>
    ),
  },
  {
    key: 'invoice_date',
    header: 'Invoice Date',
    render: (row) => (
      <span className="text-[var(--color-muted-foreground)]">{formatDate(row.invoice_date)}</span>
    ),
  },
  {
    key: 'total_amount',
    header: 'Amount',
    className: 'text-right',
    headerClassName: 'text-right',
    render: (row) => (
      <span className="font-medium tabular-nums">
        {row.total_amount != null ? formatCurrency(row.total_amount, 'INR') : '—'}
      </span>
    ),
  },
  {
    key: 'invoice_status',
    header: 'Status',
    render: (row) =>
      row.invoice_status ? (
        <StatusBadge status={row.invoice_status} type="invoice" />
      ) : (
        <span className="text-[var(--color-muted-foreground)]">—</span>
      ),
  },
  {
    key: 'validation_outcome',
    header: 'Validation',
    render: (row) =>
      row.validation_outcome ? (
        <Badge
          variant={
            row.validation_outcome === 'resolved' || row.validation_outcome === 'approved'
              ? 'success'
              : row.validation_outcome === 'pending_review' ||
                row.validation_outcome === 'ambiguous'
              ? 'warning'
              : row.validation_outcome === 'rejected' ||
                row.validation_outcome === 'unresolved'
              ? 'destructive'
              : 'secondary'
          }
          dot
        >
          {row.validation_outcome.replace(/_/g, ' ')}
        </Badge>
      ) : (
        <span className="text-[var(--color-muted-foreground)]">—</span>
      ),
  },
  {
    key: 'created_at',
    header: 'Received',
    render: (row) => (
      <span className="text-[var(--color-muted-foreground)]">
        {formatDateTime(row.created_at)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    render: (row) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onView(row.invoice_id);
        }}
        leftIcon={<Eye className="h-3.5 w-3.5" />}
        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        Review
      </Button>
    ),
  },
];

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  items,
  total,
  page,
  pageSize,
  loading,
  error,
  onPageChange,
  onRetry,
  onSearch,
  bucket,
}) => {
  const navigate = useNavigate();
  const handleView = (id: string) =>
    navigate(`/command-center/invoice/${id}`, { state: { bucket } });

  return (
    <DataTable
      columns={makeColumns(handleView)}
      data={items}
      total={total}
      page={page}
      pageSize={pageSize}
      loading={loading}
      error={error}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onSearch={onSearch}
      searchPlaceholder="Search by invoice number, vendor…"
      rowKey={(row) => row.invoice_id}
      emptyTitle="No invoices in this bucket"
      emptyDescription="Invoices will appear here as they move through the processing pipeline."
    />
  );
};
