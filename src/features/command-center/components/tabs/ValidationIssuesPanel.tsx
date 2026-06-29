import React, { useState } from 'react';
import {
  XCircle,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Shield,
  FileWarning,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import {
  isCriticalIssue,
  isUnresolvedIssue,
  isWarningIssue,
} from '../../utils/validationIssueUtils';
import type {
  InvoiceValidationResponse,
  ValidationIssueDetails,
} from '../../types/invoiceReview.types';

interface ValidationIssuesPanelProps {
  validation: InvoiceValidationResponse;
}

const IssueCard: React.FC<{ issue: ValidationIssueDetails; defaultOpen?: boolean }> = ({
  issue,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isCritical = isCriticalIssue(issue);
  const isWarning = isWarningIssue(issue);

  const hasExtra =
    Boolean(issue.expected_value) ||
    Boolean(issue.actual_value) ||
    Boolean(issue.field_name);

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isCritical
          ? 'border-red-200'
          : isWarning
          ? 'border-amber-200'
          : 'border-[var(--color-border)]',
      )}
    >
      <button
        className={cn(
          'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
          isCritical
            ? 'bg-red-50/50 hover:bg-red-50'
            : isWarning
            ? 'bg-amber-50/50 hover:bg-amber-50'
            : 'bg-[var(--color-muted)]/30 hover:bg-[var(--color-muted)]/60',
        )}
        onClick={() => hasExtra && setOpen((o) => !o)}
        disabled={!hasExtra}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isCritical ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <MinusCircle className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {issue.check_name}
            </p>
            {issue.check_stage && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] uppercase tracking-wide">
                {issue.check_stage.replace(/_/g, ' ')}
              </span>
            )}
            <span
              className={cn(
                'ml-auto text-[10px] font-semibold uppercase tracking-wide',
                isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-500',
              )}
            >
              {issue.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {issue.description}
          </p>
        </div>

        {hasExtra && (
          <div className="flex-shrink-0 mt-0.5">
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
            )}
          </div>
        )}
      </button>

      {open && hasExtra && (
        <div className="border-t border-[var(--color-border)] bg-white px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {issue.field_name && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1">
                  Field
                </p>
                <p className="text-sm font-mono text-[var(--color-foreground)]">
                  {issue.field_name}
                </p>
              </div>
            )}
            {issue.expected_value && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700 mb-1">
                  Expected
                </p>
                <p className="text-sm font-medium text-[var(--color-foreground)] bg-green-50 border border-green-100 rounded px-2 py-1 font-mono">
                  {issue.expected_value}
                </p>
              </div>
            )}
            {issue.actual_value && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700 mb-1">
                  Actual
                </p>
                <p className="text-sm font-medium text-[var(--color-foreground)] bg-red-50 border border-red-100 rounded px-2 py-1 font-mono">
                  {issue.actual_value}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryIssueCard: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50/50 px-4 py-3">
    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{text}</p>
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  count?: number;
  variant?: 'error' | 'warning' | 'muted';
}> = ({ title, count, variant = 'muted' }) => {
  const colors = {
    error: 'text-red-700 bg-red-50 border-red-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    muted: 'text-[var(--color-muted-foreground)] bg-[var(--color-muted)] border-[var(--color-border)]',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-semibold uppercase tracking-widest',
        colors[variant],
      )}
    >
      {title}
      {count != null && <span className="font-bold">{count}</span>}
    </div>
  );
};

export const ValidationIssuesPanel: React.FC<ValidationIssuesPanelProps> = ({ validation }) => {
  const unresolvedIssues = validation.issues.filter(isUnresolvedIssue);
  const criticalIssues = unresolvedIssues.filter(isCriticalIssue);
  const warningIssues = unresolvedIssues.filter(
    (issue) => isWarningIssue(issue) && !isCriticalIssue(issue),
  );
  const otherIssues = unresolvedIssues.filter(
    (issue) => !isCriticalIssue(issue) && !isWarningIssue(issue),
  );

  const openIssuesFromSummary = (
    (validation.review_summary?.open_issues_json as string[] | undefined) ?? []
  ).filter(Boolean);

  const hasDisplayContent =
    unresolvedIssues.length > 0 ||
    openIssuesFromSummary.length > 0 ||
    (validation.review_summary?.executive_summary?.trim().length ?? 0) > 0;

  const totalIssues = unresolvedIssues.length + openIssuesFromSummary.length;

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          criticalIssues.length > 0
            ? 'bg-red-50/60 border-red-200'
            : warningIssues.length > 0
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-[var(--color-muted)] border-[var(--color-border)]',
        )}
      >
        <div className="flex items-center gap-2">
          {criticalIssues.length > 0 ? (
            <FileWarning className="h-4 w-4 text-red-600" />
          ) : warningIssues.length > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <Shield className="h-4 w-4 text-[var(--color-success)]" />
          )}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
            Validation Issues
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {criticalIssues.length > 0 && (
            <Badge variant="destructive">{criticalIssues.length} Critical</Badge>
          )}
          {warningIssues.length > 0 && (
            <Badge variant="warning">
              {warningIssues.length} Warning{warningIssues.length > 1 ? 's' : ''}
            </Badge>
          )}
          {totalIssues === 0 && <Badge variant="success">All Clear</Badge>}
        </div>
      </div>

      {totalIssues > 0 && (
        <div className="px-4 py-2 bg-white border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--color-muted-foreground)]">
              {totalIssues} unresolved issue{totalIssues > 1 ? 's' : ''} requiring attention
            </span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
            {criticalIssues.length > 0 && (
              <div className="bg-red-500 rounded-full" style={{ flex: criticalIssues.length }} />
            )}
            {warningIssues.length > 0 && (
              <div className="bg-amber-400 rounded-full" style={{ flex: warningIssues.length }} />
            )}
            {otherIssues.length > 0 && (
              <div className="bg-slate-300 rounded-full" style={{ flex: otherIssues.length }} />
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 bg-white">
        {!hasDisplayContent ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                No issues detected
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                This invoice passed all validation checks.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {validation.review_summary?.executive_summary && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    AI Review Summary
                  </p>
                </div>
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                  {validation.review_summary.executive_summary}
                </p>
              </div>
            )}

            {criticalIssues.length > 0 && (
              <div className="space-y-2">
                <SectionHeader title="Critical" count={criticalIssues.length} variant="error" />
                {criticalIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    defaultOpen={Boolean(issue.expected_value || issue.actual_value)}
                  />
                ))}
              </div>
            )}

            {warningIssues.length > 0 && (
              <div className="space-y-2">
                <SectionHeader title="Warnings" count={warningIssues.length} variant="warning" />
                {warningIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {otherIssues.length > 0 && (
              <div className="space-y-2">
                <SectionHeader title="Info" count={otherIssues.length} />
                {otherIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {openIssuesFromSummary.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                  <Info className="h-3.5 w-3.5" />
                  <span className="font-medium uppercase tracking-wide">
                    Additional Issues from AI Analysis
                  </span>
                </div>
                {openIssuesFromSummary.map((issue, index) => (
                  <SummaryIssueCard key={`summary-${index}`} text={issue} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
