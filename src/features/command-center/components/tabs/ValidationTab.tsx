import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { ValidationIssuesPanel } from './ValidationIssuesPanel';
import { getValidationOutcomeLabel } from '../../utils/validationOutcomeUtils';
import type { InvoiceValidationResponse, ValidationIssueDetails } from '../../types/invoiceReview.types';

interface ValidationTabProps {
  validation: InvoiceValidationResponse;
}

const STAGE_LABELS: Record<string, string> = {
  header: 'Header Validation',
  vendor: 'Vendor Validation',
  company: 'Company Validation',
  po: 'PO Matching',
  duplicate: 'Duplicate Check',
  amount: 'Amount Validation',
  line_items: 'Line Item Validation',
  bank: 'Bank Details',
};

const statusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'pass' || s === 'passed' || s === 'ok')
    return {
      icon: <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />,
      bg: 'bg-[var(--color-success-muted)]',
      border: 'border-green-100',
      labelColor: 'text-[var(--color-success)]',
    };
  if (s === 'fail' || s === 'failed' || s === 'error')
    return {
      icon: <XCircle className="h-4 w-4 text-[var(--color-destructive)]" />,
      bg: 'bg-[var(--color-destructive-muted)]',
      border: 'border-red-100',
      labelColor: 'text-[var(--color-destructive)]',
    };
  if (s === 'warning' || s === 'warn')
    return {
      icon: <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />,
      bg: 'bg-[var(--color-warning-muted)]',
      border: 'border-amber-100',
      labelColor: 'text-[var(--color-warning)]',
    };
  return {
    icon: <MinusCircle className="h-4 w-4 text-[var(--color-muted-foreground)]" />,
    bg: 'bg-[var(--color-muted)]',
    border: 'border-[var(--color-border)]',
    labelColor: 'text-[var(--color-muted-foreground)]',
  };
};

const IssueRow: React.FC<{ issue: ValidationIssueDetails }> = ({ issue }) => {
  const { icon, bg, border, labelColor } = statusConfig(issue.status);
  return (
    <div className={cn('flex gap-3 rounded-lg border p-3', bg, border)}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-[var(--color-foreground)]">{issue.check_name}</p>
          <span className={cn('text-[10px] font-semibold uppercase tracking-wide', labelColor)}>
            {issue.status}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          {issue.description}
        </p>
        {(issue.expected_value || issue.actual_value) && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {issue.expected_value && (
              <span className="text-[var(--color-muted-foreground)]">
                Expected: <span className="font-medium text-[var(--color-foreground)]">{issue.expected_value}</span>
              </span>
            )}
            {issue.actual_value && (
              <span className="text-[var(--color-muted-foreground)]">
                Actual: <span className="font-medium text-[var(--color-foreground)]">{issue.actual_value}</span>
              </span>
            )}
          </div>
        )}
        {issue.field_name && (
          <p className="mt-1 text-[10px] text-[var(--color-muted-foreground)]">
            Field: <code className="font-mono">{issue.field_name}</code>
          </p>
        )}
      </div>
    </div>
  );
};

export const ValidationTab: React.FC<ValidationTabProps> = ({ validation }) => {
  const grouped = validation.issues.reduce<Record<string, ValidationIssueDetails[]>>(
    (acc, issue) => {
      const key = issue.check_stage || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    },
    {},
  );

  const passCount = validation.issues.filter(
    (i) => i.status === 'pass' || i.status === 'passed',
  ).length;
  const failCount = validation.issues.filter(
    (i) => i.status === 'fail' || i.status === 'failed',
  ).length;
  const warnCount = validation.issues.filter(
    (i) => i.status === 'warning' || i.status === 'warn',
  ).length;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
          <span className="font-medium text-[var(--color-foreground)]">{passCount}</span>
          <span className="text-[var(--color-muted-foreground)]">passed</span>
        </div>
        {failCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <XCircle className="h-4 w-4 text-[var(--color-destructive)]" />
            <span className="font-medium text-[var(--color-foreground)]">{failCount}</span>
            <span className="text-[var(--color-muted-foreground)]">failed</span>
          </div>
        )}
        {warnCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
            <span className="font-medium text-[var(--color-foreground)]">{warnCount}</span>
            <span className="text-[var(--color-muted-foreground)]">warnings</span>
          </div>
        )}
        {validation.validation_outcome && (
          <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Outcome: {getValidationOutcomeLabel(validation.validation_outcome)}
          </span>
        )}
      </div>

      <ValidationIssuesPanel validation={validation} />

      {validation.review_summary &&
        (validation.review_summary.system_recoveries_json as string[]).length > 0 && (
          <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
            <div className="px-4 py-2.5 bg-[var(--color-muted)] border-b border-[var(--color-border)]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                System Recoveries
              </h3>
            </div>
            <ul className="px-4 py-4 bg-white space-y-2">
              {(validation.review_summary.system_recoveries_json as string[]).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Issues by stage */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">
          No validation results available for this invoice.
        </p>
      ) : (
        Object.entries(grouped).map(([stage, issues]) => (
          <div key={stage} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              {STAGE_LABELS[stage] ?? stage.replace(/_/g, ' ')}
            </h3>
            <div className="space-y-2">
              {issues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
