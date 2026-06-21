import React from 'react';
import { FileText } from 'lucide-react';
import type { PurchaseOrderListItem } from '../types/purchaseOrder.types';

interface PoStatusTableProps {
  purchaseOrders: PurchaseOrderListItem[];
  isLoading?: boolean;
  compact?: boolean;
}

const formatStatusLabel = (status: string) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'partially_fulfilled':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'fulfilled':
      return 'bg-slate-100 text-slate-700 ring-slate-600/20';
    case 'closed':
      return 'bg-slate-100 text-slate-500 ring-slate-500/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  }
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const formatAmount = (amount: number | null, currency: string) => {
  if (amount === null) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const PoStatusTable: React.FC<PoStatusTableProps> = ({
  purchaseOrders,
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center text-slate-400 text-sm">
        Loading purchase orders...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                PO Number
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                PO Date
              </th>
              {!compact && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              {!compact && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Uploaded
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={compact ? 3 : 5}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <span>No purchase orders yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {po.po_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(po.po_date)}
                  </td>
                  {!compact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatAmount(po.total_amount, po.currency)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${getStatusStyles(po.status)}`}
                    >
                      {formatStatusLabel(po.status)}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(po.created_at)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
