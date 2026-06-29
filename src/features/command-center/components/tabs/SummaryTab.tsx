import React from 'react';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Badge } from '../../../../components/ui/Badge';
import { formatDate, formatDateTime, formatCurrency } from '../../../../utils/formatters';
import type { InvoiceHeaderResponse, InvoiceValidationResponse } from '../../types/invoiceReview.types';
import {
  getValidationOutcomeBadgeVariant,
  getValidationOutcomeLabel,
} from '../../utils/validationOutcomeUtils';

interface SummaryTabProps {
  header: InvoiceHeaderResponse;
  validation: InvoiceValidationResponse;
  confidenceCount: { total: number; flagged: number };
}

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {label}
    </dt>
    <dd className="text-sm text-[var(--color-foreground)]">{value || '—'}</dd>
  </div>
);

export const SummaryTab: React.FC<SummaryTabProps> = ({
  header,
  validation,
  confidenceCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)]">
        {header.invoice_status && (
          <StatusBadge status={header.invoice_status} type="invoice" />
        )}
        {validation.validation_outcome && (
          <Badge
            variant={getValidationOutcomeBadgeVariant(validation.validation_outcome)}
            dot
          >
            {getValidationOutcomeLabel(validation.validation_outcome)}
          </Badge>
        )}
        {confidenceCount.flagged > 0 && (
          <Badge variant="warning">
            {confidenceCount.flagged} low-confidence field{confidenceCount.flagged > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Core invoice info */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Invoice Details
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Invoice Number" value={header.invoice_number} />
          <Field label="Invoice Date" value={formatDate(header.invoice_date)} />
          <Field label="Due Date" value={formatDate(header.due_date)} />
          <Field label="Payment Terms" value={header.payment_terms} />
        </dl>
      </section>

      {/* Vendor */}
      <section className="border-t border-[var(--color-border)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Vendor
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Name" value={header.vendor?.vendor_name} />
          <Field label="GSTIN" value={header.vendor?.gstin} />
          <Field label="Email" value={header.vendor?.email} />
          <Field label="Code" value={header.vendor?.vendor_code} />
        </dl>
      </section>

      {/* Buyer */}
      <section className="border-t border-[var(--color-border)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Buyer Company
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Name" value={header.company?.company_name} />
          <Field label="GSTIN" value={header.company?.gstin} />
          <Field label="Code" value={header.company?.company_code} />
        </dl>
      </section>

      {/* Amounts */}
      <section className="border-t border-[var(--color-border)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Amounts
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field
            label="Subtotal"
            value={
              header.subtotal_amount != null
                ? formatCurrency(header.subtotal_amount, 'INR')
                : null
            }
          />
          <Field
            label="Tax"
            value={
              header.tax_amount != null ? formatCurrency(header.tax_amount, 'INR') : null
            }
          />
          <Field
            label="Total"
            value={
              header.total_amount != null ? (
                <span className="font-semibold">
                  {formatCurrency(header.total_amount, 'INR')}
                </span>
              ) : null
            }
          />
        </dl>
      </section>

      {/* Metadata */}
      <section className="border-t border-[var(--color-border)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
          Metadata
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Received via" value={header.received_email} />
          <Field label="Created" value={formatDateTime(header.created_at)} />
          <Field label="Last Updated" value={formatDateTime(header.updated_at)} />
        </dl>
      </section>

      {header.notes && (
        <section className="border-t border-[var(--color-border)] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2">
            Notes
          </h3>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{header.notes}</p>
        </section>
      )}
    </div>
  );
};
