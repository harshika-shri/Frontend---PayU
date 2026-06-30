import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import type { ValidationIssueDetails } from '../../types/invoiceReview.types';
import {
  getIssueSeverity,
  type IssueSeverity,
} from '../../utils/validationIssueUtils';
import { SEVERITY_LABELS } from '../../utils/validationGroupingUtils';
import { buildIssuePresentation } from '../../utils/validationIssuePresentation';

interface ValidationIssueCardProps {
  issue: ValidationIssueDetails;
  stageId?: string;
}

const severityBadgeVariant = (
  severity: IssueSeverity,
): 'destructive' | 'warning' | 'secondary' | 'outline' => {
  if (severity === 'critical') return 'destructive';
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'secondary';
  return 'outline';
};

const severitySurfaceClass = (severity: IssueSeverity): string => {
  if (severity === 'critical') return 'border-red-200 bg-red-50/40';
  if (severity === 'high') return 'border-amber-200 bg-amber-50/40';
  if (severity === 'medium') return 'border-slate-200 bg-slate-50/60';
  return 'border-[var(--color-border)] bg-[var(--color-muted)]/30';
};

const recoveryStatusConfig = {
  resolved: {
    label: 'Recoverable — Resolved',
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-50 text-green-900',
    iconClass: 'text-[var(--color-success)]',
  },
  partial: {
    label: 'Recoverable — Needs Confirmation',
    icon: RotateCcw,
    className: 'border-sky-200 bg-sky-50 text-sky-900',
    iconClass: 'text-[var(--color-info)]',
  },
  waived: {
    label: 'Recoverable — Waived',
    icon: ShieldAlert,
    className: 'border-slate-200 bg-slate-50 text-slate-800',
    iconClass: 'text-slate-600',
  },
  not_recoverable: {
    label: 'Not Recoverable',
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-[var(--color-destructive)]',
  },
};

export const ValidationIssueCard: React.FC<ValidationIssueCardProps> = ({
  issue,
  stageId,
}) => {
  const [expanded, setExpanded] = useState(true);
  const severity = getIssueSeverity(issue);
  const presentation = buildIssuePresentation(issue, stageId);
  const recovery = recoveryStatusConfig[presentation.recoveryStatus];
  const RecoveryIcon = recovery.icon;
  const issueCode =
    typeof issue.metadata?.issue_code === 'string'
      ? issue.metadata.issue_code
      : null;

  return (
    <article
      className={cn(
        'rounded-lg border overflow-hidden',
        severitySurfaceClass(severity),
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-start gap-2 px-4 py-3 text-left hover:bg-white/40 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={severityBadgeVariant(severity)}>
              {SEVERITY_LABELS[severity]}
            </Badge>
            <h4 className="text-sm font-semibold text-[var(--color-foreground)]">
              {presentation.title}
            </h4>
            {issueCode && (
              <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
                {issueCode.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
          <p
            className={cn(
              'text-sm text-[var(--color-foreground)] leading-relaxed',
              !expanded && 'line-clamp-2',
            )}
          >
            {presentation.summary}
          </p>
        </div>
        <span className="flex-shrink-0 mt-1 text-[var(--color-muted-foreground)]">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)]/70 bg-white/80 px-4 py-3 space-y-3">
          <div
            className={cn(
              'rounded-md border px-3 py-2.5 flex items-start gap-2.5',
              recovery.className,
            )}
          >
            <RecoveryIcon
              className={cn('h-4 w-4 flex-shrink-0 mt-0.5', recovery.iconClass)}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">
                {recovery.label}
              </p>
              <p className="text-sm mt-1 leading-relaxed">
                {presentation.recoveryReason}
              </p>
            </div>
          </div>

          {presentation.technicalDetails.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Supporting Details
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presentation.technicalDetails.map((entry) => (
                  <div key={`${issue.id}-${entry.label}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1">
                      {entry.label}
                    </p>
                    <p className="text-sm font-medium text-[var(--color-foreground)] break-words">
                      {entry.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1">
              Recommended Action
            </p>
            <p className="text-sm text-[var(--color-foreground)]">
              {presentation.recommendedAction}
            </p>
          </div>
        </div>
      )}
    </article>
  );
};

export { ValidationSeverityIcon } from './ValidationCheckRow';
