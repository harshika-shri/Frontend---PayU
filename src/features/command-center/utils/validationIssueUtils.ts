import type {
  InvoiceValidationResponse,
  ValidationIssueDetails,
} from '../types/invoiceReview.types';

const RESOLVED_STATUSES = new Set(['resolved', 'waived', 'pass', 'passed']);

export const isUnresolvedIssue = (issue: ValidationIssueDetails): boolean =>
  !RESOLVED_STATUSES.has((issue.status ?? '').toLowerCase());

export const isCriticalIssue = (issue: ValidationIssueDetails): boolean => {
  const status = (issue.status ?? '').toLowerCase();
  const issueType = (issue.issue_type ?? '').toLowerCase();

  if (status === 'fail' || status === 'failed' || status === 'error') return true;
  if (status === 'open' || status === 'pending_review') return true;
  if (['invalid', 'missing', 'mismatch', 'duplicate', 'ambiguous'].includes(issueType)) {
    return true;
  }

  return false;
};

export const isWarningIssue = (issue: ValidationIssueDetails): boolean => {
  const status = (issue.status ?? '').toLowerCase();
  const issueType = (issue.issue_type ?? '').toLowerCase();
  return status === 'warning' || status === 'warn' || issueType === 'warning';
};

export const countUnresolvedIssues = (issues: ValidationIssueDetails[]): number =>
  issues.filter(isUnresolvedIssue).length;

export const countCriticalIssues = (issues: ValidationIssueDetails[]): number =>
  issues.filter(isCriticalIssue).length;

export const hasIssuesRequiringDraft = (
  validation: InvoiceValidationResponse,
): boolean => {
  const unresolvedCount = countUnresolvedIssues(validation.issues);
  const openSummaryIssues = (
    (validation.review_summary?.open_issues_json as string[] | undefined) ?? []
  ).filter(Boolean).length;
  const vendorClarifications = (
    (validation.review_summary?.vendor_clarifications_json as string[] | undefined) ?? []
  ).filter(Boolean).length;

  return unresolvedCount > 0 || openSummaryIssues > 0 || vendorClarifications > 0;
};

const CLARIFICATION_BLOCKED_STATUSES = new Set([
  'ready_to_pay',
  'paid',
  'rejected',
  'approved_ready_to_pay',
]);

export const isEligibleForClarification = (
  invoiceStatus?: string | null,
): boolean => {
  const status = (invoiceStatus ?? '').toLowerCase();
  if (!status) return false;
  return !CLARIFICATION_BLOCKED_STATUSES.has(status);
};
