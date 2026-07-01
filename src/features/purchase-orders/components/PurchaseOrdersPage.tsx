import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { POUploadModal } from './POUploadModal';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { PurchaseOrderListItem } from '../types/purchaseOrder.types';
import { cn } from '../../../utils/cn';

const FETCH_LIMIT = 500;

const dayKeyForPo = (po: PurchaseOrderListItem) => {
  const raw = po.po_date || po.created_at;
  if (!raw) return 'unknown';
  return raw.slice(0, 10);
};

const matchesSearch = (po: PurchaseOrderListItem, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    (po.po_number?.toLowerCase().includes(q) ?? false) ||
    (po.status?.toLowerCase().includes(q) ?? false) ||
    (po.currency?.toLowerCase().includes(q) ?? false) ||
    (po.uploaded_by?.name?.toLowerCase().includes(q) ?? false) ||
    (po.uploaded_by?.email?.toLowerCase().includes(q) ?? false)
  );
};

export const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch, isFetching } = usePurchaseOrders(1, FETCH_LIMIT);

  const handleView = (id: string) => navigate(`/purchase-orders/${id}`);

  const filteredItems = useMemo(
    () => (data?.items ?? []).filter((po) => matchesSearch(po, search)),
    [data?.items, search],
  );

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, PurchaseOrderListItem[]>();

    for (const po of filteredItems) {
      const dayKey = dayKeyForPo(po);
      const existing = groups.get(dayKey) ?? [];
      existing.push(po);
      groups.set(dayKey, existing);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredItems]);

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  };

  const formatDayLabel = (dayKey: string) => {
    if (dayKey === 'unknown') return 'Unknown date';
    return formatDate(dayKey);
  };

  const renderRow = (row: PurchaseOrderListItem) => (
    <tr
      key={row.id}
      className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50 transition-colors"
    >
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="font-medium text-[var(--color-foreground)]">{row.po_number || '—'}</span>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--color-muted-foreground)]">
        {formatDate(row.po_date)}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-right font-medium">
        {row.total_amount != null
          ? formatCurrency(row.total_amount, row.currency || 'INR')
          : '—'}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        {row.currency ? (
          <Badge variant="secondary">{row.currency}</Badge>
        ) : (
          <span className="text-[var(--color-muted-foreground)]">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={row.status} type="po" />
      </td>
      {isManager && (
        <td className="px-4 py-3.5 whitespace-nowrap">
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
        </td>
      )}
      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--color-muted-foreground)]">
        {formatDate(row.created_at)}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
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
      </td>
    </tr>
  );

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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by PO number, status, currency, or uploader…"
          className="max-w-md"
        />
        {data?.total != null && (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {filteredItems.length} of {data.total} purchase orders
            {data.total > FETCH_LIMIT ? ` (showing latest ${FETCH_LIMIT})` : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <Card noPadding>
          <TableSkeleton rows={6} cols={isManager ? 8 : 7} />
        </Card>
      ) : isError ? (
        <Card>
          <ErrorState onRetry={() => refetch()} className="py-12" />
        </Card>
      ) : groupedByDay.length === 0 ? (
        <Card noPadding>
          <EmptyState
            title={search ? 'No matching purchase orders' : 'No purchase orders yet'}
            description={
              search
                ? 'Try a different search term.'
                : isManager
                  ? 'No purchase orders have been uploaded yet.'
                  : 'Upload a PO document to get started with extraction.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedByDay.map(([dayKey, items]) => {
            const isExpanded = expandedDays.has(dayKey);

            return (
              <Card key={dayKey} noPadding className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleDay(dayKey)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3',
                    'bg-[var(--color-muted)] hover:bg-slate-100 transition-colors text-left',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
                    )}
                    <span className="text-sm font-semibold text-[var(--color-foreground)]">
                      {formatDayLabel(dayKey)}
                    </span>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-white">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            PO Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            PO Date
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            Total Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            Currency
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            Status
                          </th>
                          {isManager && (
                            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                              Uploaded By
                            </th>
                          )}
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            Uploaded
                          </th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>{items.map(renderRow)}</tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <POUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};
