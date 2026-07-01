import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  MinusCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import type { StageCheckResult } from '../../utils/validationCheckResultsUtils';
import type { ValidationIssueDetails } from '../../types/invoiceReview.types';
import { buildIssuePresentation } from '../../utils/validationIssuePresentation';
import { getIssueSeverity } from '../../utils/validationIssueUtils';
import { SEVERITY_LABELS } from '../../utils/validationGroupingUtils';

const statusConfig = {
  passed: {
    icon: CheckCircle2,
    badge: 'success' as const,
    label: 'Passed',
    iconClass: 'text-[var(--color-success)]',
  },
  failed: {
    icon: XCircle,
    badge: 'destructive' as const,
    label: 'Failed',
    iconClass: 'text-[var(--color-destructive)]',
  },
  recovered: {
    icon: RotateCcw,
    badge: 'info' as const,
    label: 'Recovered',
    iconClass: 'text-[var(--color-info)]',
  },
  waived: {
    icon: ShieldCheck,
    badge: 'secondary' as const,
    label: 'Waived',
    iconClass: 'text-slate-500',
  },
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

interface ValidationCheckRowProps {
  result: StageCheckResult;
  stageId: string;
}

const IssueExpandableDetails: React.FC<{
  issue: ValidationIssueDetails;
  stageId: string;
}> = ({ issue, stageId }) => {
  const presentation = buildIssuePresentation(issue, stageId);
  const recovery = recoveryStatusConfig[presentation.recoveryStatus];
  const RecoveryIcon = recovery.icon;
  const severity = getIssueSeverity(issue);
  const issueCode =
    typeof issue.metadata?.issue_code === 'string'
      ? issue.metadata.issue_code
      : null;

  return (
    <div className="px-4 pb-4 pt-3 space-y-3 border-t border-[var(--color-border)]/60 bg-[var(--color-muted)]/10">
      <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
        {presentation.summary}
      </p>

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
          <p className="text-sm mt-1 leading-relaxed">{presentation.recoveryReason}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {presentation.technicalDetails.map((entry) => (
              <div key={`${issue.id}-${entry.label}`}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  {entry.label}
                </dt>
                <dd className="font-medium text-[var(--color-foreground)] break-words mt-0.5">
                  {entry.value}
                </dd>
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

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severity === 'critical' ? 'destructive' : 'warning'}>
          {SEVERITY_LABELS[severity]}
        </Badge>
        {issueCode && (
          <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
            {issueCode.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>
    </div>
  );
};

export const ValidationCheckRow: React.FC<ValidationCheckRowProps> = ({
  result,
  stageId,
}) => {
  const hasIssues = result.issues.length > 0;
  const primaryIssue = result.issues[0];
  const presentation =
    primaryIssue != null
      ? buildIssuePresentation(primaryIssue, stageId)
      : null;

  const [expanded, setExpanded] = useState(
    result.status === 'failed' ||
      result.status === 'recovered' ||
      result.status === 'waived',
  );

  const config = statusConfig[result.status];
  const Icon = config.icon;
  const canExpand = hasIssues || Boolean(result.purpose);
  const subtitle = hasIssues
    ? presentation?.summary
    : result.status === 'passed'
    ? result.purpose
    : null;

  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={() => canExpand && setExpanded((value) => !value)}
        disabled={!canExpand}
        className={cn(
          'w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors',
          canExpand && 'hover:bg-[var(--color-muted)]/20 cursor-pointer',
          !canExpand && 'cursor-default',
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', config.iconClass)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {result.label}
          </p>
          {subtitle && (
            <p
              className={cn(
                'mt-0.5 text-xs leading-relaxed',
                hasIssues
                  ? 'text-[var(--color-foreground)]'
                  : 'text-[var(--color-muted-foreground)]',
                !expanded && hasIssues && 'line-clamp-2',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <Badge variant={config.badge} className="flex-shrink-0 mt-0.5">
          {config.label}
        </Badge>
        {canExpand && (
          <span className="flex-shrink-0 mt-1 text-[var(--color-muted-foreground)]">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {expanded && canExpand && (
        <>
          {hasIssues ? (
            <div className="space-y-0">
              {result.issues.map((issue) => (
                <IssueExpandableDetails
                  key={issue.id}
                  issue={issue}
                  stageId={stageId}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 pb-3 pt-0 text-sm text-[var(--color-muted-foreground)] border-t border-[var(--color-border)]/60">
              {result.purpose}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ValidationSeverityIcon: React.FC<{
  status: 'passed' | 'warning' | 'issues' | 'skipped' | 'partial';
}> = ({ status }) => {
  if (status === 'passed') {
    return <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />;
  }

  if (status === 'skipped') {
    return <MinusCircle className="h-4 w-4 text-[var(--color-muted-foreground)]" />;
  }

  if (status === 'partial') {
    return <Info className="h-4 w-4 text-[var(--color-warning)]" />;
  }

  if (status === 'warning') {
    return <ShieldAlert className="h-4 w-4 text-[var(--color-warning)]" />;
  }

  return <XCircle className="h-4 w-4 text-[var(--color-destructive)]" />;
};
