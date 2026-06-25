import React from 'react';
import { Badge } from '../../../../components/ui/Badge';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { cn } from '../../../../utils/cn';
import type { POCandidateResponse } from '../../types/invoiceReview.types';

interface POCandidatesTabProps {
  poCandidates: POCandidateResponse;
}

export const POCandidatesTab: React.FC<POCandidatesTabProps> = ({ poCandidates }) => {
  if (!poCandidates.candidate_groups.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-[var(--color-foreground)]">No PO candidates</p>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">
          No matching purchase orders were found for this invoice during validation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {poCandidates.candidate_groups.length} candidate group
        {poCandidates.candidate_groups.length > 1 ? 's' : ''} found. Groups marked as selected
        are the current best match.
      </p>

      {poCandidates.candidate_groups.map((group) => (
        <div
          key={group.id}
          className={cn(
            'rounded-lg border overflow-hidden',
            group.is_selected
              ? 'border-[var(--color-primary)] shadow-[var(--shadow-xs)]'
              : 'border-[var(--color-border)]',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between px-4 py-2.5 border-b',
              group.is_selected
                ? 'bg-[var(--color-primary-muted)] border-blue-100'
                : 'bg-[var(--color-muted)] border-[var(--color-border)]',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-foreground)] uppercase tracking-wide">
                {group.candidate_type.replace(/_/g, ' ')}
              </span>
              {group.is_selected && (
                <Badge variant="default" dot>
                  Selected
                </Badge>
              )}
            </div>
            {group.confidence_score != null && (
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Confidence:{' '}
                <span className="font-medium text-[var(--color-foreground)]">
                  {Math.round(group.confidence_score * 100)}%
                </span>
              </span>
            )}
          </div>

          <div className="bg-white divide-y divide-[var(--color-border)]">
            {group.purchase_orders.map((po) => (
              <div key={po.po_id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {po.po_number}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      {po.vendor_name ?? 'Unknown vendor'} · {formatDate(po.po_date)}
                    </p>
                  </div>
                  <StatusBadge status={po.status} type="po" />
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--color-muted-foreground)]">
                  <span>
                    Total:{' '}
                    <span className="font-medium text-[var(--color-foreground)]">
                      {po.total_amount != null ? formatCurrency(po.total_amount, 'INR') : '—'}
                    </span>
                  </span>
                  <span>
                    Consumed:{' '}
                    <span className="font-medium text-[var(--color-foreground)]">
                      {formatCurrency(po.consumed_amount, 'INR')}
                    </span>
                  </span>
                  {po.total_amount != null && (
                    <span>
                      Remaining:{' '}
                      <span className="font-medium text-[var(--color-foreground)]">
                        {formatCurrency(po.total_amount - po.consumed_amount, 'INR')}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
