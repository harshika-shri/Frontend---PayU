import React from 'react';
import { Building2, CalendarDays, CircleDollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import type { PurchaseOrderDetailResponse } from '../../purchase-orders/types/purchaseOrder.types';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {label}
    </dt>
    <dd className="text-sm text-[var(--color-foreground)]">{value || '—'}</dd>
  </div>
);

interface POExtractionPanelProps {
  data: PurchaseOrderDetailResponse;
  compact?: boolean;
}

export const POExtractionPanel: React.FC<POExtractionPanelProps> = ({ data, compact }) => {
  const remaining =
    data.total_amount != null ? data.total_amount - data.consumed_amount : null;

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
          Purchase Order
        </h3>
        <dl className={cn('grid gap-x-4 gap-y-3', compact ? 'grid-cols-2' : 'grid-cols-2')}>
          <Field label="PO Number" value={data.po_number} />
          <Field label="PO Date" value={formatDate(data.po_date)} />
          <Field label="Valid Until" value={formatDate(data.valid_until)} />
          <Field label="Payment Terms" value={data.payment_terms} />
          <Field label="Currency" value={data.currency} />
          <Field
            label="Total Amount"
            value={
              data.total_amount != null
                ? formatCurrency(data.total_amount, data.currency || 'INR')
                : null
            }
          />
        </dl>
      </section>

      <section className="border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Building2 className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Vendor
          </h3>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Name" value={data.vendor?.vendor_name} />
          <Field label="Code" value={data.vendor?.vendor_code} />
          <Field label="GSTIN" value={data.vendor?.gstin} />
          <Field label="Email" value={data.vendor?.email} />
        </dl>
      </section>

      <section className="border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <CircleDollarSign className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Budget
          </h3>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field
            label="Consumed"
            value={formatCurrency(data.consumed_amount, data.currency || 'INR')}
          />
          <Field
            label="Remaining"
            value={
              remaining != null ? formatCurrency(remaining, data.currency || 'INR') : null
            }
          />
        </dl>
      </section>

      <section className="border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Line Items
            </h3>
          </div>
          <span className="text-[10px] text-[var(--color-muted-foreground)]">
            {data.line_items.length} line{data.line_items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {data.line_items.length === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">No line items extracted.</p>
        ) : (
          <div className="rounded border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[var(--color-muted)]/50">
                <tr>
                  <th className="px-2 py-1.5 text-left font-semibold text-[var(--color-muted-foreground)]">#</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-[var(--color-muted-foreground)]">Item</th>
                  <th className="px-2 py-1.5 text-right font-semibold text-[var(--color-muted-foreground)]">Qty</th>
                  <th className="px-2 py-1.5 text-right font-semibold text-[var(--color-muted-foreground)]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.line_items.map((line) => (
                  <tr key={line.id} className="hover:bg-[var(--color-muted)]/30">
                    <td className="px-2 py-1.5 text-[var(--color-muted-foreground)]">{line.line_number}</td>
                    <td className="px-2 py-1.5">
                      <p className="font-medium text-[var(--color-foreground)] truncate max-w-[120px]">
                        {line.item_description}
                      </p>
                      {line.item_code && (
                        <p className="text-[10px] text-[var(--color-muted-foreground)]">{line.item_code}</p>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {line.quantity_ordered} {line.uom}
                    </td>
                    <td className="px-2 py-1.5 text-right font-medium">
                      {formatCurrency(line.line_total, data.currency || 'INR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
