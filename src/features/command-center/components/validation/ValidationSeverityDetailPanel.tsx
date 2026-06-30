import React from 'react';
import { Badge } from '../../../../components/ui/Badge';
import {
  SEVERITY_DESCRIPTIONS,
  SEVERITY_LABELS,
} from '../../utils/validationGroupingUtils';
import type { ValidationIssueDetails } from '../../types/invoiceReview.types';
import type { IssueSeverity } from '../../utils/validationIssueUtils';
import { ValidationIssueCard } from './ValidationIssueCard';

interface ValidationSeverityDetailPanelProps {
  severity: IssueSeverity | null;
  issues: ValidationIssueDetails[];
}

export const ValidationSeverityDetailPanel: React.FC<
  ValidationSeverityDetailPanelProps
> = ({ severity, issues }) => {
  if (!severity) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/20 px-6 text-center">
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Select a severity level
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Choose Critical, High, Medium, or Low to view related issues.
          </p>
        </div>
      </div>
    );
  }

  const severityVariant =
    severity === 'critical'
      ? 'destructive'
      : severity === 'high'
      ? 'warning'
      : severity === 'medium'
      ? 'secondary'
      : 'outline';

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            {SEVERITY_LABELS[severity]}
          </h3>
          <Badge variant={severityVariant}>
            {issues.length} issue{issues.length === 1 ? '' : 's'}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {SEVERITY_DESCRIPTIONS[severity]}
        </p>
      </div>

      {issues.length > 0 ? (
        <div className="space-y-2">
          {issues.map((issue) => (
            <ValidationIssueCard
              key={issue.id}
              issue={issue}
              stageId={issue.check_stage}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No issues in this severity bucket.
          </p>
        </div>
      )}
    </div>
  );
};
