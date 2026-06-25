import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { InvoiceTable } from '../components/InvoiceTable';
import { useDashboardInvoices } from '../hooks/useDashboardInvoices';
import type { DashboardBucket, InvoiceListQueryParams } from '../types/dashboard.types';

const BUCKET_META: Record<DashboardBucket, { title: string; description: string }> = {
  'ready-for-approval': {
    title: 'Ready for Approval',
    description: 'Invoices that have passed validation and are awaiting approval.',
  },
  'needs-review': {
    title: 'Needs Review',
    description: 'Invoices flagged with issues that require manual review.',
  },
  'escalated': {
    title: 'Escalated',
    description: 'Invoices escalated to a manager for further decision.',
  },
  'ready-to-pay': {
    title: 'Ready to Pay',
    description: 'Fully approved invoices ready to be processed for payment.',
  },
  'rejected': {
    title: 'Rejected',
    description: 'Invoices rejected due to unresolvable validation issues.',
  },
};

interface InvoiceBucketPageProps {
  bucket: DashboardBucket;
}

export const InvoiceBucketPage: React.FC<InvoiceBucketPageProps> = ({ bucket }) => {
  const navigate = useNavigate();
  const meta = BUCKET_META[bucket];
  const PAGE_SIZE = 20;

  const [queryParams, setQueryParams] = useState<InvoiceListQueryParams>({
    page: 1,
    page_size: PAGE_SIZE,
  });

  const { data, isLoading, isError, refetch, isFetching } = useDashboardInvoices(
    bucket,
    queryParams,
  );

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
          onClick={() => navigate('/command-center')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Command Center
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

      <InvoiceTable
        items={data?.items ?? []}
        total={data?.total_records ?? 0}
        page={queryParams.page ?? 1}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        error={isError}
        onPageChange={handlePageChange}
        onRetry={() => refetch()}
        onSearch={handleSearch}
        bucket={bucket}
      />
    </div>
  );
};
