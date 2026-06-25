import React from 'react';
import { cn } from '../../../utils/cn';
import type { LineItemReview } from '../types/extraction.types';

interface LineItemsEditorProps {
  items: LineItemReview[];
  onChange: (updated: LineItemReview[]) => void;
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({ items, onChange }) => {
  const updateItem = (
    idx: number,
    field: keyof LineItemReview,
    value: string,
  ) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const numFields = new Set<keyof LineItemReview>([
        'quantity_billed', 'unit_price', 'discount_amount', 'line_total',
      ]);
      return {
        ...item,
        [field]: numFields.has(field) ? (value === '' ? null : Number(value)) : value,
      };
    });
    onChange(updated);
  };

  if (!items.length) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)] text-center py-6">
        No line items extracted.
      </p>
    );
  }

  const cellCls = 'px-3 py-2 text-sm border-r border-[var(--color-border)] last:border-r-0';
  const inputCls =
    'w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] rounded px-1 py-0.5';

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-muted)] border-b border-[var(--color-border)]">
              {['#', 'Code', 'Description', 'UOM', 'Qty', 'Unit Price', 'Discount', 'Total'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] border-r border-[var(--color-border)] last:border-r-0 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id ?? idx}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className={cn(cellCls, 'text-[var(--color-muted-foreground)] w-8')}>
                  {item.line_number}
                </td>
                <td className={cn(cellCls, 'min-w-[80px]')}>
                  <input
                    className={inputCls}
                    value={item.item_code ?? ''}
                    onChange={(e) => updateItem(idx, 'item_code', e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[200px]')}>
                  <input
                    className={inputCls}
                    value={item.item_description ?? ''}
                    onChange={(e) => updateItem(idx, 'item_description', e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[60px]')}>
                  <input
                    className={inputCls}
                    value={item.uom ?? ''}
                    onChange={(e) => updateItem(idx, 'uom', e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[70px] text-right')}>
                  <input
                    type="number"
                    className={cn(inputCls, 'text-right')}
                    value={item.quantity_billed ?? ''}
                    onChange={(e) => updateItem(idx, 'quantity_billed', e.target.value)}
                    min={0}
                    step="any"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[90px] text-right')}>
                  <input
                    type="number"
                    className={cn(inputCls, 'text-right')}
                    value={item.unit_price ?? ''}
                    onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                    min={0}
                    step="any"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[80px] text-right')}>
                  <input
                    type="number"
                    className={cn(inputCls, 'text-right')}
                    value={item.discount_amount ?? ''}
                    onChange={(e) => updateItem(idx, 'discount_amount', e.target.value)}
                    min={0}
                    step="any"
                    placeholder="0"
                  />
                </td>
                <td className={cn(cellCls, 'min-w-[90px] text-right font-medium')}>
                  <input
                    type="number"
                    className={cn(inputCls, 'text-right font-medium')}
                    value={item.line_total ?? ''}
                    onChange={(e) => updateItem(idx, 'line_total', e.target.value)}
                    min={0}
                    step="any"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
