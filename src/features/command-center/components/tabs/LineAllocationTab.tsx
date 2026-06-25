import React from 'react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import { formatCurrency } from '../../../../utils/formatters';
import type { LineAllocationCandidateResponse } from '../../types/invoiceReview.types';

interface LineAllocationTabProps {
  lineAllocation: LineAllocationCandidateResponse;
}

export const LineAllocationTab: React.FC<LineAllocationTabProps> = ({ lineAllocation }) => {
  if (!lineAllocation.candidate_groups.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-[var(--color-foreground)]">No allocation candidates</p>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">
          No line allocation candidates were generated for this invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {lineAllocation.candidate_groups.length} allocation group
        {lineAllocation.candidate_groups.length > 1 ? 's' : ''}. Groups marked as selected
        represent the current line allocation plan.
      </p>

      {lineAllocation.candidate_groups.map((group) => (
        <div
          key={group.id}
          className={cn(
            'rounded-lg border overflow-hidden',
            group.is_selected
              ? 'border-[var(--color-primary)]'
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
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]">
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

          <div className="bg-white overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--color-border)]">
                  {[
                    'Invoice Line',
                    'PO Line',
                    'Qty Allocated',
                    'Amount Allocated',
                    'Type',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] whitespace-nowrap border-r border-[var(--color-border)] last:border-r-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 border-r border-[var(--color-border)] min-w-[180px]">
                      <p className="font-medium text-[var(--color-foreground)] truncate max-w-[160px]">
                        {item.invoice_line_item.item_description || item.invoice_line_item.item_code || '—'}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        Qty: {item.invoice_line_item.quantity_billed} ·{' '}
                        {formatCurrency(item.invoice_line_item.line_total, 'INR')}
                      </p>
                    </td>
                    <td className="px-3 py-3 border-r border-[var(--color-border)] min-w-[180px]">
                      <p className="font-medium text-[var(--color-foreground)] truncate max-w-[160px]">
                        {item.po_line_item.item_description || item.po_line_item.item_code || '—'}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        Ordered: {item.po_line_item.quantity_ordered} · Consumed:{' '}
                        {item.po_line_item.consumed_quantity}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right font-medium border-r border-[var(--color-border)]">
                      {item.allocated_quantity}
                    </td>
                    <td className="px-3 py-3 text-right font-medium border-r border-[var(--color-border)]">
                      {formatCurrency(item.allocated_amount, 'INR')}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary">
                        {item.candidate_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
