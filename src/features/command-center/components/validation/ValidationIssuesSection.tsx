import React, { useMemo, useState } from 'react';
import { GitBranch, Layers3 } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import type {
  InvoiceExtractionResponse,
  InvoiceHeaderResponse,
  InvoiceValidationResponse,
} from '../../types/invoiceReview.types';
import {
  buildValidationStageSummaries,
  getSeveritySummaryStatus,
  groupIssuesBySeverity,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
} from '../../utils/validationGroupingUtils';
import {
  countCriticalIssues,
  countUnresolvedIssues,
  isUnresolvedIssue,
} from '../../utils/validationIssueUtils';
import type { IssueSeverity } from '../../utils/validationIssueUtils';
import { getValidationOutcomeLabel } from '../../utils/validationOutcomeUtils';
import { buildApplicabilityContext } from '../../utils/validationCheckApplicability';
import {
  ValidationNavigator,
  type ValidationViewMode,
} from './ValidationNavigator';
import { ValidationStepDetailPanel } from './ValidationStepDetailPanel';
import { ValidationSeverityDetailPanel } from './ValidationSeverityDetailPanel';

interface ValidationIssuesSectionProps {
  validation: InvoiceValidationResponse;
  header: InvoiceHeaderResponse | null;
  extraction: InvoiceExtractionResponse | null;
}

const getStageStatusLabel = (
  issueCount: number,
  status: 'passed' | 'warning' | 'issues',
): string => {
  if (status === 'passed') return 'Passed';
  if (issueCount === 1) return '1 issue';
  return `${issueCount} issues`;
};

export const ValidationIssuesSection: React.FC<ValidationIssuesSectionProps> = ({
  validation,
  header,
  extraction,
}) => {
  const [viewMode, setViewMode] = useState<ValidationViewMode>('step');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | null>(
    null,
  );

  const applicabilityContext = useMemo(
    () => buildApplicabilityContext(header, extraction),
    [header, extraction],
  );

  const stageSummaries = useMemo(
    () => buildValidationStageSummaries(validation.issues),
    [validation.issues],
  );

  const severityGroups = useMemo(
    () => groupIssuesBySeverity(validation.issues),
    [validation.issues],
  );

  const unresolvedCount = countUnresolvedIssues(validation.issues);
  const criticalCount = countCriticalIssues(validation.issues);

  const selectedStage =
    stageSummaries.find((stage) => stage.stageId === selectedStageId) ?? null;

  const navigatorItems =
    viewMode === 'step'
      ? stageSummaries.map((stage) => ({
          id: stage.stageId,
          label: stage.label,
          status: stage.status,
          issueCount: stage.issueCount,
          statusLabel: getStageStatusLabel(stage.issueCount, stage.status),
        }))
      : SEVERITY_ORDER.map((severity) => {
          const issues = severityGroups[severity].filter(isUnresolvedIssue);
          const allIssues = severityGroups[severity];

          return {
            id: severity,
            label: SEVERITY_LABELS[severity],
            status: getSeveritySummaryStatus(allIssues),
            issueCount: issues.length,
            statusLabel:
              issues.length === 0
                ? 'Clear'
                : issues.length === 1
                ? '1 issue'
                : `${issues.length} issues`,
          };
        });

  const handleModeChange = (mode: ValidationViewMode) => {
    setViewMode(mode);
    setSelectedStageId(null);
    setSelectedSeverity(null);
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
            Validation
          </h3>
          {validation.validation_outcome && (
            <Badge variant="outline">
              {getValidationOutcomeLabel(validation.validation_outcome)}
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} critical</Badge>
          )}
          {unresolvedCount === 0 && (
            <Badge variant="success">All clear</Badge>
          )}
        </div>

        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-0.5">
          <button
            type="button"
            onClick={() => handleModeChange('step')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              viewMode === 'step'
                ? 'bg-white text-[var(--color-foreground)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            By step
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('severity')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              viewMode === 'severity'
                ? 'bg-white text-[var(--color-foreground)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
            )}
          >
            <Layers3 className="h-3.5 w-3.5" />
            By severity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] min-h-[360px]">
        <aside className="border-b lg:border-b-0 lg:border-r border-[var(--color-border)] p-3 bg-[var(--color-muted)]/10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] px-1 mb-2">
            {viewMode === 'step' ? 'Steps' : 'Severity'}
          </p>
          <ValidationNavigator
            items={navigatorItems}
            selectedId={
              viewMode === 'step' ? selectedStageId : selectedSeverity
            }
            onSelect={(id) => {
              if (viewMode === 'step') {
                setSelectedStageId(id);
                return;
              }

              setSelectedSeverity(id as IssueSeverity);
            }}
          />
        </aside>

        <div className="p-4">
          {viewMode === 'step' ? (
            <ValidationStepDetailPanel
              stage={selectedStage}
              applicabilityContext={applicabilityContext}
            />
          ) : (
            <ValidationSeverityDetailPanel
              severity={selectedSeverity}
              issues={
                selectedSeverity ? severityGroups[selectedSeverity] : []
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
