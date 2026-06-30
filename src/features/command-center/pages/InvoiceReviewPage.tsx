import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  ShoppingCart,
  CalendarDays,
  Building2,
  CircleDollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  FileText,
  Link2,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { PageSpinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DocumentViewer } from '../../extraction-review/components/DocumentViewer';
import { SummaryTab } from '../components/tabs/SummaryTab';
import { ExtractionTab } from '../components/tabs/ExtractionTab';
import { ValidationTab } from '../components/tabs/ValidationTab';
import { DraftTab } from '../components/tabs/DraftTab';
import { POCandidatesTab } from '../components/tabs/POCandidatesTab';
import { LineAllocationTab } from '../components/tabs/LineAllocationTab';
import { InvoiceActionsPanel } from '../components/InvoiceActionsPanel';
import { useInvoiceReview } from '../hooks/useInvoiceReview';
import { countCriticalIssues, hasIssuesRequiringDraft } from '../utils/validationIssueUtils';
import {
  getValidationOutcomeBadgeVariant,
  getValidationOutcomeLabel,
  isResolvedValidationOutcome,
} from '../utils/validationOutcomeUtils';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { env } from '../../../config/env';
import { cn } from '../../../utils/cn';
import type {
  LineAllocationCandidateItemDetails,
  LineAllocationCandidateResponse,
  POCandidateResponse,
} from '../types/invoiceReview.types';

type TabId =
  | 'summary'
  | 'extraction'
  | 'validation'
  | 'draft'
  | 'po-candidates'
  | 'line-allocation';

// Normalise a status/outcome string: lowercase, spaces+hyphens → underscore
const norm = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().replace(/[\s-]+/g, '_');

// ── Line match status helpers ─────────────────────────────────────────────────

type MatchStatus = 'perfect' | 'approximate' | 'warning' | 'error';

const getMatchStatus = (item: LineAllocationCandidateItemDetails): MatchStatus => {
  const type = item.candidate_type.toLowerCase();
  if (type === 'perfect_match') return 'perfect';
  if (type === 'approximate') return 'approximate';
  if (type === 'ambiguous' || type === 'mismatch') return 'warning';
  return 'error';
};

const matchConfig: Record<
  MatchStatus,
  { Icon: React.ElementType; color: string; bg: string; label: string }
> = {
  perfect: {
    Icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Matched',
  },
  approximate: {
    Icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Approx',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    label: 'Review',
  },
  error: {
    Icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Issue',
  },
};

// ── PO Info Panel ─────────────────────────────────────────────────────────────

const APPROVED_STATUSES = new Set([
  // explicit "ready" status labels that may come from older data
  'ready_for_approval',
  'match_approved',
  'approved_ready_to_pay',
  'ready_to_pay',
]);

const POInfoPanel: React.FC<{
  invoiceId: string;
  poCandidates: POCandidateResponse;
  lineAllocation: LineAllocationCandidateResponse;
  invoiceStatus?: string | null;
  validationOutcome?: string | null;
}> = ({ invoiceId, poCandidates, lineAllocation, invoiceStatus, validationOutcome }) => {
  const navigate = useNavigate();
  const selectedGroup =
    poCandidates.candidate_groups.find((g) => g.is_selected) ??
    poCandidates.candidate_groups[0];

  const noCandidates = !selectedGroup?.purchase_orders.length;

  const allocGroup =
    lineAllocation.candidate_groups.find((g) => g.is_selected) ??
    lineAllocation.candidate_groups[0];
  const allocItems = allocGroup?.items ?? [];

  // Mirrors backend `is_ready_for_approval()` — only fully resolved validations
  // show all line match indicators as green.
  const normStatus = norm(invoiceStatus);
  const isApproved =
    isResolvedValidationOutcome(validationOutcome) ||
    APPROVED_STATUSES.has(normStatus);

  return (
    <div className="flex flex-col h-full rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <ShoppingCart className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Matched Purchase Order
          </span>
        </div>
        {isApproved ? (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="h-3 w-3" /> Validated
          </span>
        ) : (
          selectedGroup?.is_selected && (
            <Badge variant="default" dot>
              Active
            </Badge>
          )
        )}
      </div>

      {/* Approved banner — shown prominently when invoice is ready for approval */}
      {isApproved && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border-b border-green-200 flex-shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">All lines validated — ready for approval</p>
            <p className="text-[10px] text-green-700 mt-0.5">
              Invoice matches the PO within acceptable tolerance.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {noCandidates ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px] text-center px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] border border-[var(--color-border)]">
              <AlertCircle className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">No PO Matched</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1 max-w-[200px]">
                No purchase order candidates were found for this invoice.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {selectedGroup.purchase_orders.map((po, idx) => {
              const remaining =
                po.total_amount != null ? po.total_amount - po.consumed_amount : null;
              const budgetPct =
                po.total_amount && po.total_amount > 0
                  ? Math.min(100, Math.round((po.consumed_amount / po.total_amount) * 100))
                  : 0;
              const budgetColor =
                budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-500' : 'bg-green-500';
              const budgetTextColor =
                budgetPct >= 90 ? 'text-red-600' : budgetPct >= 70 ? 'text-amber-600' : 'text-green-600';

              return (
                <div
                  key={po.po_id}
                  className={cn('p-4', idx > 0 && 'border-t border-[var(--color-border)]')}
                >
                  {/* PO header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-foreground)]">{po.po_number}</p>
                      {selectedGroup.confidence_score != null && (
                        <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
                          Match confidence:{' '}
                          <span className="font-semibold">
                            {Math.round(selectedGroup.confidence_score * 100)}%
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/command-center/invoice/${invoiceId}/compare/${po.po_id}`)
                        }
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        View
                      </Button>
                      <StatusBadge status={po.status} type="po" />
                    </div>
                  </div>

                  {/* Key stats grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-[var(--color-muted-foreground)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">Vendor</p>
                        <p className="text-[11px] text-[var(--color-foreground)] truncate">{po.vendor_name ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-[var(--color-muted-foreground)] flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">PO Date</p>
                        <p className="text-[11px] text-[var(--color-foreground)]">{formatDate(po.po_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CircleDollarSign className="h-3 w-3 text-[var(--color-muted-foreground)] flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">PO Value</p>
                        <p className="text-[11px] font-semibold text-[var(--color-foreground)]">
                          {po.total_amount != null ? formatCurrency(po.total_amount, 'INR') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-[var(--color-muted-foreground)] flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">Remaining</p>
                        <p className={cn('text-[11px] font-semibold', remaining != null && remaining <= 0 ? 'text-red-600' : 'text-green-600')}>
                          {remaining != null ? formatCurrency(remaining, 'INR') : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Budget bar */}
                  {po.total_amount != null && (
                    <div className="mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                          Budget Used
                        </span>
                        <span className={cn('text-[10px] font-bold', budgetTextColor)}>{budgetPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                        <div className={cn('h-full rounded-full', budgetColor)} style={{ width: `${budgetPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Line Matching Section ── */}
            {allocItems.length > 0 && (
              <div className="border-t border-[var(--color-border)]">
                {/* Section header */}
                <div
                  className={cn(
                    'px-4 py-2 border-b flex items-center gap-1.5',
                    isApproved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-[var(--color-muted)]/50 border-[var(--color-border)]',
                  )}
                >
                  <Link2 className={cn('h-3.5 w-3.5', isApproved ? 'text-green-600' : 'text-[var(--color-primary)]')} />
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-widest',
                      isApproved ? 'text-green-800' : 'text-[var(--color-foreground)]',
                    )}
                  >
                    Line Item Matching
                  </span>
                  <span
                    className={cn(
                      'ml-auto text-[10px] font-semibold',
                      isApproved ? 'text-green-700' : 'text-[var(--color-muted-foreground)]',
                    )}
                  >
                    {allocItems.length} / {allocItems.length} matched
                  </span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_16px_1fr_56px] gap-0 px-3 py-1.5 bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Invoice Line</span>
                  <span />
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">PO Line</span>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] text-center">Status</span>
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                  {allocItems.map((item) => {
                    // When invoice is validated/approved, always show green regardless
                    // of the internal candidate_type (which may be "approximate")
                    const rawStatus = getMatchStatus(item);
                    const displayStatus: MatchStatus = isApproved ? 'perfect' : rawStatus;
                    const cfg = matchConfig[displayStatus];

                    const invLabel =
                      item.invoice_line_item.item_description ||
                      item.invoice_line_item.item_code ||
                      '—';
                    const poLabel =
                      item.po_line_item.item_description ||
                      item.po_line_item.item_code ||
                      '—';

                    const invQty = Number(item.invoice_line_item.quantity_billed);
                    const allocQty = Number(item.allocated_quantity);
                    const allocAmt = Number(item.allocated_amount);
                    const poOrdered = Number(item.po_line_item.quantity_ordered);
                    const poConsumed = Number(item.po_line_item.consumed_quantity);
                    const poRemaining = poOrdered - poConsumed;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'px-3 py-2.5',
                          isApproved
                            ? 'bg-green-50/20 hover:bg-green-50/40'
                            : displayStatus === 'error'
                            ? 'bg-red-50/30'
                            : displayStatus === 'warning'
                            ? 'bg-amber-50/30'
                            : 'hover:bg-[var(--color-muted)]/30',
                        )}
                      >
                        {/* Top row: invoice ↔ PO names + badge */}
                        <div className="grid grid-cols-[1fr_16px_1fr_56px] gap-0 items-center">
                          <p className="text-[11px] font-semibold text-[var(--color-foreground)] truncate leading-tight pr-1">
                            {invLabel.length > 20 ? invLabel.slice(0, 18) + '…' : invLabel}
                          </p>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                          </div>
                          <p className="text-[11px] font-semibold text-[var(--color-foreground)] truncate leading-tight pl-1">
                            {poLabel.length > 20 ? poLabel.slice(0, 18) + '…' : poLabel}
                          </p>
                          <div className={cn('flex flex-col items-center justify-center gap-0.5 rounded px-1 py-1 mx-0.5', cfg.bg)}>
                            <cfg.Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                            <span className={cn('text-[8px] font-bold leading-none', cfg.color)}>
                              {isApproved ? 'OK' : cfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Detail row: qty/amount breakdown */}
                        <div className="grid grid-cols-2 gap-2 mt-1.5 pr-[56px]">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-[var(--color-muted-foreground)]">
                              Qty: <span className="font-semibold text-[var(--color-foreground)]">{invQty}</span>
                            </span>
                            <span className="text-[9px] text-[var(--color-muted-foreground)]">
                              Alloc: <span className={cn('font-semibold', isApproved ? 'text-green-700' : 'text-[var(--color-foreground)]')}>{allocQty}</span>
                            </span>
                            <span className="text-[9px] text-[var(--color-muted-foreground)]">
                              Amt: <span className={cn('font-semibold', isApproved ? 'text-green-700' : 'text-[var(--color-foreground)]')}>
                                ₹{allocAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[9px] text-[var(--color-muted-foreground)]">
                              PO rem:{' '}
                              <span className={cn(
                                'font-semibold',
                                poRemaining < allocQty - 0.001 ? 'text-red-600' : 'text-[var(--color-foreground)]',
                              )}>
                                {poRemaining.toFixed(1)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Approval summary footer */}
                {isApproved && allocItems.length > 0 && (
                  <div className="border-t border-green-200 px-4 py-2 bg-green-50 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-semibold text-green-700">
                      Total Allocated
                    </span>
                    <span className="text-[11px] font-bold text-green-800">
                      {formatCurrency(
                        allocItems.reduce((s, i) => s + Number(i.allocated_amount), 0),
                        'INR',
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {allocItems.length === 0 && (
              <div className="border-t border-[var(--color-border)] px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                  <FileText className="h-4 w-4" />
                  <p className="text-xs">No line allocation data available yet.</p>
                </div>
              </div>
            )}

            {/* Other candidates note */}
            {poCandidates.candidate_groups.length > 1 && (
              <div className="border-t border-[var(--color-border)] px-4 py-2">
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  {poCandidates.candidate_groups.length - 1} other PO candidate
                  {poCandidates.candidate_groups.length > 2 ? 's' : ''} — see{' '}
                  <span className="font-medium text-[var(--color-primary)]">PO Mapping</span> tab.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────

export const InvoiceReviewPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bucket = (location.state as { bucket?: string } | null)?.bucket;

  const { data, isLoading, isError, refetch } = useInvoiceReview(invoiceId ?? '');
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  // ── Fetch document blob URL ──
  const [docUrl, setDocUrl] = useState<string | undefined>();
  const [docFileType, setDocFileType] = useState<'pdf' | 'image' | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    const token = Cookies.get('access_token');

    fetch(`${env.docExtractionUrl}/invoices/${invoiceId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) return null;
        // Detect file type from Content-Type so DocumentViewer can render correctly
        const ct = r.headers.get('content-type') ?? '';
        if (ct.includes('pdf')) setDocFileType('pdf');
        else if (ct.startsWith('image/')) setDocFileType('image');
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setDocUrl(url);
      })
      .catch(() => {/* preview unavailable — DocumentViewer shows placeholder */});

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [invoiceId]);

  const defaultTab = (): TabId => {
    if (!data) return 'summary';
    if (hasIssuesRequiringDraft(data.validation)) return 'validation';
    return 'summary';
  };

  const backHref = bucket ? `/command-center/${bucket}` : '/command-center';

  if (!invoiceId) return <ErrorState kind="notFound" title="No invoice selected" />;
  if (isLoading) return <PageSpinner />;
  if (isError || !data) {
    return (
      <ErrorState
        kind="generic"
        title="Failed to load invoice"
        description="Could not connect to the invoice service."
        onRetry={() => refetch()}
      />
    );
  }

  const { header, extraction, validation, po_candidates, line_allocation_candidates, workflow } =
    data;

  const needsDraft = hasIssuesRequiringDraft(validation);

  const resolvedTab = activeTab ?? defaultTab();

  const failedCount = countCriticalIssues(validation.issues);
  const warnCount = validation.issues.filter(
    (i) => i.status === 'warning' || i.status === 'warn' || i.issue_type === 'warning',
  ).length;
  const flaggedCount = extraction.confidence_scores.filter((s) => s.is_flagged).length;
  const issuesBadge = failedCount + warnCount;

  interface TabDef {
    id: TabId;
    label: string;
    badge?: number;
    badgeVariant?: 'destructive' | 'warning' | 'muted';
  }

  const TABS: TabDef[] = [
    { id: 'summary', label: 'Summary' },
    {
      id: 'extraction',
      label: 'Extraction',
      badge: flaggedCount > 0 ? flaggedCount : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      id: 'validation',
      label: 'Validation',
      badge: issuesBadge > 0 ? issuesBadge : undefined,
      badgeVariant: (failedCount > 0 ? 'destructive' : 'warning') as TabDef['badgeVariant'],
    },
    {
      id: 'draft',
      label: 'Draft',
      badge: needsDraft && !validation.clarification_sent ? 1 : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      id: 'po-candidates',
      label: 'PO Mapping',
      badge: po_candidates.candidate_groups.length || undefined,
      badgeVariant: 'muted' as const,
    },
    {
      id: 'line-allocation',
      label: 'Line Items Mapping',
      badge: line_allocation_candidates.candidate_groups.length || undefined,
      badgeVariant: 'muted' as const,
    },
  ];

  const badgeBg: Record<NonNullable<TabDef['badgeVariant']>, string> = {
    destructive: 'bg-[var(--color-destructive-muted)] text-[var(--color-destructive)]',
    warning: 'bg-[var(--color-warning-muted)] text-amber-700',
    muted: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(backHref)} title="Back">
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
                  variant={getValidationOutcomeBadgeVariant(workflow.validation_outcome)}
                  dot
                >
                  {getValidationOutcomeLabel(workflow.validation_outcome)}
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
        {/* Action buttons replace the Refresh button */}
        <InvoiceActionsPanel
          invoiceId={invoiceId}
          header={header}
          bucket={bucket}
          compact
        />
      </div>

      {/* ── Document row: Invoice PDF + PO Info Panel side by side ── */}
      <div className="grid grid-cols-2 gap-4" style={{ height: '420px' }}>
        <DocumentViewer fileUrl={docUrl} fileType={docFileType} className="h-full" />
        <POInfoPanel
          invoiceId={invoiceId}
          poCandidates={po_candidates}
          lineAllocation={line_allocation_candidates}
          invoiceStatus={workflow.invoice_status}
          validationOutcome={workflow.validation_outcome}
        />
      </div>

      {/* ── Details section: tabs full width ── */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-[var(--color-border)] overflow-x-auto scrollbar-thin bg-[var(--color-muted)]/40 px-2 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px rounded-t-md',
                resolvedTab === tab.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                  : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-white/60',
              )}
            >
              {tab.label}
              {tab.badge != null && tab.badgeVariant && (
                <span
                  className={cn(
                    'flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                    badgeBg[tab.badgeVariant],
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {resolvedTab === 'summary' && (
            <SummaryTab
              header={header}
              validation={validation}
              confidenceCount={{
                total: extraction.confidence_scores.length,
                flagged: flaggedCount,
              }}
            />
          )}
          {resolvedTab === 'extraction' && (
            <ExtractionTab extraction={extraction} header={header} />
          )}
          {resolvedTab === 'validation' && (
            <ValidationTab
              validation={validation}
              header={header}
              extraction={extraction}
            />
          )}
          {resolvedTab === 'draft' && (
            <DraftTab
              invoiceId={invoiceId}
              invoiceNumber={header.invoice_number}
              vendorEmail={
                extraction.email_details?.received_from ??
                header.received_email ??
                header.vendor?.email ??
                extraction.vendor_details?.vendor_email ??
                null
              }
              validation={validation}
              invoiceStatus={workflow.invoice_status}
              onSent={() => refetch()}
            />
          )}
          {resolvedTab === 'po-candidates' && (
            <POCandidatesTab poCandidates={po_candidates} invoiceId={invoiceId} />
          )}
          {resolvedTab === 'line-allocation' && (
            <LineAllocationTab
              lineAllocation={line_allocation_candidates}
              validation={validation}
            />
          )}
        </div>
      </div>
    </div>
  );
};
