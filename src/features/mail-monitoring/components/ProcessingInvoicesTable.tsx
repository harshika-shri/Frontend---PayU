import React from 'react';
import { Inbox } from 'lucide-react';
import type { InvoiceProcessingItem } from '../types/mailMonitoring.types';

interface ProcessingInvoicesTableProps {
  invoices: InvoiceProcessingItem[];
  isLoading?: boolean;
  compact?: boolean;
}

const formatStatusLabel = (status: string) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getExtractionStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
    case 'ocr_processing':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'extracted':
      return 'bg-sky-50 text-sky-700 ring-sky-600/20';
    case 'low_confidence':
    case 'human_review_needed':
      return 'bg-orange-50 text-orange-700 ring-orange-600/20';
    case 'extraction_approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  }
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const formatAmount = (amount: number | null, currency: string | null) => {
  if (amount === null) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const ProcessingInvoicesTable: React.FC<ProcessingInvoicesTableProps> = ({
  invoices,
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center text-slate-400 text-sm">
        Loading invoices...
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
                Invoice
              </th>
              {!compact && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Received From
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Extraction
              </th>
              {!compact && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Validation
                </th>
              )}
              {!compact && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Received
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={compact ? 3 : 6}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-300" />
                    <span>No invoices currently in process.</span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {invoice.invoice_number || 'Pending extraction'}
                    </div>
                    {invoice.invoice_date && (
                      <div className="text-xs text-slate-500">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  {!compact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {invoice.received_email || '—'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${getExtractionStatusStyles(invoice.extraction_status)}`}
                    >
                      {formatStatusLabel(invoice.extraction_status)}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {invoice.invoice_status
                        ? formatStatusLabel(invoice.invoice_status)
                        : '—'}
                    </td>
                  )}
                  {!compact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatAmount(invoice.total_amount, invoice.currency)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(invoice.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
