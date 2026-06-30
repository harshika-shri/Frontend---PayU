import type {
  InvoiceValidationResponse,
  ValidationIssueDetails,
} from '../types/invoiceReview.types';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

const RESOLVED_STATUSES = new Set(['resolved', 'waived', 'pass', 'passed']);
const PASSED_STATUSES = new Set(['resolved', 'waived', 'pass', 'passed', 'ok']);

export const isPassedIssue = (issue: ValidationIssueDetails): boolean =>
  PASSED_STATUSES.has((issue.status ?? '').toLowerCase());

export const isUnresolvedIssue = (issue: ValidationIssueDetails): boolean =>
  !RESOLVED_STATUSES.has((issue.status ?? '').toLowerCase());

export const isCriticalIssue = (issue: ValidationIssueDetails): boolean =>
  getIssueSeverity(issue) === 'critical';

export const isWarningIssue = (issue: ValidationIssueDetails): boolean => {
  const severity = getIssueSeverity(issue);
  return severity === 'high' || severity === 'medium';
};

export const getIssueSeverity = (issue: ValidationIssueDetails): IssueSeverity => {
  const status = (issue.status ?? '').toLowerCase();
  const issueType = (issue.issue_type ?? '').toLowerCase();

  if (
    ['invalid', 'missing', 'mismatch', 'duplicate', 'ambiguous'].includes(issueType)
  ) {
    return 'critical';
  }

  if (status === 'fail' || status === 'failed' || status === 'error') {
    return 'critical';
  }

  if (status === 'open' || status === 'pending_review') {
    return 'critical';
  }

  if (issueType === 'low_confidence') {
    return 'high';
  }

  if (status === 'warning' || status === 'warn' || issueType === 'warning') {
    return 'high';
  }

  if (status === 'resolved' || status === 'waived' || status === 'pass' || status === 'passed') {
    return 'low';
  }

  return 'medium';
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
