import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '../../../components/ui/Badge';

export const VALIDATION_OUTCOMES = [
  'resolved',
  'recovered',
  'ambiguous',
  'unresolved',
  'duplicate',
] as const;

export type ValidationOutcome = (typeof VALIDATION_OUTCOMES)[number];

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

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

export const canApproveWithValidationOutcome = (
  value: string | null | undefined,
): boolean => {
  const outcome = normalizeValidationOutcome(value);
  return outcome === 'resolved' || outcome === 'recovered';
};

export const isResolvedValidationOutcome = (
  value: string | null | undefined,
): boolean => normalizeValidationOutcome(value) === 'resolved';
