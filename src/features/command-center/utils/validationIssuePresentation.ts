import type { ValidationIssueDetails } from '../types/invoiceReview.types';
import { getCheckDefinition } from '../constants/validationCheckCatalog';

const RECOVERABLE_ISSUE_CODES = new Set([
  'MISSING_INVOICE_NUMBER',
  'VENDOR_NOT_FOUND',
  'PO_MISSING',
  'PO_RECOVERED',
  'INVALID_PO_REFERENCE',
]);

const OPEN_ISSUE_MESSAGES: Record<string, string> = {
  MISSING_INVOICE_NUMBER: 'The invoice does not include an invoice number.',
  VENDOR_NOT_FOUND:
    'The system could not match the extracted vendor details to a vendor master record.',
  VENDOR_DETAILS_MISSING:
    'Vendor name, GSTIN, or address could not be extracted from the invoice.',
  MISSING_VENDOR_NAME: 'Vendor name could not be extracted from the invoice.',
  MISSING_VENDOR_GSTIN: 'Vendor GSTIN could not be extracted from the invoice.',
  MISSING_VENDOR_ADDRESS: 'Vendor address could not be extracted from the invoice.',
  VENDOR_NAME_MISMATCH:
    'The vendor name on the invoice does not match the resolved vendor master record.',
  PO_NOT_FOUND: 'The purchase order referenced on the invoice was not found.',
  PO_MISSING: 'No purchase order number could be extracted from the invoice.',
  PO_RECOVERED:
    'The invoice PO reference could not be used directly. The system identified replacement PO candidate(s) using vendor, date, and invoice content.',
  PO_RESOLUTION_BLOCKED:
    'PO matching could not run because vendor resolution did not complete successfully.',
  INVALID_PO_REFERENCE:
    'The PO number on the invoice does not exist or does not match the billed line items.',
  PO_UNRESOLVED: 'No suitable purchase order could be identified for this invoice.',
  PO_AMBIGUOUS:
    'Multiple purchase orders match this invoice and the system cannot determine the correct one with confidence.',
  PO_VENDOR_CONFLICT:
    'A matched purchase order belongs to a different vendor than the one on the invoice.',
  PO_CLOSED: 'The referenced purchase order is closed and cannot be used.',
  COMPANY_DETAILS_MISSING:
    'Buyer company name, GSTIN, or address could not be extracted from the invoice.',
  MISSING_COMPANY_NAME: 'Buyer company name could not be extracted from the invoice.',
  MISSING_COMPANY_GSTIN: 'Buyer company GSTIN could not be extracted from the invoice.',
  MISSING_COMPANY_ADDRESS: 'Buyer company address could not be extracted from the invoice.',
  COMPANY_NAME_MISMATCH:
    'The buyer company name on the invoice does not match the company master record.',
  COMPANY_GSTIN_MISMATCH:
    'The buyer company GSTIN on the invoice does not match the company master record.',
  MISSING_PO_COVERAGE:
    'One or more invoice line items are not covered by a purchase order.',
  UNMATCHED_LINE_ITEM:
    'One or more invoice line items could not be matched to purchase order lines.',
  AMBIGUOUS_LINE_MATCH:
    'Multiple valid line allocation options were found and manual review is required.',
  QUANTITY_EXCEEDS_ORDERED:
    'A billed quantity is higher than the quantity ordered on the purchase order.',
  QUANTITY_EXCEEDS_REMAINING:
    'A billed quantity exceeds the remaining open quantity on the purchase order.',
  UNIT_PRICE_MISMATCH: 'An invoice unit price does not match the purchase order unit price.',
  LINE_TOTAL_MISMATCH: 'A line total does not match quantity multiplied by unit price.',
  TOTAL_AMOUNT_MISMATCH:
    'The invoice total does not match the expected purchase order amount.',
  DUPLICATE_INVOICE_NUMBER:
    'This invoice number has already been used for this vendor.',
  POTENTIAL_DUPLICATE_INVOICE:
    'This invoice closely resembles another invoice from the same vendor.',
};

const RECOVERY_MESSAGES: Record<string, string> = {
  MISSING_INVOICE_NUMBER:
    'The missing invoice number was recovered from the associated email.',
  VENDOR_NOT_FOUND:
    'The vendor was identified after the initial lookup did not find a direct match.',
  PO_MISSING:
    'Although no PO number was on the invoice, the system matched purchase order(s) using vendor and invoice content.',
  PO_RECOVERED:
    'Replacement purchase order candidate(s) were identified after the extracted PO reference could not be used.',
  INVALID_PO_REFERENCE:
    'The invoice PO reference was incorrect, but the system matched the invoice to the correct purchase order(s).',
};

const WAIVED_MESSAGES: Record<string, string> = {
  MISSING_INVOICE_NUMBER:
    'The invoice number could not be recovered, so a system-generated invoice number was assigned to allow processing.',
};

const RECOMMENDED_ACTIONS: Record<string, string> = {
  PO_RECOVERED:
    'Review the matched PO candidate(s) and confirm line allocation before approval.',
  PO_AMBIGUOUS:
    'Review the candidate PO list and select the correct purchase order based on business context.',
  PO_UNRESOLVED:
    'Request an updated invoice with the correct PO reference or upload the matching purchase order.',
  AMBIGUOUS_LINE_MATCH:
    'Contact the vendor to confirm how many units should be billed against each purchase order, then select the matching allocation plan.',
  QUANTITY_EXCEEDS_ORDERED:
    'Request a revised invoice or confirm whether the over-quantity billing is acceptable.',
  QUANTITY_EXCEEDS_REMAINING:
    'Confirm whether the billed quantity should consume the remaining PO balance.',
  VENDOR_NOT_FOUND:
    'Verify vendor details on the invoice or onboard the vendor in master data.',
};

export interface IssuePresentation {
  title: string;
  summary: string;
  recoverable: boolean;
  recoveryStatus: 'resolved' | 'partial' | 'not_recoverable' | 'waived';
  recoveryReason: string;
  recommendedAction: string;
  technicalDetails: Array<{ label: string; value: string }>;
}

const getIssueCode = (issue: ValidationIssueDetails): string | null => {
  const metadataCode = issue.metadata?.issue_code;

  if (typeof metadataCode === 'string' && metadataCode.trim()) {
    return metadataCode.trim().toUpperCase();
  }

  return null;
};

const formatMetadataValue = (value: unknown): string => {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'po_number' in item) {
          return String((item as { po_number?: string }).po_number ?? '');
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join(', ');
  }

  return JSON.stringify(value);
};

const getResolvedPoNumbers = (
  metadata: Record<string, unknown> | null,
): string[] => {
  if (!metadata) return [];

  const resolved = metadata.resolved_po_numbers;

  if (!Array.isArray(resolved)) return [];

  return resolved
    .map((value) => String(value))
    .filter((value) => value.trim().length > 0);
};

const buildTechnicalDetails = (
  issue: ValidationIssueDetails,
): Array<{ label: string; value: string }> => {
  const details: Array<{ label: string; value: string }> = [];
  const metadata = issue.metadata ?? {};
  const skipKeys = new Set([
    'recommended_action',
    'recommendedAction',
    'tag',
    'impact',
    'issue_code',
  ]);

  for (const [key, value] of Object.entries(metadata)) {
    if (skipKeys.has(key) || value == null || value === '') continue;

    details.push({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: formatMetadataValue(value),
    });
  }

  if (issue.expected_value) {
    details.push({ label: 'Expected', value: issue.expected_value });
  }

  if (issue.actual_value) {
    details.push({ label: 'Actual', value: issue.actual_value });
  }

  if (issue.field_name) {
    details.push({ label: 'Field', value: issue.field_name });
  }

  return details;
};

const buildRecoveryReason = (
  issue: ValidationIssueDetails,
  issueCode: string | null,
  status: string,
): string => {
  const resolvedPoNumbers = getResolvedPoNumbers(issue.metadata);

  if (status === 'resolved') {
    const base =
      (issueCode && RECOVERY_MESSAGES[issueCode]) ||
      'The system automatically resolved this issue during validation.';

    if (resolvedPoNumbers.length > 0) {
      return `${base} Matched PO(s): ${resolvedPoNumbers.join(', ')}.`;
    }

    return base;
  }

  if (status === 'waived') {
    return (
      (issueCode && WAIVED_MESSAGES[issueCode]) ||
      'The system applied a workaround so processing could continue.'
    );
  }

  if (issueCode === 'PO_RECOVERED') {
    if (resolvedPoNumbers.length > 0) {
      return `Replacement PO candidate(s) were identified: ${resolvedPoNumbers.join(', ')}. Manual confirmation is still required.`;
    }

    return (
      RECOVERY_MESSAGES.PO_RECOVERED ??
      'Replacement PO candidates were identified, but manual confirmation is still required.'
    );
  }

  if (issueCode && RECOVERABLE_ISSUE_CODES.has(issueCode)) {
    return 'This issue type can sometimes be recovered automatically, but it still needs finance review in this case.';
  }

  return 'This issue cannot be auto-resolved and requires manual review or vendor clarification.';
};

export const buildIssuePresentation = (
  issue: ValidationIssueDetails,
  stageId?: string,
): IssuePresentation => {
  const issueCode = getIssueCode(issue);
  const status = (issue.status ?? '').toLowerCase();
  const definition = getCheckDefinition(
    stageId ?? issue.check_stage,
    issue.check_name,
  );

  const summary =
    (issueCode && OPEN_ISSUE_MESSAGES[issueCode]) ||
    issue.description ||
    'A validation finding requires review.';

  let recoveryStatus: IssuePresentation['recoveryStatus'] = 'not_recoverable';
  let recoverable = false;

  if (status === 'resolved') {
    recoveryStatus = 'resolved';
    recoverable = true;
  } else if (status === 'waived') {
    recoveryStatus = 'waived';
    recoverable = true;
  } else if (
    issueCode === 'PO_RECOVERED' ||
    (issueCode && RECOVERABLE_ISSUE_CODES.has(issueCode))
  ) {
    recoveryStatus = 'partial';
    recoverable = true;
  }

  const recommendedAction =
    (issue.metadata?.recommended_action as string | undefined) ||
    (issue.metadata?.recommendedAction as string | undefined) ||
    (issueCode && RECOMMENDED_ACTIONS[issueCode]) ||
    (recoveryStatus === 'resolved'
      ? 'Confirm the recovered values look correct, then continue review.'
      : recoveryStatus === 'partial'
      ? 'Review the system suggestion and confirm the matched data before approval.'
      : 'Resolve this finding or send a vendor clarification before approving the invoice.');

  return {
    title: definition.label,
    summary,
    recoverable,
    recoveryStatus,
    recoveryReason: buildRecoveryReason(issue, issueCode, status),
    recommendedAction,
    technicalDetails: buildTechnicalDetails(issue),
  };
};

export const ISSUE_PRESENTATION_SYSTEM_PROMPT = `
When explaining a validation issue to a finance reviewer, follow this structure:

1. What happened — one plain-language sentence describing the business problem.
2. Why it matters — explain the impact on invoice approval or payment.
3. Recoverability — state clearly whether the system recovered or can recover the issue.
4. Reason — explain why it is or is not recoverable, including matched PO numbers when relevant.
5. Recommended action — give one concrete next step for the reviewer.

Rules:
- Do not lead with internal codes, field names, or agent names.
- Translate technical metadata into business terms.
- If purchase orders were matched automatically, name them explicitly.
- If manual review is still required, say so clearly even when partial recovery occurred.
- Keep the explanation concise and scannable.
`.trim();
