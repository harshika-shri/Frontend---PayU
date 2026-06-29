import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, RefreshCw, UserCheck } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useManagerQueue } from '../hooks/useFinanceManager';
import { useTakeOwnership } from '../../command-center/hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatDate, formatDateTime, formatCurrency } from '../../../utils/formatters';
import {
  getValidationOutcomeBadgeVariant,
  getValidationOutcomeLabel,
} from '../../command-center/utils/validationOutcomeUtils';
import type { InvoiceListQueryParams } from '../../command-center/types/dashboard.types';
import type { DashboardInvoiceListItem } from '../../command-center/types/dashboard.types';
import type { Column } from '../../../components/ui/DataTable';
import type { ManagerQueue } from '../types/financeManager.types';

const QUEUE_META: Record<ManagerQueue, { title: string; description: string }> = {
  'my-escalated': {
    title: 'My Escalated',
    description: 'Invoices escalated to you for review and decision.',
  },
  'unassigned': {
    title: 'Unassigned Queue',
    description: 'Invoices waiting for manager ownership. Claim to take action.',
  },
  'my-claimed': {
    title: 'My Claimed Invoices',
    description: 'Invoices currently assigned to you that need resolution.',
  },
  'rejected': {
    title: 'Rejected',
    description: 'Invoices rejected under your management.',
  },
};

interface ManagerQueuePageProps {
  queue: ManagerQueue;
}

const TakeOwnershipCell: React.FC<{ invoiceId: string; onSuccess: () => void }> = ({
  invoiceId,
  onSuccess,
}) => {
  const { userId } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useTakeOwnership(invoiceId);

  const handleConfirm = async () => {
    if (!userId) return;
    setConfirmOpen(false);
    await mutation.mutateAsync({ manager_id: userId });
    onSuccess();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        loading={mutation.isPending}
        leftIcon={<UserCheck className="h-3.5 w-3.5" />}
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
      >
        Claim
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={mutation.isPending}
        title="Claim this invoice?"
        description="This invoice will be assigned to you and will appear in your Claimed queue."
        confirmLabel="Take Ownership"
      />
    </>
  );
};

export const ManagerQueuePage: React.FC<ManagerQueuePageProps> = ({ queue }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isFetching } = useManagerQueue(queue, {});
  const [queryParams, setQueryParams] = useState<InvoiceListQueryParams>({
    page: 1,
    page_size: 20,
  });
  const PAGE_SIZE = 20;
  const meta = QUEUE_META[queue];
  const isUnassigned = queue === 'unassigned';

  const makeColumns = useCallback((): Column<DashboardInvoiceListItem>[] => {
    const base: Column<DashboardInvoiceListItem>[] = [
      {
        key: 'invoice_number',
        header: 'Invoice #',
        sortable: true,
        render: (row) => (
          <span className="font-medium text-[var(--color-foreground)]">
            {row.invoice_number || '—'}
          </span>
        ),
      },
      {
        key: 'vendor_name',
        header: 'Vendor',
        render: (row) => (
          <span className="max-w-[150px] truncate block">{row.vendor_name || '—'}</span>
        ),
      },
      {
        key: 'invoice_date',
        header: 'Date',
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
              variant={getValidationOutcomeBadgeVariant(row.validation_outcome)}
              dot
            >
              {getValidationOutcomeLabel(row.validation_outcome)}
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
    ];

    base.push({
      key: 'actions',
      header: '',
      render: (row) =>
        isUnassigned ? (
          <TakeOwnershipCell invoiceId={row.invoice_id} onSuccess={() => refetch()} />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/command-center/invoice/${row.invoice_id}`, {
                state: { bucket: queue },
              });
            }}
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            className="text-[var(--color-muted-foreground)]"
          >
            Review
          </Button>
        ),
    });

    return base;
  }, [isUnassigned, navigate, queue, refetch]);

  const handleSearch = useCallback(
    (q: string) => setQueryParams((p) => ({ ...p, search: q || undefined, page: 1 })),
    [],
  );

  const handlePageChange = useCallback(
    (page: number) => setQueryParams((p) => ({ ...p, page })),
    [],
  );

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={() => navigate('/finance-manager')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Finance Manager
        </button>
        <PageHeader
          title={meta.title}
          description={`${data?.total_records ?? '—'} invoices · ${meta.description}`}
          className="mb-0"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh
            </Button>
          }
        />
      </div>

      <DataTable
        columns={makeColumns()}
        data={data?.items ?? []}
        total={data?.total_records ?? 0}
        page={queryParams.page ?? 1}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        error={isError}
        onPageChange={handlePageChange}
        onRetry={() => refetch()}
        onSearch={handleSearch}
        searchPlaceholder="Search by invoice number, vendor…"
        rowKey={(row) => row.invoice_id}
        emptyTitle="No invoices in this queue"
        emptyDescription="Invoices will appear here as they enter this stage."
      />
    </div>
  );
};
