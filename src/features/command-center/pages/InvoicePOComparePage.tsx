import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowLeft, ArrowLeftRight, FileText, ShoppingCart } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PageSpinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DocumentViewer } from '../../extraction-review/components/DocumentViewer';
import { POExtractionPanel } from '../components/POExtractionPanel';
import { useInvoiceReview } from '../hooks/useInvoiceReview';
import { usePurchaseOrderDetail } from '../../purchase-orders/hooks/usePurchaseOrderDetail';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { env } from '../../../config/env';

const InvoiceField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {label}
    </dt>
    <dd className="text-sm text-[var(--color-foreground)]">{value || '—'}</dd>
  </div>
);

export const InvoicePOComparePage: React.FC = () => {
  const { invoiceId, poId } = useParams<{ invoiceId: string; poId: string }>();
  const navigate = useNavigate();

  const invoiceQuery = useInvoiceReview(invoiceId ?? '');
  const poQuery = usePurchaseOrderDetail(poId ?? '');

  const [invoiceDocUrl, setInvoiceDocUrl] = useState<string | undefined>();
  const [invoiceDocType, setInvoiceDocType] = useState<'pdf' | 'image' | null>(null);
  const [poDocUrl, setPoDocUrl] = useState<string | undefined>();
  const [poDocType, setPoDocType] = useState<'pdf' | 'image' | null>(null);
  const invoiceBlobRef = useRef<string | null>(null);
  const poBlobRef = useRef<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    const token = Cookies.get('access_token');

    fetch(`${env.docExtractionUrl}/invoices/${invoiceId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') ?? '';
        if (ct.includes('pdf')) setInvoiceDocType('pdf');
        else if (ct.startsWith('image/')) setInvoiceDocType('image');
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        invoiceBlobRef.current = url;
        setInvoiceDocUrl(url);
      })
      .catch(() => {/* preview unavailable */});

    return () => {
      if (invoiceBlobRef.current) {
        URL.revokeObjectURL(invoiceBlobRef.current);
        invoiceBlobRef.current = null;
      }
    };
  }, [invoiceId]);

  useEffect(() => {
    if (!poId) return;
    const token = Cookies.get('access_token');

    fetch(`${env.docExtractionUrl}/purchase-orders/${poId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') ?? '';
        if (ct.includes('pdf')) setPoDocType('pdf');
        else if (ct.startsWith('image/')) setPoDocType('image');
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        poBlobRef.current = url;
        setPoDocUrl(url);
      })
      .catch(() => {/* preview unavailable */});

    return () => {
      if (poBlobRef.current) {
        URL.revokeObjectURL(poBlobRef.current);
        poBlobRef.current = null;
      }
    };
  }, [poId]);

  if (!invoiceId || !poId) {
    return <ErrorState kind="notFound" title="Invoice or PO not specified" />;
  }

  if (invoiceQuery.isLoading || poQuery.isLoading) return <PageSpinner />;

  if (invoiceQuery.isError || !invoiceQuery.data || poQuery.isError || !poQuery.data) {
    return (
      <ErrorState
        kind="generic"
        title="Failed to load comparison"
        description="Could not load invoice or purchase order details."
        onRetry={() => {
          invoiceQuery.refetch();
          poQuery.refetch();
        }}
      />
    );
  }

  const { header, extraction } = invoiceQuery.data;
  const po = poQuery.data;
  const backHref = `/command-center/invoice/${invoiceId}`;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(backHref)} title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-[var(--color-foreground)]">
                Document Comparison
              </h1>
              <ArrowLeftRight className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-sm">
              <span className="font-medium text-[var(--color-foreground)]">
                {header.invoice_number || 'Invoice'}
              </span>
              <span className="text-[var(--color-muted-foreground)]">vs</span>
              <span className="font-medium text-[var(--color-foreground)]">{po.po_number}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {header.invoice_status && (
            <StatusBadge status={header.invoice_status} type="invoice" />
          )}
          <StatusBadge status={po.status} type="po" />
        </div>
      </div>

      {/* Documents — full-width side by side, tall enough to read without cramped scrolling */}
      <div className="grid grid-cols-2 gap-4" style={{ height: 'min(72vh, 780px)' }}>
        <div className="flex flex-col min-h-0 rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
              Invoice
            </h2>
            <span className="text-xs text-[var(--color-muted-foreground)] ml-1">
              {header.invoice_number || invoiceId}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <DocumentViewer
              fileUrl={invoiceDocUrl}
              fileType={invoiceDocType}
              fitContainer
              className="h-full rounded-none border-0"
            />
          </div>
        </div>

        <div className="flex flex-col min-h-0 rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 flex-shrink-0">
            <ShoppingCart className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
              Purchase Order
            </h2>
            <span className="text-xs text-[var(--color-muted-foreground)] ml-1">{po.po_number}</span>
          </div>
          <div className="flex-1 min-h-0">
            <DocumentViewer
              fileUrl={poDocUrl}
              fileType={poDocType}
              fitContainer
              className="h-full rounded-none border-0"
            />
          </div>
        </div>
      </div>

      {/* Extraction details — below documents, page scrolls naturally */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 space-y-4">
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
                Invoice Details
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <InvoiceField label="Invoice Number" value={header.invoice_number} />
                <InvoiceField label="Invoice Date" value={formatDate(header.invoice_date)} />
                <InvoiceField label="Due Date" value={formatDate(header.due_date)} />
                <InvoiceField label="Payment Terms" value={header.payment_terms} />
                <InvoiceField
                  label="Total Amount"
                  value={
                    header.total_amount != null
                      ? formatCurrency(header.total_amount, 'INR')
                      : null
                  }
                />
                <InvoiceField label="Vendor" value={header.vendor?.vendor_name} />
                <InvoiceField label="Vendor GSTIN" value={header.vendor?.gstin} />
                <InvoiceField label="Company" value={header.company?.company_name} />
              </dl>
            </section>

            {extraction.vendor_details && (
              <section className="border-t border-[var(--color-border)] pt-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
                  Extracted Vendor
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <InvoiceField label="Name" value={extraction.vendor_details.vendor_name} />
                  <InvoiceField label="GSTIN" value={extraction.vendor_details.vendor_gstin} />
                  <InvoiceField label="Email" value={extraction.vendor_details.vendor_email} />
                </dl>
              </section>
            )}

            <section className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  Line Items
                </h3>
                <span className="text-[10px] text-[var(--color-muted-foreground)]">
                  {extraction.line_items.length} line{extraction.line_items.length !== 1 ? 's' : ''}
                </span>
              </div>
              {extraction.line_items.length === 0 ? (
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
                      {extraction.line_items.map((line) => (
                        <tr key={line.id}>
                          <td className="px-2 py-1.5 text-[var(--color-muted-foreground)]">{line.line_number}</td>
                          <td className="px-2 py-1.5">
                            <p className="font-medium truncate max-w-[120px]">{line.item_description}</p>
                            {line.item_code && (
                              <p className="text-[10px] text-[var(--color-muted-foreground)]">{line.item_code}</p>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            {line.quantity_billed} {line.uom}
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium">
                            {formatCurrency(line.line_total, 'INR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
          <POExtractionPanel data={po} compact />
        </div>
      </div>
    </div>
  );
};
