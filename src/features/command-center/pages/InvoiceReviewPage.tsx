import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { PageSpinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DocumentViewer } from '../../extraction-review/components/DocumentViewer';
import { SummaryTab } from '../components/tabs/SummaryTab';
import { InvoiceActionsPanel } from '../components/InvoiceActionsPanel';
import { ExtractionTab } from '../components/tabs/ExtractionTab';
import { ValidationTab } from '../components/tabs/ValidationTab';
import { POCandidatesTab } from '../components/tabs/POCandidatesTab';
import { LineAllocationTab } from '../components/tabs/LineAllocationTab';
import { useInvoiceReview } from '../hooks/useInvoiceReview';
import { cn } from '../../../utils/cn';

type TabId = 'summary' | 'extraction' | 'validation' | 'po-candidates' | 'line-allocation';

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'extraction', label: 'Extraction' },
  { id: 'validation', label: 'Validation' },
  { id: 'po-candidates', label: 'PO Candidates' },
  { id: 'line-allocation', label: 'Line Allocation' },
];

export const InvoiceReviewPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bucket = (location.state as { bucket?: string } | null)?.bucket;

  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const { data, isLoading, isError, refetch } = useInvoiceReview(invoiceId ?? '');

  const backHref = bucket ? `/command-center/${bucket}` : '/command-center';

  if (!invoiceId) {
    return <ErrorState kind="notFound" title="No invoice selected" />;
  }

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        kind="generic"
        title="Failed to load invoice"
        description="Could not load the invoice review data."
        onRetry={() => refetch()}
      />
    );
  }

  const { header, extraction, validation, po_candidates, line_allocation_candidates, workflow } =
    data;

  const flaggedCount = extraction.confidence_scores.filter((s) => s.is_flagged).length;
  const failedCount = validation.issues.filter(
    (i) => i.status === 'fail' || i.status === 'failed',
  ).length;

  const tabBadge: Partial<Record<TabId, number>> = {
    validation: failedCount > 0 ? failedCount : undefined,
    'po-candidates': po_candidates.candidate_groups.length || undefined,
    'line-allocation': line_allocation_candidates.candidate_groups.length || undefined,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px-24px-24px)] min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(backHref)}
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[var(--color-foreground)] truncate">
              {header.invoice_number || 'Invoice Review'}
              {header.vendor?.vendor_name && (
                <span className="font-normal text-[var(--color-muted-foreground)] ml-2">
                  · {header.vendor.vendor_name}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {workflow.invoice_status && (
                <StatusBadge status={workflow.invoice_status} type="invoice" />
              )}
              {workflow.validation_outcome && (
                <Badge
                  variant={
                    workflow.validation_outcome === 'resolved' ||
                    workflow.validation_outcome === 'approved'
                      ? 'success'
                      : 'warning'
                  }
                  dot
                >
                  {workflow.validation_outcome.replace(/_/g, ' ')}
                </Badge>
              )}
              {flaggedCount > 0 && (
                <Badge variant="warning">
                  {flaggedCount} low-confidence field{flaggedCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left — Document viewer (40%) */}
        <div className="w-[40%] flex-shrink-0 min-h-0">
          <DocumentViewer className="h-full" />
        </div>

        {/* Right — Tabbed review panel (60%) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-[var(--color-border)] flex-shrink-0 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => {
              const badge = tabBadge[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                    activeTab === tab.id
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-slate-300',
                  )}
                >
                  {tab.label}
                  {badge != null && (
                    <span
                      className={cn(
                        'flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                        tab.id === 'validation'
                          ? 'bg-[var(--color-destructive-muted)] text-[var(--color-destructive)]'
                          : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pt-4 pr-1">
            {activeTab === 'summary' && (
              <>
                <SummaryTab
                  header={header}
                  validation={validation}
                  confidenceCount={{ total: extraction.confidence_scores.length, flagged: flaggedCount }}
                />
                <InvoiceActionsPanel
                  invoiceId={invoiceId}
                  header={header}
                  bucket={bucket}
                />
              </>
            )}
            {activeTab === 'extraction' && <ExtractionTab extraction={extraction} />}
            {activeTab === 'validation' && <ValidationTab validation={validation} />}
            {activeTab === 'po-candidates' && (
              <POCandidatesTab poCandidates={po_candidates} />
            )}
            {activeTab === 'line-allocation' && (
              <LineAllocationTab lineAllocation={line_allocation_candidates} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
