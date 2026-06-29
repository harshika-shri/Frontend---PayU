import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowLeft, Building2, CalendarDays, CircleDollarSign, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PageSpinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DocumentViewer } from '../../extraction-review/components/DocumentViewer';
import { usePurchaseOrderDetail } from '../hooks/usePurchaseOrderDetail';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { env } from '../../../config/env';
import { cn } from '../../../utils/cn';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {label}
    </dt>
    <dd className="text-sm text-[var(--color-foreground)]">{value || '—'}</dd>
  </div>
);

export const PurchaseOrderDetailPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const { data, isLoading, isError, refetch } = usePurchaseOrderDetail(poId ?? '');

  const [docUrl, setDocUrl] = useState<string | undefined>();
  const [docFileType, setDocFileType] = useState<'pdf' | 'image' | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!poId) return;
    const token = Cookies.get('access_token');

    fetch(`${env.docExtractionUrl}/purchase-orders/${poId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') ?? '';
        if (ct.includes('pdf')) setDocFileType('pdf');
        else if (ct.startsWith('image/')) setDocFileType('image');
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setDocUrl(url);
      })
      .catch(() => {/* preview unavailable */});

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [poId]);

  if (!poId) return <ErrorState kind="notFound" title="No purchase order selected" />;
  if (isLoading) return <PageSpinner />;
  if (isError || !data) {
    return (
      <ErrorState
        kind="generic"
        title="Failed to load purchase order"
        description="Could not retrieve PO details."
        onRetry={() => refetch()}
      />
    );
  }

  const remaining =
    data.total_amount != null ? data.total_amount - data.consumed_amount : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(returnTo ?? '/purchase-orders')}
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[var(--color-foreground)] truncate">
              {data.po_number}
              {data.vendor?.vendor_name && (
                <span className="font-normal text-[var(--color-muted-foreground)] ml-2">
                  · {data.vendor.vendor_name}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <StatusBadge status={data.status} type="po" />
              {data.uploaded_by && (
                <span className="text-[10px] text-[var(--color-muted-foreground)]">
                  Uploaded by {data.uploaded_by.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document + extraction details */}
      <div className="grid grid-cols-2 gap-4" style={{ height: '520px' }}>
        <DocumentViewer fileUrl={docUrl} fileType={docFileType} className="h-full" />

        <div className="flex flex-col h-full rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Extraction Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* PO header */}
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
                Purchase Order
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
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

            {/* Vendor */}
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

            {/* Uploader (manager only — API omits for associates) */}
            {data.uploaded_by && (
              <section className="border-t border-[var(--color-border)] pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    Uploaded By
                  </h3>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Name" value={data.uploaded_by.name} />
                  <Field label="Email" value={data.uploaded_by.email} />
                  <Field label="Uploaded On" value={formatDateTime(data.created_at)} />
                </dl>
              </section>
            )}

            {/* Budget */}
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
                    remaining != null
                      ? formatCurrency(remaining, data.currency || 'INR')
                      : null
                  }
                />
              </dl>
            </section>

            {/* Line items */}
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
                            <p className="font-medium text-[var(--color-foreground)] truncate max-w-[140px]">
                              {line.item_description}
                            </p>
                            {line.item_code && (
                              <p className="text-[10px] text-[var(--color-muted-foreground)]">{line.item_code}</p>
                            )}
                          </td>
                          <td className={cn('px-2 py-1.5 text-right')}>
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
        </div>
      </div>
    </div>
  );
};
