import { VALIDATION_CHECK_CATALOG, getCheckDefinition } from '../constants/validationCheckCatalog';
import type { ValidationIssueDetails } from '../types/invoiceReview.types';
import {
  type CheckApplicabilityContext,
  isCheckApplicable,
} from './validationCheckApplicability';
import { isPassedIssue, isUnresolvedIssue } from './validationIssueUtils';

export type CheckResultStatus = 'passed' | 'failed' | 'recovered' | 'waived';

export interface StageCheckResult {
  checkName: string;
  label: string;
  purpose: string;
  status: CheckResultStatus;
  issues: ValidationIssueDetails[];
}

const STATUS_PRIORITY: Record<CheckResultStatus, number> = {
  failed: 4,
  recovered: 3,
  waived: 2,
  passed: 1,
};

const deriveCheckStatus = (
  issues: ValidationIssueDetails[],
): CheckResultStatus => {
  if (issues.length === 0) {
    return 'passed';
  }

  let worst: CheckResultStatus = 'passed';

  for (const issue of issues) {
    const status = (issue.status ?? '').toLowerCase();
    let mapped: CheckResultStatus = 'failed';

    if (status === 'resolved') {
      mapped = 'recovered';
    } else if (status === 'waived') {
      mapped = 'waived';
    } else if (isPassedIssue(issue)) {
      mapped = 'passed';
    } else if (isUnresolvedIssue(issue)) {
      mapped = 'failed';
    }

    if (STATUS_PRIORITY[mapped] > STATUS_PRIORITY[worst]) {
      worst = mapped;
    }
  }

  return worst;
};

export const buildStageCheckResults = (
  stageId: string,
  issues: ValidationIssueDetails[],
  context?: CheckApplicabilityContext,
): StageCheckResult[] => {
  const issuesByCheckName = new Map<string, ValidationIssueDetails[]>();

  for (const issue of issues) {
    const existing = issuesByCheckName.get(issue.check_name) ?? [];
    existing.push(issue);
    issuesByCheckName.set(issue.check_name, existing);
  }

  const catalog = VALIDATION_CHECK_CATALOG[stageId] ?? [];
  const seenCheckNames = new Set<string>();
  const results: StageCheckResult[] = [];
  const applicabilityContext = context ?? {
    header: null,
    extraction: null,
  };

  for (const definition of catalog) {
    seenCheckNames.add(definition.checkName);
    const matchingIssues = issuesByCheckName.get(definition.checkName) ?? [];

    if (
      !isCheckApplicable(
        definition,
        matchingIssues,
        applicabilityContext,
      )
    ) {
      continue;
    }

    results.push({
      checkName: definition.checkName,
      label: definition.label,
      purpose: definition.purpose,
      status: deriveCheckStatus(matchingIssues),
      issues: matchingIssues,
    });
  }

  for (const [checkName, matchingIssues] of issuesByCheckName.entries()) {
    if (seenCheckNames.has(checkName)) {
      continue;
    }

    const definition = getCheckDefinition(stageId, checkName);

    if (
      !isCheckApplicable(
        definition,
        matchingIssues,
        applicabilityContext,
      )
    ) {
      continue;
    }

    results.push({
      checkName: definition.checkName,
      label: definition.label,
      purpose: definition.purpose,
      status: deriveCheckStatus(matchingIssues),
      issues: matchingIssues,
    });
  }

  return results;
};

export const getFailedCheckResults = (
  results: StageCheckResult[],
): StageCheckResult[] =>
  results.filter((result) => result.status === 'failed');

export const getNonFailedCheckResults = (
  results: StageCheckResult[],
): StageCheckResult[] =>
  results.filter((result) => result.status !== 'failed');
