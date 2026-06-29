import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw, Eye } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { POUploadModal } from './POUploadModal';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { PurchaseOrderListItem } from '../types/purchaseOrder.types';
import type { Column } from '../../../components/ui/DataTable';

export const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError, refetch, isFetching } = usePurchaseOrders(page, PAGE_SIZE);

  const handleView = (id: string) => navigate(`/purchase-orders/${id}`);

  const columns = useMemo<Column<PurchaseOrderListItem>[]>(() => {
    const base: Column<PurchaseOrderListItem>[] = [
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
        render: (row) => (
          <span className="text-[var(--color-muted-foreground)]">{formatDate(row.po_date)}</span>
        ),
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
        render: (row) =>
          row.currency ? (
            <Badge variant="secondary">{row.currency}</Badge>
          ) : (
            <span className="text-[var(--color-muted-foreground)]">—</span>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <StatusBadge status={row.status} type="po" />,
      },
    ];

    if (isManager) {
      base.push({
        key: 'uploaded_by',
        header: 'Uploaded By',
        render: (row) => (
          <div className="min-w-0">
            <p className="text-sm text-[var(--color-foreground)] truncate">
              {row.uploaded_by?.name ?? '—'}
            </p>
            {row.uploaded_by?.email && (
              <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">
                {row.uploaded_by.email}
              </p>
            )}
          </div>
        ),
      });
    }

    base.push(
      {
        key: 'created_at',
        header: 'Uploaded',
        render: (row) => (
          <span className="text-[var(--color-muted-foreground)]">{formatDate(row.created_at)}</span>
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
              handleView(row.id);
            }}
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            View
          </Button>
        ),
      },
    );

    return base;
  }, [isManager, navigate]);

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description={
          isManager
            ? 'View all uploaded purchase orders and who uploaded each one.'
            : 'View purchase orders you have uploaded.'
        }
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
        emptyDescription={
          isManager
            ? 'No purchase orders have been uploaded yet.'
            : 'Upload a PO document to get started with extraction.'
        }
      />

      <POUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};
