import type { ValidationIssueDetails } from '../types/invoiceReview.types';
import {
  getIssueSeverity,
  isPassedIssue,
  isUnresolvedIssue,
  type IssueSeverity,
} from './validationIssueUtils';

export const VALIDATION_STAGE_ORDER = [
  'invoice_header_resolution',
  'buyer_company_validation',
  'vendor_resolution',
  'po_resolution',
  'line_item_validation',
  'amount_validation',
  'duplicate_detection',
] as const;

export type ValidationStageId = (typeof VALIDATION_STAGE_ORDER)[number];

export const VALIDATION_STAGE_LABELS: Record<string, string> = {
  invoice_header_resolution: 'Header Validation',
  buyer_company_validation: 'Company Validation',
  vendor_resolution: 'Vendor Validation',
  po_resolution: 'PO Matching',
  line_item_validation: 'Line Item Matching',
  amount_validation: 'Amount Validation',
  duplicate_detection: 'Duplicate Check',
};

export const VALIDATION_STAGE_DESCRIPTIONS: Record<string, string> = {
  invoice_header_resolution: 'Invoice number, dates, and header fields',
  buyer_company_validation: 'Buyer company identity and GSTIN',
  vendor_resolution: 'Vendor identity, GSTIN, and bank details',
  po_resolution: 'Matching invoice to purchase orders',
  line_item_validation: 'Matching invoice lines to PO lines',
  amount_validation: 'Subtotal, tax, and total amount checks',
  duplicate_detection: 'Duplicate invoice detection',
};

export const SEVERITY_ORDER: IssueSeverity[] = [
  'critical',
  'high',
  'medium',
  'low',
];

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const SEVERITY_DESCRIPTIONS: Record<IssueSeverity, string> = {
  critical: 'Issues that block approval or require immediate action',
  high: 'Important mismatches that need review before payment',
  medium: 'Non-blocking issues that may need clarification',
  low: 'Informational or resolved findings',
};

export type StageSummaryStatus = 'passed' | 'warning' | 'issues';

export interface ValidationStageSummary {
  stageId: string;
  label: string;
  description: string;
  status: StageSummaryStatus;
  issueCount: number;
  passedCount: number;
  failedCount: number;
  issues: ValidationIssueDetails[];
}

export const getValidationStageLabel = (stageId: string): string =>
  VALIDATION_STAGE_LABELS[stageId] ??
  stageId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const getValidationStageDescription = (stageId: string): string =>
  VALIDATION_STAGE_DESCRIPTIONS[stageId] ??
  `Validation checks for ${getValidationStageLabel(stageId).toLowerCase()}`;

export const groupIssuesByStage = (
  issues: ValidationIssueDetails[],
): Map<string, ValidationIssueDetails[]> => {
  const grouped = new Map<string, ValidationIssueDetails[]>();

  for (const issue of issues) {
    const stageId = issue.check_stage || 'other';
    const existing = grouped.get(stageId) ?? [];
    existing.push(issue);
    grouped.set(stageId, existing);
  }

  return grouped;
};

export const buildValidationStageSummaries = (
  issues: ValidationIssueDetails[],
): ValidationStageSummary[] => {
  const grouped = groupIssuesByStage(issues);
  const knownStages = new Set<string>(VALIDATION_STAGE_ORDER);
  const extraStages = [...grouped.keys()].filter((stageId) => !knownStages.has(stageId));

  const orderedStageIds = [
    ...VALIDATION_STAGE_ORDER,
    ...extraStages.sort(),
  ];

  return orderedStageIds.map((stageId) => {
    const stageIssues = grouped.get(stageId) ?? [];
    const failedIssues = stageIssues.filter(
      (issue) => !isPassedIssue(issue),
    );
    const unresolvedIssues = stageIssues.filter(isUnresolvedIssue);
    const passedIssues = stageIssues.filter(isPassedIssue);
    const warningIssues = unresolvedIssues.filter(
      (issue) => getIssueSeverity(issue) === 'high' || getIssueSeverity(issue) === 'medium',
    );

    let status: StageSummaryStatus = 'passed';

    if (unresolvedIssues.some((issue) => getIssueSeverity(issue) === 'critical')) {
      status = 'issues';
    } else if (unresolvedIssues.length > 0) {
      status = warningIssues.length > 0 ? 'warning' : 'issues';
    } else if (failedIssues.length > 0) {
      status = 'warning';
    }

    return {
      stageId,
      label: getValidationStageLabel(stageId),
      description: getValidationStageDescription(stageId),
      status,
      issueCount: unresolvedIssues.length,
      passedCount: passedIssues.length,
      failedCount: failedIssues.length,
      issues: stageIssues,
    };
  });
};

export const groupIssuesBySeverity = (
  issues: ValidationIssueDetails[],
): Record<IssueSeverity, ValidationIssueDetails[]> => {
  const grouped: Record<IssueSeverity, ValidationIssueDetails[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  for (const issue of issues) {
    if (!isUnresolvedIssue(issue) && isPassedIssue(issue)) {
      grouped.low.push(issue);
      continue;
    }

    const severity = getIssueSeverity(issue);
    grouped[severity].push(issue);
  }

  return grouped;
};

export const getSeveritySummaryStatus = (
  issues: ValidationIssueDetails[],
): StageSummaryStatus => {
  if (issues.length === 0) return 'passed';
  if (issues.some((issue) => getIssueSeverity(issue) === 'critical')) return 'issues';
  if (issues.some((issue) => isUnresolvedIssue(issue))) return 'warning';
  return 'passed';
};
