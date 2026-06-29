import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Link2,
  ArrowRight,
  Info,
  TrendingUp,
  PhoneCall,
  UserCheck,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import { formatCurrency } from '../../../../utils/formatters';
import { isUnresolvedIssue } from '../../utils/validationIssueUtils';
import type {
  InvoiceValidationResponse,
  LineAllocationCandidateGroupDetails,
  LineAllocationCandidateItemDetails,
  LineAllocationCandidateResponse,
  ValidationIssueDetails,
} from '../../types/invoiceReview.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ISSUE_CANDIDATE_TYPES = new Set(['ambiguous', 'invalid', 'missing', 'mismatch']);

const lineLabel = (code: string | null, description: string | null) =>
  description || code || '—';

const qtyClose = (a: number, b: number) => Math.abs(a - b) < 0.001;

interface MappingIssue {
  key: string;
  type: 'overallocation' | 'qty_mismatch' | 'candidate_type' | 'validation';
  message: string;
  severity: 'error' | 'warning';
}

const getMappingIssues = (item: LineAllocationCandidateItemDetails): MappingIssue[] => {
  const issues: MappingIssue[] = [];
  const type = item.candidate_type.toLowerCase();

  if (ISSUE_CANDIDATE_TYPES.has(type)) {
    issues.push({
      key: `ctype-${item.id}`,
      type: 'candidate_type',
      message: `Match status is "${type.replace(/_/g, ' ')}"`,
      severity: type === 'ambiguous' || type === 'missing' ? 'error' : 'warning',
    });
  }

  const poRemaining = item.po_line_item.quantity_ordered - item.po_line_item.consumed_quantity;

  if (item.allocated_quantity > poRemaining + 0.001) {
    issues.push({
      key: `overalloc-${item.id}`,
      type: 'overallocation',
      message: `Allocated qty (${item.allocated_quantity}) exceeds PO remaining (${poRemaining.toFixed(2)})`,
      severity: 'error',
    });
  }

  if (!qtyClose(item.allocated_quantity, item.invoice_line_item.quantity_billed)) {
    issues.push({
      key: `qtymm-${item.id}`,
      type: 'qty_mismatch',
      message: `Invoice billed ${item.invoice_line_item.quantity_billed} but ${item.allocated_quantity} allocated to PO`,
      severity: 'warning',
    });
  }

  return issues;
};

const getRelatedValidationIssues = (
  item: LineAllocationCandidateItemDetails,
  validation?: InvoiceValidationResponse,
): ValidationIssueDetails[] => {
  if (!validation) return [];

  const needles = [
    item.invoice_line_item.item_code,
    item.po_line_item.item_code,
    item.invoice_line_item.item_description,
    item.po_line_item.item_description,
  ]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => v.toLowerCase());

  return validation.issues.filter((issue) => {
    if (!isUnresolvedIssue(issue)) return false;
    const stage = (issue.check_stage ?? '').toLowerCase();
    if (stage === 'line_items' || stage === 'line_item' || stage === 'po') {
      const blob =
        `${issue.field_name ?? ''} ${issue.description} ${issue.check_name}`.toLowerCase();
      if (needles.some((n) => n.length > 2 && blob.includes(n))) return true;
      if (stage === 'line_items' || stage === 'line_item') return true;
    }
    const blob =
      `${issue.field_name ?? ''} ${issue.description} ${issue.check_name}`.toLowerCase();
    return needles.some((n) => n.length > 2 && blob.includes(n));
  });
};

// ── Action guidance — maps issue types to clear next steps ───────────────────

interface ActionGuide {
  Icon: React.ElementType;
  iconColor: string;
  title: string;
  guidance: string;
}

const getActionGuide = (issue: MappingIssue): ActionGuide => {
  switch (issue.type) {
    case 'overallocation':
      return {
        Icon: TrendingUp,
        iconColor: 'text-red-600',
        title: 'Quantity Over-Allocation',
        guidance:
          'The allocated quantity exceeds what remains on the PO. Escalate to Finance Manager to request a PO amendment, or split the invoice into a partial payment.',
      };
    case 'qty_mismatch':
      return {
        Icon: PhoneCall,
        iconColor: 'text-amber-600',
        title: 'Quantity Discrepancy',
        guidance:
          'The invoiced quantity differs from the allocated amount. Contact the vendor to verify the correct quantity or request a revised invoice.',
      };
    case 'candidate_type':
      if (issue.message.includes('ambiguous')) {
        return {
          Icon: HelpCircle,
          iconColor: 'text-amber-600',
          title: 'Ambiguous PO Match',
          guidance:
            'Multiple PO lines match this invoice item. Manual selection is required — review the PO Mapping tab and confirm the correct allocation before approving.',
        };
      }
      if (issue.message.includes('missing')) {
        return {
          Icon: Wrench,
          iconColor: 'text-red-600',
          title: 'No PO Line Found',
          guidance:
            'No matching PO line was found for this invoice item. Raise a new PO with the procurement team, or reject this line item.',
        };
      }
      if (issue.message.includes('mismatch')) {
        return {
          Icon: UserCheck,
          iconColor: 'text-red-600',
          title: 'Item Code Mismatch',
          guidance:
            'The invoice item code does not match the PO item code. Verify with the vendor that the correct item is being billed, and cross-check the PO before approving.',
        };
      }
      return {
        Icon: AlertTriangle,
        iconColor: 'text-amber-600',
        title: 'Match Issue',
        guidance: 'Review this line mapping carefully before approving the invoice.',
      };
    case 'validation':
      return {
        Icon: XCircle,
        iconColor: 'text-red-600',
        title: 'Validation Failure',
        guidance:
          'This line has a validation issue flagged by the system. Review the Validation tab for full details and resolve before approving.',
      };
    default:
      return {
        Icon: Info,
        iconColor: 'text-slate-500',
        title: 'Review Required',
        guidance: 'This item needs manual review.',
      };
  }
};

// ── Mapping Row — table-row style with expandable issue details ───────────────

const MappingRow: React.FC<{
  item: LineAllocationCandidateItemDetails;
  validation?: InvoiceValidationResponse;
  index: number;
}> = ({ item, validation, index }) => {
  const [expanded, setExpanded] = useState(false);

  const mappingIssues = getMappingIssues(item);
  const validationIssues = getRelatedValidationIssues(item, validation);
  const hasIssues = mappingIssues.length > 0 || validationIssues.length > 0;
  const hasCritical =
    mappingIssues.some((i) => i.severity === 'error') || validationIssues.length > 0;

  const poRemaining = item.po_line_item.quantity_ordered - item.po_line_item.consumed_quantity;
  const qtyOk = qtyClose(item.allocated_quantity, item.invoice_line_item.quantity_billed);
  const poOk = item.allocated_quantity <= poRemaining + 0.001;

  const allValidationIssues: MappingIssue[] = [
    ...mappingIssues,
    ...validationIssues.map((vi) => ({
      key: vi.id,
      type: 'validation' as const,
      message: vi.description,
      severity: 'error' as const,
    })),
  ];

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-shadow',
        hasCritical
          ? 'border-red-200 shadow-[0_0_0_1px_#fecaca]'
          : hasIssues
          ? 'border-amber-200'
          : 'border-[var(--color-border)]',
      )}
    >
      {/* Main row */}
      <div
        className={cn(
          'grid gap-0 divide-x divide-[var(--color-border)]',
          'grid-cols-[32px_1fr_88px_1fr_120px]',
          hasCritical ? 'bg-red-50/30' : hasIssues ? 'bg-amber-50/30' : 'bg-white',
        )}
      >
        {/* Index */}
        <div className="flex items-center justify-center">
          <span className="text-[11px] font-bold text-[var(--color-muted-foreground)]">
            {index + 1}
          </span>
        </div>

        {/* Invoice line */}
        <div className="p-3 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 mb-1">
            Invoice Line
          </p>
          <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {lineLabel(
              item.invoice_line_item.item_code,
              item.invoice_line_item.item_description,
            )}
          </p>
          {item.invoice_line_item.item_code && (
            <p className="text-[10px] font-mono text-[var(--color-muted-foreground)] mt-0.5">
              {item.invoice_line_item.item_code}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-muted-foreground)]">
            <span>
              Billed:{' '}
              <span
                className={cn(
                  'font-semibold',
                  !qtyOk ? 'text-amber-600' : 'text-[var(--color-foreground)]',
                )}
              >
                {item.invoice_line_item.quantity_billed}
              </span>
            </span>
            <span>
              Total:{' '}
              <span className="font-medium text-[var(--color-foreground)]">
                {formatCurrency(item.invoice_line_item.line_total, 'INR')}
              </span>
            </span>
          </div>
        </div>

        {/* Allocation center */}
        <div className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--color-muted)]/40">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-muted)]">
            <ArrowRight className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          <p className="text-[9px] uppercase tracking-wide text-[var(--color-muted-foreground)] text-center">
            Alloc
          </p>
          <p className="text-[11px] font-bold text-[var(--color-foreground)]">
            {item.allocated_quantity}
          </p>
          <p className="text-[9px] text-[var(--color-muted-foreground)]">
            {formatCurrency(item.allocated_amount, 'INR')}
          </p>
        </div>

        {/* PO line */}
        <div className="p-3 min-w-0">
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-widest mb-1',
              hasCritical ? 'text-red-700' : hasIssues ? 'text-amber-700' : 'text-green-700',
            )}
          >
            PO Line
          </p>
          <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {lineLabel(item.po_line_item.item_code, item.po_line_item.item_description)}
          </p>
          {item.po_line_item.item_code && (
            <p className="text-[10px] font-mono text-[var(--color-muted-foreground)] mt-0.5">
              {item.po_line_item.item_code}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-muted-foreground)]">
            <span>
              Ordered: <span className="font-semibold text-[var(--color-foreground)]">{item.po_line_item.quantity_ordered}</span>
            </span>
            <span>
              Consumed: <span className="font-semibold text-[var(--color-foreground)]">{item.po_line_item.consumed_quantity}</span>
            </span>
            <span>
              Remaining:{' '}
              <span
                className={cn(
                  'font-bold',
                  !poOk ? 'text-red-600' : 'text-green-600',
                )}
              >
                {poRemaining.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

        {/* Status + expand */}
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          {hasIssues ? (
            hasCritical ? (
              <div className="flex flex-col items-center gap-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-[10px] font-semibold text-red-700 text-center">
                  {allValidationIssues.length} Issue{allValidationIssues.length > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-700 text-center">
                  Warning
                </span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-[10px] font-semibold text-green-700">Clean</span>
            </div>
          )}

          {hasIssues && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[var(--color-primary)] hover:underline"
            >
              Details
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded issue details + action guides */}
      {hasIssues && expanded && (
        <div className="border-t border-[var(--color-border)] bg-white divide-y divide-[var(--color-border)]">
          {allValidationIssues.map((issue) => {
            const guide = getActionGuide(issue);
            return (
              <div key={issue.key} className="p-4 flex gap-4">
                {/* Issue type + message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        issue.severity === 'error' ? 'text-red-900' : 'text-amber-900',
                      )}
                    >
                      {issue.message}
                    </p>
                  </div>
                </div>

                {/* Action guide */}
                <div
                  className={cn(
                    'flex-1 min-w-0 rounded-lg border p-3',
                    issue.severity === 'error'
                      ? 'border-blue-100 bg-blue-50/60'
                      : 'border-amber-100 bg-amber-50/60',
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <guide.Icon className={cn('h-3.5 w-3.5 flex-shrink-0', guide.iconColor)} />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-foreground)]">
                      Recommended Action
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-foreground)] leading-relaxed">
                    {guide.guidance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Group section ─────────────────────────────────────────────────────────────

const GroupSection: React.FC<{
  group: LineAllocationCandidateGroupDetails;
  validation?: InvoiceValidationResponse;
  isPrimary?: boolean;
}> = ({ group, validation, isPrimary }) => {
  const itemsWithIssues = group.items.filter(
    (item) =>
      getMappingIssues(item).length > 0 ||
      getRelatedValidationIssues(item, validation).length > 0,
  );

  const cleanCount = group.items.length - itemsWithIssues.length;

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        group.is_selected ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]',
      )}
    >
      {/* Group header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2',
          group.is_selected
            ? 'bg-[var(--color-primary-muted)] border-blue-100'
            : 'bg-[var(--color-muted)] border-[var(--color-border)]',
        )}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Link2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]">
            {isPrimary ? 'Active Allocation Plan' : group.candidate_type.replace(/_/g, ' ')}
          </span>
          {group.is_selected && (
            <Badge variant="default" dot>
              Selected
            </Badge>
          )}
          {itemsWithIssues.length > 0 && (
            <Badge variant="warning">
              {itemsWithIssues.length} line{itemsWithIssues.length > 1 ? 's' : ''} with issues
            </Badge>
          )}
          {cleanCount > 0 && (
            <Badge variant="success">
              {cleanCount} clean
            </Badge>
          )}
        </div>
        {group.confidence_score != null && (
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Confidence:{' '}
            <span className="font-semibold text-[var(--color-foreground)]">
              {Math.round(group.confidence_score * 100)}%
            </span>
          </span>
        )}
      </div>

      {/* Column headers */}
      {group.items.length > 0 && (
        <div className="grid grid-cols-[32px_1fr_88px_1fr_120px] divide-x divide-[var(--color-border)] border-b border-[var(--color-border)] bg-[var(--color-muted)]/50">
          <div />
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Invoice Line
          </div>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] text-center">
            Allocated
          </div>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            PO Line
          </div>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] text-center">
            Status
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="bg-white divide-y divide-[var(--color-border)]">
        {group.items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">
            No line mappings in this group.
          </p>
        ) : (
          group.items.map((item, index) => (
            <MappingRow
              key={item.id}
              item={item}
              validation={validation}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface LineAllocationTabProps {
  lineAllocation: LineAllocationCandidateResponse;
  validation?: InvoiceValidationResponse;
}

export const LineAllocationTab: React.FC<LineAllocationTabProps> = ({
  lineAllocation,
  validation,
}) => {
  if (!lineAllocation.candidate_groups.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)] border border-[var(--color-border)]">
          <Link2 className="h-6 w-6 text-[var(--color-muted-foreground)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            No Line Item Mappings
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-sm mt-1">
            No invoice-to-PO line allocation was generated for this invoice. Ensure a PO has been
            matched first.
          </p>
        </div>
      </div>
    );
  }

  const selectedGroup =
    lineAllocation.candidate_groups.find((g) => g.is_selected) ??
    lineAllocation.candidate_groups[0];
  const otherGroups = lineAllocation.candidate_groups.filter((g) => g.id !== selectedGroup.id);

  const allItems = selectedGroup.items;
  const itemsWithIssues = allItems.filter(
    (item) =>
      getMappingIssues(item).length > 0 ||
      getRelatedValidationIssues(item, validation).length > 0,
  );
  const cleanItems = allItems.length - itemsWithIssues.length;
  const healthPct = allItems.length > 0 ? Math.round((cleanItems / allItems.length) * 100) : 100;

  const lineItemValidationIssues =
    validation?.issues.filter(
      (issue) =>
        isUnresolvedIssue(issue) &&
        ['line_items', 'line_item', 'po'].includes((issue.check_stage ?? '').toLowerCase()),
    ) ?? [];

  const hasCriticalIssues = itemsWithIssues.some((item) =>
    getMappingIssues(item).some((i) => i.severity === 'error'),
  ) || lineItemValidationIssues.length > 0;

  return (
    <div className="space-y-5">
      {/* ── Health banner ── */}
      <div
        className={cn(
          'rounded-lg border p-4',
          hasCriticalIssues
            ? 'border-red-200 bg-red-50/40'
            : itemsWithIssues.length > 0
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-green-200 bg-green-50/40',
        )}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            {itemsWithIssues.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : hasCriticalIssues ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  hasCriticalIssues
                    ? 'text-red-900'
                    : itemsWithIssues.length > 0
                    ? 'text-amber-900'
                    : 'text-green-900',
                )}
              >
                {itemsWithIssues.length === 0
                  ? 'All line mappings are consistent'
                  : hasCriticalIssues
                  ? `${itemsWithIssues.length} line${itemsWithIssues.length > 1 ? 's' : ''} require action`
                  : `${itemsWithIssues.length} line${itemsWithIssues.length > 1 ? 's' : ''} need review`}
              </p>
              <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                {cleanItems} of {allItems.length} invoice lines mapped cleanly
                {selectedGroup.confidence_score != null &&
                  ` · Overall confidence: ${Math.round(selectedGroup.confidence_score * 100)}%`}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'text-2xl font-bold tabular-nums',
              healthPct === 100
                ? 'text-green-700'
                : healthPct >= 70
                ? 'text-amber-700'
                : 'text-red-700',
            )}
          >
            {healthPct}%
          </span>
        </div>

        {/* Health progress bar */}
        <div className="h-2 rounded-full bg-white/60 border border-white/80 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              healthPct === 100 ? 'bg-green-500' : healthPct >= 70 ? 'bg-amber-500' : 'bg-red-500',
            )}
            style={{ width: `${healthPct}%` }}
          />
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="font-semibold text-green-800">{cleanItems}</span>
            <span className="text-[var(--color-muted-foreground)]">clean</span>
          </div>
          {itemsWithIssues.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-semibold text-amber-800">{itemsWithIssues.length}</span>
              <span className="text-[var(--color-muted-foreground)]">with issues</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-foreground)]">{allItems.length}</span>
            <span className="text-[var(--color-muted-foreground)]">total mappings</span>
          </div>
        </div>
      </div>

      {/* ── Global validation issues (unmatched to a specific line) ── */}
      {lineItemValidationIssues.length > 0 && itemsWithIssues.length === 0 && (
        <div className="rounded-lg border border-red-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-red-900">
              Line Item Validation Issues
            </h3>
          </div>
          <div className="p-4 space-y-3 bg-white">
            {lineItemValidationIssues.map((issue) => (
              <div key={issue.id} className="flex gap-3">
                <XCircle className="h-4 w-4 text-[var(--color-destructive)] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {issue.check_name}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {issue.description}
                  </p>
                </div>
                <div className="flex-1 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-foreground)] mb-1">
                    Recommended Action
                  </p>
                  <p className="text-xs text-[var(--color-foreground)] leading-relaxed">
                    Review the Validation tab for full details. Resolve all open issues before
                    approving this invoice.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── How to read this section (shown only when issues exist) ── */}
      {itemsWithIssues.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3">
          <Info className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            Rows with issues are highlighted. Click{' '}
            <span className="font-semibold text-[var(--color-primary)]">Details</span> on any row
            to expand the specific problem and see the recommended action. Expand all rows with
            issues before making an approval decision.
          </p>
        </div>
      )}

      {/* ── Primary allocation plan (table) ── */}
      <GroupSection group={selectedGroup} validation={validation} isPrimary />

      {/* ── Alternative plans ── */}
      {otherGroups.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Alternative Allocation Plans
          </p>
          {otherGroups.map((group) => (
            <GroupSection key={group.id} group={group} validation={validation} />
          ))}
        </div>
      )}
    </div>
  );
};
