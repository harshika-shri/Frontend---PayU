import { isUnresolvedIssue } from './validationIssueUtils';
import type { InvoiceValidationResponse } from '../types/invoiceReview.types';
import type { ClarificationDraftResponse } from '../types/workflow.types';

const asStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const dedupePoints = (points: string[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const point of points) {
    const normalized = point.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
};

export const buildClarificationDraft = (
  invoiceId: string,
  invoiceNumber: string | null | undefined,
  validation: InvoiceValidationResponse,
  vendorEmail: string | null | undefined,
): ClarificationDraftResponse | null => {
  const vendorClarifications = asStringList(
    validation.review_summary?.vendor_clarifications_json,
  );

  const unresolvedDescriptions = validation.issues
    .filter(isUnresolvedIssue)
    .map((issue) => issue.description?.trim())
    .filter((description): description is string => Boolean(description));

  const openSummaryIssues = asStringList(validation.review_summary?.open_issues_json);

  const clarificationPoints = dedupePoints([
    ...vendorClarifications,
    ...openSummaryIssues,
    ...(vendorClarifications.length === 0 && openSummaryIssues.length === 0
      ? unresolvedDescriptions
      : []),
  ]);

  if (clarificationPoints.length === 0) {
    return null;
  }

  const displayNumber = invoiceNumber || invoiceId;
  const subject = `Clarification Required - Invoice ${displayNumber}`;
  const numberedPoints = clarificationPoints
    .map((point, index) => `${index + 1}. ${point}`)
    .join('\n');

  const body = [
    'Dear Vendor,',
    '',
    `During our review of invoice ${displayNumber}, we identified a few items requiring clarification.`,
    '',
    numberedPoints,
    '',
    'Please provide clarification and supporting information.',
    '',
    'Regards,',
    'Finance Team',
  ].join('\n');

  return {
    invoice_id: invoiceId,
    vendor_email: vendorEmail ?? null,
    subject,
    body,
    clarification_points: clarificationPoints,
  };
};
