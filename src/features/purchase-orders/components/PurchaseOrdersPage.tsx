import React, { useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { POUploadModal } from './POUploadModal';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { PurchaseOrderListItem } from '../types/purchaseOrder.types';
import type { Column } from '../../../components/ui/DataTable';

const columns: Column<PurchaseOrderListItem>[] = [
  {
    key: 'po_number',
    header: 'PO Number',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-[var(--color-foreground)]">{row.po_number || '—'}</span>
    ),
  },
  {
    key: 'po_date',
    header: 'PO Date',
    render: (row) => <span className="text-[var(--color-muted-foreground)]">{formatDate(row.po_date)}</span>,
  },
  {
    key: 'total_amount',
    header: 'Total Amount',
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
    key: 'currency',
    header: 'Currency',
    render: (row) => row.currency ? (
      <Badge variant="secondary">{row.currency}</Badge>
    ) : <span className="text-[var(--color-muted-foreground)]">—</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="po" />,
  },
  {
    key: 'created_at',
    header: 'Uploaded',
    render: (row) => <span className="text-[var(--color-muted-foreground)]">{formatDate(row.created_at)}</span>,
  },
];

export const PurchaseOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError, refetch, isFetching } = usePurchaseOrders(page, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="View and manage all uploaded purchase orders."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              leftIcon={<Upload className="h-3.5 w-3.5" />}
              onClick={() => setUploadOpen(true)}
            >
              Upload PO
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        error={isError}
        onPageChange={setPage}
        onRetry={() => refetch()}
        rowKey={(row) => row.id}
        emptyTitle="No purchase orders yet"
        emptyDescription="Upload a PO document to get started with extraction."
      />

      <POUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};
