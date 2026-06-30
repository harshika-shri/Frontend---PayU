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
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { cn } from '../../../../utils/cn';
import { formatCurrency } from '../../../../utils/formatters';
import { isUnresolvedIssue } from '../../utils/validationIssueUtils';
import {
  type CandidatePOCard,
  parseValidationIssueForMapping,
} from '../../utils/lineMappingPresentation';
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
  title: string;
  message: string;
  severity: 'error' | 'warning';
}

const getMappingIssues = (item: LineAllocationCandidateItemDetails): MappingIssue[] => {
  const issues: MappingIssue[] = [];
  const type = item.candidate_type.toLowerCase();

  if (ISSUE_CANDIDATE_TYPES.has(type)) {
    const label = type.replace(/_/g, ' ');
    issues.push({
      key: `ctype-${item.id}`,
      type: 'candidate_type',
      title: `Match status: ${label}`,
      message: `This line was matched with status "${label}". Review whether the PO line is correct.`,
      severity: type === 'ambiguous' || type === 'missing' ? 'error' : 'warning',
    });
  }

  const poRemaining = item.po_line_item.quantity_ordered - item.po_line_item.consumed_quantity;

  if (item.allocated_quantity > poRemaining + 0.001) {
    issues.push({
      key: `overalloc-${item.id}`,
      type: 'overallocation',
      title: 'Quantity over-allocation',
      message: `Allocated quantity (${item.allocated_quantity}) exceeds PO remaining (${poRemaining.toFixed(2)}).`,
      severity: 'error',
    });
  }

  if (!qtyClose(item.allocated_quantity, item.invoice_line_item.quantity_billed)) {
    issues.push({
      key: `qtymm-${item.id}`,
      type: 'qty_mismatch',
      title: 'Quantity discrepancy',
      message: `Invoice bills ${item.invoice_line_item.quantity_billed} units, but only ${item.allocated_quantity} were allocated to this PO line.`,
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

interface ActionGuide {
  Icon: React.ElementType;
  iconColor: string;
  guidance: string;
}

const getActionGuide = (issue: MappingIssue): ActionGuide => {
  switch (issue.type) {
    case 'overallocation':
      return {
        Icon: TrendingUp,
        iconColor: 'text-red-600',
        guidance:
          'The allocated quantity exceeds what remains on the PO. Escalate to Finance Manager to request a PO amendment, or split the invoice into a partial payment.',
      };
    case 'qty_mismatch':
      return {
        Icon: PhoneCall,
        iconColor: 'text-amber-600',
        guidance:
          'The invoiced quantity differs from the allocated amount. Contact the vendor to verify the correct quantity or request a revised invoice.',
      };
    case 'candidate_type':
      if (issue.title.includes('ambiguous')) {
        return {
          Icon: HelpCircle,
          iconColor: 'text-amber-600',
          guidance:
            'Multiple PO lines match this invoice item. Review the PO Mapping tab and confirm the correct allocation before approving.',
        };
      }
      if (issue.title.includes('missing')) {
        return {
          Icon: Wrench,
          iconColor: 'text-red-600',
          guidance:
            'No matching PO line was found for this invoice item. Raise a new PO with procurement, or reject this line item.',
        };
      }
      if (issue.title.includes('mismatch')) {
        return {
          Icon: UserCheck,
          iconColor: 'text-red-600',
          guidance:
            'The invoice item code does not match the PO item code. Verify with the vendor and cross-check the PO before approving.',
        };
      }
      return {
        Icon: AlertTriangle,
        iconColor: 'text-amber-600',
        guidance: 'Review this line mapping carefully before approving the invoice.',
      };
    default:
      return {
        Icon: Info,
        iconColor: 'text-slate-500',
        guidance: 'This item needs manual review.',
      };
  }
};

// ── Structured sub-components ─────────────────────────────────────────────────

const QtyComparisonTable: React.FC<{
  invoiceQty: number;
  allocatedQty: number;
  poOrdered: number;
  poConsumed: number;
}> = ({ invoiceQty, allocatedQty, poOrdered, poConsumed }) => {
  const poRemaining = poOrdered - poConsumed;

  const cells = [
    { label: 'Invoice billed', value: invoiceQty, highlight: !qtyClose(invoiceQty, allocatedQty) },
    { label: 'Allocated to PO', value: allocatedQty, highlight: !qtyClose(invoiceQty, allocatedQty) },
    { label: 'PO ordered', value: poOrdered, highlight: false },
    { label: 'PO consumed', value: poConsumed, highlight: false },
    {
      label: 'PO remaining',
      value: poRemaining,
      highlight: allocatedQty > poRemaining + 0.001,
    },
  ];

  return (
    <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-[var(--color-border)] bg-[var(--color-muted)]/30">
        {cells.map((cell) => (
          <div key={cell.label} className="px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {cell.label}
            </p>
            <p
              className={cn(
                'text-sm font-bold mt-0.5 tabular-nums',
                cell.highlight ? 'text-amber-700' : 'text-[var(--color-foreground)]',
              )}
            >
              {typeof cell.value === 'number' ? cell.value.toFixed(2).replace(/\.00$/, '') : cell.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CandidatePOCards: React.FC<{ candidates: CandidatePOCard[] }> = ({ candidates }) => {
  if (candidates.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Candidate purchase orders
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {candidates.map((po) => (
          <div
            key={po.poNumber}
            className="rounded-md border border-[var(--color-border)] bg-white overflow-hidden"
          >
            <div className="px-3 py-2 bg-[var(--color-muted)]/40 border-b border-[var(--color-border)] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {po.poNumber}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {po.status && (
                  <Badge variant="outline" className="text-[10px]">
                    {po.status}
                  </Badge>
                )}
                {po.date && (
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">
                    {po.date}
                  </span>
                )}
              </div>
            </div>
            {po.lines.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-slate-50">
                    {['Item', 'HSN/SAC', 'Ordered', 'Unit price', 'Available'].map((h) => (
                      <th
                        key={h}
                        className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {po.lines.map((line, index) => (
                    <tr
                      key={`${po.poNumber}-${index}`}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="px-2 py-1.5 font-medium text-[var(--color-foreground)]">
                        {line.description}
                      </td>
                      <td className="px-2 py-1.5 text-[var(--color-muted-foreground)]">
                        {line.hsnSac || '—'}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">{line.ordered || '—'}</td>
                      <td className="px-2 py-1.5 tabular-nums">{line.unitPrice || '—'}</td>
                      <td className="px-2 py-1.5 tabular-nums font-semibold">
                        {line.available || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-3 py-2 text-xs text-[var(--color-muted-foreground)] italic">
                No line items listed
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ValidSolutionsList: React.FC<{ solutions: string[][] }> = ({ solutions }) => {
  if (solutions.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Valid PO combinations
      </p>
      <ol className="space-y-1">
        {solutions.map((solution, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-[var(--color-foreground)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-[10px] font-bold text-[var(--color-primary)]">
              {index + 1}
            </span>
            {solution.join(', ')}
          </li>
        ))}
      </ol>
    </div>
  );
};

const MappingIssueDetail: React.FC<{
  issue: MappingIssue;
  item: LineAllocationCandidateItemDetails;
}> = ({ issue, item }) => {
  const guide = getActionGuide(issue);
  const GuideIcon = guide.Icon;
  const showQtyTable =
    issue.type === 'qty_mismatch' || issue.type === 'overallocation';

  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3',
        issue.severity === 'error'
          ? 'border-red-200 bg-red-50/20'
          : 'border-amber-200 bg-amber-50/20',
      )}
    >
      <div className="flex items-start gap-2">
        {issue.severity === 'error' ? (
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{issue.title}</p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed mt-1">
            {issue.message}
          </p>
        </div>
      </div>

      {showQtyTable && (
        <QtyComparisonTable
          invoiceQty={item.invoice_line_item.quantity_billed}
          allocatedQty={item.allocated_quantity}
          poOrdered={item.po_line_item.quantity_ordered}
          poConsumed={item.po_line_item.consumed_quantity}
        />
      )}

      <div className="rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <GuideIcon className={cn('h-3.5 w-3.5', guide.iconColor)} />
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-foreground)]">
            Recommended action
          </p>
        </div>
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
          {guide.guidance}
        </p>
      </div>
    </div>
  );
};

const recoveryStatusConfig = {
  resolved: {
    label: 'Resolved by system',
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-50 text-green-900',
    iconClass: 'text-[var(--color-success)]',
  },
  partial: {
    label: 'Recoverable — needs confirmation',
    icon: RotateCcw,
    className: 'border-sky-200 bg-sky-50 text-sky-900',
    iconClass: 'text-[var(--color-info)]',
  },
  waived: {
    label: 'Waived to continue processing',
    icon: ShieldCheck,
    className: 'border-slate-200 bg-slate-50 text-slate-800',
    iconClass: 'text-slate-600',
  },
  not_recoverable: {
    label: 'Not recoverable — manual review required',
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-[var(--color-destructive)]',
  },
};

const ValidationIssueDetail: React.FC<{
  issue: ValidationIssueDetails;
}> = ({ issue }) => {
  const parsed = parseValidationIssueForMapping(issue);
  const recovery = recoveryStatusConfig[parsed.recoveryStatus];
  const RecoveryIcon = recovery.icon;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/20 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            {parsed.title}
          </p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed mt-1">
            {parsed.summary}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'rounded-md border px-3 py-2.5 flex items-start gap-2.5',
          recovery.className,
        )}
      >
        <RecoveryIcon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', recovery.iconClass)} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">{recovery.label}</p>
          <p className="text-sm mt-1 leading-relaxed">{parsed.recoveryReason}</p>
        </div>
      </div>

      <CandidatePOCards candidates={parsed.candidatePos} />
      <ValidSolutionsList solutions={parsed.validSolutions} />

      {parsed.allocationPlans.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Valid allocation plans
          </p>
          <ol className="space-y-1 text-sm text-[var(--color-foreground)]">
            {parsed.allocationPlans.map((plan, index) => (
              <li key={index} className="leading-relaxed">
                <span className="font-semibold">{index + 1}.</span> {plan}
              </li>
            ))}
          </ol>
        </div>
      )}

      {parsed.technicalDetails.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
            Supporting details
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {parsed.technicalDetails
              .filter(
                (entry) =>
                  !['Candidate Pos', 'Valid Solutions'].includes(entry.label),
              )
              .map((entry) => (
                <div key={`${issue.id}-${entry.label}`}>
                  <dt className="text-xs text-[var(--color-muted-foreground)]">
                    {entry.label}
                  </dt>
                  <dd className="font-medium text-[var(--color-foreground)] break-words">
                    {entry.value}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      <div className="rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-foreground)] mb-1">
          Recommended action
        </p>
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
          {parsed.recommendedAction}
        </p>
      </div>
    </div>
  );
};

// ── Mapping Row ───────────────────────────────────────────────────────────────

const MappingRow: React.FC<{
  item: LineAllocationCandidateItemDetails;
  validation?: InvoiceValidationResponse;
  index: number;
}> = ({ item, validation, index }) => {
  const mappingIssues = getMappingIssues(item);
  const validationIssues = getRelatedValidationIssues(item, validation);
  const hasIssues = mappingIssues.length > 0 || validationIssues.length > 0;
  const hasCritical =
    mappingIssues.some((i) => i.severity === 'error') || validationIssues.length > 0;

  const [expanded, setExpanded] = useState(hasIssues);

  const poRemaining = item.po_line_item.quantity_ordered - item.po_line_item.consumed_quantity;
  const qtyOk = qtyClose(item.allocated_quantity, item.invoice_line_item.quantity_billed);
  const poOk = item.allocated_quantity <= poRemaining + 0.001;
  const issueCount = mappingIssues.length + validationIssues.length;

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
      <button
        type="button"
        onClick={() => hasIssues && setExpanded((value) => !value)}
        disabled={!hasIssues}
        className={cn(
          'w-full grid gap-0 divide-x divide-[var(--color-border)] text-left',
          'grid-cols-[32px_1fr_88px_1fr_120px]',
          hasCritical ? 'bg-red-50/30' : hasIssues ? 'bg-amber-50/30' : 'bg-white',
          hasIssues && 'hover:bg-[var(--color-muted)]/10 cursor-pointer',
          !hasIssues && 'cursor-default',
        )}
      >
        <div className="flex items-center justify-center">
          <span className="text-[11px] font-bold text-[var(--color-muted-foreground)]">
            {index + 1}
          </span>
        </div>

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
              Ordered:{' '}
              <span className="font-semibold text-[var(--color-foreground)]">
                {item.po_line_item.quantity_ordered}
              </span>
            </span>
            <span>
              Consumed:{' '}
              <span className="font-semibold text-[var(--color-foreground)]">
                {item.po_line_item.consumed_quantity}
              </span>
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

        <div className="flex flex-col items-center justify-center gap-2 p-2">
          {hasIssues ? (
            hasCritical ? (
              <div className="flex flex-col items-center gap-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-[10px] font-semibold text-red-700 text-center">
                  {issueCount} issue{issueCount > 1 ? 's' : ''}
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
            <span className="text-[var(--color-muted-foreground)]">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </div>
      </button>

      {hasIssues && expanded && (
        <div className="border-t border-[var(--color-border)] bg-white p-4 space-y-3">
          {mappingIssues.map((issue) => (
            <MappingIssueDetail key={issue.key} issue={issue} item={item} />
          ))}
          {validationIssues.map((issue) => (
            <ValidationIssueDetail key={issue.id} issue={issue} />
          ))}
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
            <Badge variant="success">{cleanCount} clean</Badge>
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

      <div className="bg-white divide-y divide-[var(--color-border)] p-2 space-y-2">
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
        ['line_items', 'line_item', 'po', 'line_item_validation', 'po_resolution'].includes(
          (issue.check_stage ?? '').toLowerCase(),
        ),
    ) ?? [];

  const hasCriticalIssues =
    itemsWithIssues.some((item) =>
      getMappingIssues(item).some((i) => i.severity === 'error'),
    ) || lineItemValidationIssues.length > 0;

  return (
    <div className="space-y-5">
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

        <div className="h-2 rounded-full bg-white/60 border border-white/80 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              healthPct === 100 ? 'bg-green-500' : healthPct >= 70 ? 'bg-amber-500' : 'bg-red-500',
            )}
            style={{ width: `${healthPct}%` }}
          />
        </div>

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
              <ValidationIssueDetail key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {itemsWithIssues.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3">
          <Info className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            Rows with issues are highlighted and open by default. Use the chevron on each row to
            collapse or expand the full explanation, quantity comparison, and recommended action.
          </p>
        </div>
      )}

      <GroupSection group={selectedGroup} validation={validation} isPrimary />

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
