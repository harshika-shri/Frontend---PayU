import React, { useMemo } from 'react';
import { Badge } from '../../../../components/ui/Badge';
import type { ValidationStageSummary } from '../../utils/validationGroupingUtils';
import type { CheckApplicabilityContext } from '../../utils/validationCheckApplicability';
import { buildStageCheckResults } from '../../utils/validationCheckResultsUtils';
import { ValidationCheckRow } from './ValidationCheckRow';

interface ValidationStepDetailPanelProps {
  stage: ValidationStageSummary | null;
  applicabilityContext: CheckApplicabilityContext;
}

const statusOrder = { failed: 0, recovered: 1, waived: 2, passed: 3 };

export const ValidationStepDetailPanel: React.FC<ValidationStepDetailPanelProps> = ({
  stage,
  applicabilityContext,
}) => {
  const checkResults = useMemo(() => {
    if (!stage) return [];

    const results = buildStageCheckResults(
      stage.stageId,
      stage.issues,
      applicabilityContext,
    );

    return [...results].sort(
      (left, right) => statusOrder[left.status] - statusOrder[right.status],
    );
  }, [stage, applicabilityContext]);

  if (!stage) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/10 px-6 text-center">
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Select a validation step
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Choose a step on the left to review its checks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            {stage.label}
          </h3>
          {stage.status === 'skipped' ? (
            <Badge variant="secondary">Skipped</Badge>
          ) : stage.status === 'partial' ? (
            <Badge variant="warning">Partial</Badge>
          ) : stage.issueCount > 0 ? (
            <Badge variant="destructive">{stage.issueCount} open</Badge>
          ) : (
            <Badge variant="success">Passed</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {stage.description}
          {stage.status === 'skipped' &&
            ' This step was not run because an earlier validation gate stopped the full workflow.'}
          {stage.status === 'partial' &&
            ' Only invoice math was checked here. Purchase order price and quantity comparisons were skipped because PO or line mapping is ambiguous.'}
        </p>
      </div>

      {stage.status === 'skipped' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No checks were executed for this step.
        </p>
      ) : checkResults.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No checks apply to this invoice for this step.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] overflow-hidden">
          {checkResults.map((result) => (
            <ValidationCheckRow
              key={result.checkName}
              result={result}
              stageId={stage.stageId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
