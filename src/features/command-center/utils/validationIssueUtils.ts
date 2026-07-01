import type {
  InvoiceValidationResponse,
  ValidationIssueDetails,
} from '../types/invoiceReview.types';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

const RESOLVED_STATUSES = new Set(['resolved', 'waived', 'pass', 'passed']);
const PASSED_STATUSES = new Set(['resolved', 'waived', 'pass', 'passed', 'ok']);

const RECOVERABLE_ISSUE_CODES = new Set([
  'MISSING_INVOICE_NUMBER',
  'VENDOR_NOT_FOUND',
  'PO_MISSING',
  'PO_RECOVERED',
  'INVALID_PO_REFERENCE',
]);

const RECOVERY_CONFIRMATION_OPEN_CODES = new Set(['PO_RECOVERED']);

const getIssueCode = (issue: ValidationIssueDetails): string | null => {
  const metadataCode = issue.metadata?.issue_code;
  if (typeof metadataCode === 'string' && metadataCode.trim()) {
    return metadataCode.trim().toUpperCase();
  }
  return null;
};

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
  const issueCode = getIssueCode(issue);

  if (
    status === 'resolved' ||
    status === 'waived' ||
    status === 'pass' ||
    status === 'passed'
  ) {
    if (issueCode && RECOVERABLE_ISSUE_CODES.has(issueCode)) {
      return 'medium';
    }
    return 'low';
  }

  if (issueCode && RECOVERY_CONFIRMATION_OPEN_CODES.has(issueCode)) {
    return 'high';
  }

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
