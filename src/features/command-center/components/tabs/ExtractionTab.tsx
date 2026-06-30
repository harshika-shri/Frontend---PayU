import React from 'react';
import { cn } from '../../../../utils/cn';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type {
  ConfidenceScoreDetails,
  InvoiceExtractionResponse,
  InvoiceHeaderResponse,
} from '../../types/invoiceReview.types';

interface ExtractionTabProps {
  extraction: InvoiceExtractionResponse;
  header: InvoiceHeaderResponse;
}

const ReadField: React.FC<{
  label: string;
  value?: string | number | null;
  confidence?: ConfidenceScoreDetails;
  className?: string;
}> = ({ label, value, confidence, className }) => {
  const tier =
    confidence == null
      ? null
      : confidence.confidence_score >= 85
      ? 'high'
      : confidence.confidence_score >= 60
      ? 'medium'
      : 'low';

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-2">
        <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
          {label}
        </dt>
        {tier && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
              tier === 'high' &&
                'bg-[var(--color-success-muted)] text-[var(--color-success-muted-foreground)] ring-green-200',
              tier === 'medium' &&
                'bg-[var(--color-warning-muted)] text-[var(--color-warning-muted-foreground)] ring-amber-200',
              tier === 'low' &&
                'bg-[var(--color-destructive-muted)] text-[var(--color-destructive-muted-foreground)] ring-red-200',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                tier === 'high' && 'bg-[var(--color-success)]',
                tier === 'medium' && 'bg-[var(--color-warning)]',
                tier === 'low' && 'bg-[var(--color-destructive)]',
              )}
            />
            {Math.round(confidence!.confidence_score)}%
            {confidence!.is_flagged && ' ⚑'}
          </span>
        )}
      </div>
      <dd
        className={cn(
          'text-sm rounded px-2 py-1 bg-[var(--color-muted)] text-[var(--color-foreground)]',
          !value && value !== 0 && 'text-[var(--color-muted-foreground)] italic',
          tier === 'low' && value && 'bg-[var(--color-destructive-muted)]',
        )}
      >
        {value != null && value !== '' ? String(value) : '—'}
      </dd>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="border border-[var(--color-border)] rounded-lg overflow-hidden">
    <div className="px-4 py-2.5 bg-[var(--color-muted)] border-b border-[var(--color-border)]">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
        {title}
      </h3>
    </div>
    <dl className="px-4 py-4 grid grid-cols-2 gap-x-6 gap-y-4 bg-white">{children}</dl>
  </section>
);

export const ExtractionTab: React.FC<ExtractionTabProps> = ({
  extraction,
  header,
}) => {
  const confMap: Record<string, ConfidenceScoreDetails> = {};
  extraction.confidence_scores.forEach((c) => {
    confMap[c.field_name] = c;
  });

  const vendor = extraction.vendor_details;
  const email = extraction.email_details;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-info-muted)] border border-sky-100 rounded-lg px-3 py-2">
        These fields are read-only. Use Extraction Review to edit extracted values.
      </p>

      <Section title="Invoice Header">
        <ReadField
          label="Invoice Number"
          value={header.invoice_number}
          confidence={confMap['invoice_number']}
        />
        <ReadField
          label="Invoice Date"
          value={formatDate(header.invoice_date)}
          confidence={confMap['invoice_date']}
        />
        <ReadField
          label="Due Date"
          value={formatDate(header.due_date)}
          confidence={confMap['due_date']}
        />
        <ReadField label="Payment Terms" value={header.payment_terms} />
        <ReadField
          label="Subtotal"
          value={
            header.subtotal_amount != null
              ? formatCurrency(header.subtotal_amount, 'INR')
              : null
          }
          confidence={confMap['subtotal_amount']}
        />
        <ReadField
          label="Tax"
          value={
            header.tax_amount != null
              ? formatCurrency(header.tax_amount, 'INR')
              : null
          }
          confidence={confMap['tax_amount']}
        />
        <ReadField
          label="Total"
          value={
            header.total_amount != null
              ? formatCurrency(header.total_amount, 'INR')
              : null
          }
          confidence={confMap['total_amount']}
        />
        {header.notes && (
          <div className="col-span-2">
            <ReadField label="Notes" value={header.notes} />
          </div>
        )}
      </Section>

      <Section title="Buyer Company">
        <ReadField label="Company Name" value={header.company?.company_name} />
        <ReadField label="GSTIN" value={header.company?.gstin} />
        <ReadField label="Company Code" value={header.company?.company_code} />
      </Section>

      {email && (
        <Section title="Email Source">
          <ReadField label="From" value={email.received_from} />
          <ReadField label="Subject" value={email.subject} />
          <ReadField label="Attachment" value={email.attachment_filename} />
        </Section>
      )}

      {vendor && (
        <Section title="Vendor Details">
          <ReadField
            label="Vendor Name"
            value={vendor.vendor_name}
            confidence={confMap['vendor_name']}
          />
          <ReadField
            label="GSTIN"
            value={vendor.vendor_gstin}
            confidence={confMap['vendor_gstin']}
          />
          <ReadField
            label="Email"
            value={vendor.vendor_email}
            confidence={confMap['vendor_email']}
          />
          <ReadField
            label="Phone"
            value={vendor.vendor_phone}
            confidence={confMap['vendor_phone']}
          />
          <div className="col-span-2">
            <ReadField
              label="Address"
              value={vendor.vendor_address}
              confidence={confMap['vendor_address']}
            />
          </div>
        </Section>
      )}

      {vendor &&
        (vendor.bank_account_number ||
          vendor.bank_name ||
          vendor.ifsc_code) && (
          <Section title="Bank Details">
            <ReadField
              label="Bank Name"
              value={vendor.bank_name}
              confidence={confMap['bank_name']}
            />
            <ReadField
              label="Account Number"
              value={vendor.bank_account_number}
              confidence={confMap['bank_account_number']}
            />
            <ReadField
              label="IFSC Code"
              value={vendor.ifsc_code}
              confidence={confMap['ifsc_code']}
            />
            <ReadField
              label="Account Holder"
              value={vendor.account_holder_name}
              confidence={confMap['account_holder_name']}
            />
          </Section>
        )}

      {extraction.line_items.length > 0 && (
        <section className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[var(--color-muted)] border-b border-[var(--color-border)]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Line Items ({extraction.line_items.length})
            </h3>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--color-border)]">
                  {['#', 'Code', 'Description', 'UOM', 'Qty', 'Unit Price', 'Total'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] whitespace-nowrap border-r border-[var(--color-border)] last:border-r-0"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {extraction.line_items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-[var(--color-muted-foreground)] border-r border-[var(--color-border)]">
                      {item.line_number}
                    </td>
                    <td className="px-3 py-2 border-r border-[var(--color-border)]">
                      {item.item_code || '—'}
                    </td>
                    <td className="px-3 py-2 max-w-[200px] truncate border-r border-[var(--color-border)]">
                      {item.item_description || '—'}
                    </td>
                    <td className="px-3 py-2 border-r border-[var(--color-border)]">
                      {item.uom || '—'}
                    </td>
                    <td className="px-3 py-2 text-right border-r border-[var(--color-border)]">
                      {item.quantity_billed}
                    </td>
                    <td className="px-3 py-2 text-right border-r border-[var(--color-border)]">
                      {formatCurrency(item.unit_price, 'INR')}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatCurrency(item.line_total, 'INR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Section title="Metadata">
        <ReadField label="Received via" value={header.received_email} />
        <ReadField label="Vendor Code" value={header.vendor?.vendor_code} />
      </Section>
    </div>
  );
};
