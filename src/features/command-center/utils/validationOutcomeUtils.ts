import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '../../../components/ui/Badge';
import type { InvoiceValidationResponse } from '../types/invoiceReview.types';
import {
  countUnresolvedIssues,
  isUnresolvedIssue,
} from './validationIssueUtils';

export const VALIDATION_OUTCOMES = [
  'resolved',
  'recovered',
  'ambiguous',
  'unresolved',
  'duplicate',
] as const;

export type ValidationOutcome = (typeof VALIDATION_OUTCOMES)[number];

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

const RECOVERY_CONFIRMATION_OPEN_CODES = new Set(['PO_RECOVERED']);

const LEGACY_OUTCOME_MAP: Record<string, ValidationOutcome> = {
  approved: 'resolved',
  pending_review: 'recovered',
  rejected: 'unresolved',
};

const OUTCOME_LABELS: Record<ValidationOutcome, string> = {
  resolved: 'Resolved',
  recovered: 'Recovered',
  ambiguous: 'Ambiguous',
  unresolved: 'Unresolved',
  duplicate: 'Duplicate',
};

const OUTCOME_BADGE_VARIANTS: Record<ValidationOutcome, BadgeVariant> = {
  resolved: 'success',
  recovered: 'info',
  ambiguous: 'warning',
  unresolved: 'destructive',
  duplicate: 'secondary',
};

export const normalizeValidationOutcome = (
  value: string | null | undefined,
): ValidationOutcome | null => {
  if (!value) return null;

  const normalized = value.toLowerCase().replace(/[\s-]+/g, '_');
  const mapped = LEGACY_OUTCOME_MAP[normalized] ?? normalized;

  return VALIDATION_OUTCOMES.includes(mapped as ValidationOutcome)
    ? (mapped as ValidationOutcome)
    : null;
};

export const getValidationOutcomeLabel = (
  value: string | null | undefined,
): string => {
  const outcome = normalizeValidationOutcome(value);
  if (!outcome) return value?.replace(/_/g, ' ') ?? '—';
  return OUTCOME_LABELS[outcome];
};

export const getValidationOutcomeBadgeVariant = (
  value: string | null | undefined,
): BadgeVariant => {
  const outcome = normalizeValidationOutcome(value);
  if (!outcome) return 'secondary';
  return OUTCOME_BADGE_VARIANTS[outcome];
};

const getIssueCode = (
  issue: InvoiceValidationResponse['issues'][number],
): string | null => {
  const metadataCode = issue.metadata?.issue_code;
  if (typeof metadataCode === 'string' && metadataCode.trim()) {
    return metadataCode.trim().toUpperCase();
  }
  return null;
};

const isRecoveryConfirmationOpenIssue = (
  issue: InvoiceValidationResponse['issues'][number],
): boolean => {
  const code = getIssueCode(issue);
  return code != null && RECOVERY_CONFIRMATION_OPEN_CODES.has(code);
};

const isWarningOpenIssue = (
  issue: InvoiceValidationResponse['issues'][number],
): boolean =>
  (issue.issue_type ?? '').toLowerCase() === 'warning';

const hasBlockingOpenIssues = (
  validation?: InvoiceValidationResponse,
): boolean => {
  if (!validation) return false;

  return validation.issues.some((issue) => {
    if (!isUnresolvedIssue(issue)) return false;
    if (isRecoveryConfirmationOpenIssue(issue)) return false;
    if (isWarningOpenIssue(issue)) return false;
    return true;
  });
};

const hasOnlyRecoverableOpenIssues = (
  validation?: InvoiceValidationResponse,
): boolean => {
  if (!validation) return true;

  const openIssues = validation.issues.filter(isUnresolvedIssue);
  if (openIssues.length === 0) return true;

  return openIssues.every(
    (issue) =>
      isRecoveryConfirmationOpenIssue(issue) || isWarningOpenIssue(issue),
  );
};

export const canApproveWithValidationOutcome = (
  value: string | null | undefined,
  validation?: InvoiceValidationResponse,
): boolean => {
  const outcome = normalizeValidationOutcome(value);

  if (outcome === 'resolved') {
    if (!validation) return true;
    return (
      countUnresolvedIssues(validation.issues) === 0 &&
      !hasBlockingOpenIssues(validation)
    );
  }

  if (outcome === 'recovered') {
    if (!validation) return false;
    return (
      !hasBlockingOpenIssues(validation) &&
      hasOnlyRecoverableOpenIssues(validation)
    );
  }

  return false;
};

export const isResolvedValidationOutcome = (
  value: string | null | undefined,
): boolean => normalizeValidationOutcome(value) === 'resolved';
