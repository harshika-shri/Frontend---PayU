import React, { useMemo } from 'react';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Badge } from '../../../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type {
  InvoiceHeaderResponse,
  InvoiceValidationResponse,
} from '../../types/invoiceReview.types';
import {
  getValidationOutcomeBadgeVariant,
  getValidationOutcomeLabel,
} from '../../utils/validationOutcomeUtils';
import { getValidationStageLabel } from '../../utils/validationGroupingUtils';
import { isUnresolvedIssue } from '../../utils/validationIssueUtils';
import { buildIssuePresentation } from '../../utils/validationIssuePresentation';

interface SummaryTabProps {
  header: InvoiceHeaderResponse;
  validation: InvoiceValidationResponse;
  confidenceCount: { total: number; flagged: number };
}

const KeyFact: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
      {label}
    </p>
    <p className="text-sm font-medium text-[var(--color-foreground)] mt-0.5">
      {value || '—'}
    </p>
  </div>
);

export const SummaryTab: React.FC<SummaryTabProps> = ({
  header,
  validation,
  confidenceCount,
}) => {
  const openIssues = useMemo(
    () =>
      validation.issues
        .filter(isUnresolvedIssue)
        .map((issue) => ({
          id: issue.id,
          stageLabel: getValidationStageLabel(issue.check_stage),
          presentation: buildIssuePresentation(issue, issue.check_stage),
        })),
    [validation.issues],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
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
            {confidenceCount.flagged} low-confidence field
            {confidenceCount.flagged > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
          Key details
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KeyFact label="Invoice" value={header.invoice_number} />
          <KeyFact label="Vendor" value={header.vendor?.vendor_name} />
          <KeyFact label="Date" value={formatDate(header.invoice_date)} />
          <KeyFact
            label="Total"
            value={
              header.total_amount != null
                ? formatCurrency(header.total_amount, 'INR')
                : null
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
          Validation
        </h3>
        {openIssues.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground)]">No open issues.</p>
        ) : (
          <ul className="space-y-2.5">
            {openIssues.map(({ id, stageLabel, presentation }) => (
              <li key={id} className="text-sm leading-relaxed">
                <span className="font-medium text-[var(--color-foreground)]">
                  {stageLabel}
                </span>
                <span className="text-[var(--color-muted-foreground)]"> — </span>
                <span className="text-[var(--color-foreground)]">
                  {presentation.summary}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
