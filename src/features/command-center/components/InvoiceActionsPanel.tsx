import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, TrendingUp, MessageSquare, XCircle, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ApproveDialog } from './ApproveDialog';
import { EscalateDialog } from './EscalateDialog';
import { RejectDialog } from './RejectDialog';
import { useTakeOwnership } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import type {
  InvoiceHeaderResponse,
  InvoiceValidationResponse,
} from '../types/invoiceReview.types';
import { canApproveWithValidationOutcome } from '../utils/validationOutcomeUtils';

const norm = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().replace(/[\s-]+/g, '_');

// Statuses where Approve is valid
const CAN_APPROVE = new Set([
  'ready_for_approval',
  'match_approved',
  'approved_ready_to_pay',
]);

// Statuses where Clarification is valid — never shown when approve is available
const CAN_CLARIFY = new Set([
  'needs_review',
  'under_review',
  'match_issues',
  'pending_action',
  'needs_clarification',
  'validation_issues',
  'extraction_completed',
]);

const CAN_REJECT = new Set([
  'ready_for_approval',
  'needs_review',
  'under_review',
  'match_issues',
  'pending_action',
  'validation_issues',
  'extraction_completed',
]);

const CAN_ESCALATE = new Set([
  'ready_for_approval',
  'needs_review',
  'under_review',
  'match_issues',
  'pending_action',
  'validation_issues',
  'extraction_completed',
]);

const CAN_CLAIM = new Set([
  'escalated',
  'under_review',
  'needs_review',
  'pending_action',
]);

interface InvoiceActionsPanelProps {
  invoiceId: string;
  header: InvoiceHeaderResponse;
  validation?: InvoiceValidationResponse;
  bucket?: string;
  /** compact = inline horizontal buttons for the top bar */
  compact?: boolean;
}

export const InvoiceActionsPanel: React.FC<InvoiceActionsPanelProps> = ({
  invoiceId,
  header,
  validation,
  bucket,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [ownershipConfirmOpen, setOwnershipConfirmOpen] = useState(false);

  const ownershipMutation = useTakeOwnership(invoiceId);

  const status = norm(header.invoice_status);
  const outcome = norm(header.validation_outcome);
  const backHref = bucket ? `/command-center/${bucket}` : '/command-center';

  // Mirror backend approval eligibility:
  //   UNDER_REVIEW + RESOLVED, or ESCALATED + RESOLVED/RECOVERED
  const showApprove =
    CAN_APPROVE.has(status) ||
    ((status === 'under_review' || status === 'escalated') &&
      canApproveWithValidationOutcome(outcome, validation));

  // Clarify is mutually exclusive with Approve — never show both at once
  const showClarification = CAN_CLARIFY.has(status) && !showApprove;
  const showReject = CAN_REJECT.has(status) || showApprove; // reject always available when approvable
  const showEscalate = CAN_ESCALATE.has(status) && !isManager && !showApprove;
  const showOwnership = CAN_CLAIM.has(status) && isManager;

  const hasAnyAction =
    showApprove || showClarification || showReject || showEscalate || showOwnership;

  if (!hasAnyAction) return null;

  const handleTakeOwnership = async () => {
    if (!userId) return;
    setOwnershipConfirmOpen(false);
    await ownershipMutation.mutateAsync({ manager_id: userId });
  };

  const dialogs = (
    <>
      <ApproveDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onSuccess={() => navigate(backHref)}
        invoiceId={invoiceId}
        header={header}
      />
      <EscalateDialog
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onSuccess={() => navigate(backHref)}
        invoiceId={invoiceId}
        invoiceNumber={header.invoice_number}
      />
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => navigate(backHref)}
        invoiceId={invoiceId}
        header={header}
      />
      <ConfirmDialog
        open={ownershipConfirmOpen}
        onClose={() => setOwnershipConfirmOpen(false)}
        onConfirm={handleTakeOwnership}
        loading={ownershipMutation.isPending}
        title="Take ownership?"
        description="This invoice will be assigned to you and will appear in your Claimed queue."
        confirmLabel="Take Ownership"
      />
    </>
  );

  // ── Compact mode: horizontal buttons for the top bar ──────────────────────
  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          {showEscalate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<TrendingUp className="h-3.5 w-3.5" />}
              onClick={() => setEscalateOpen(true)}
            >
              Escalate
            </Button>
          )}

          {showClarification && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
              onClick={() =>
                navigate(`/command-center/invoice/${invoiceId}/clarification`, {
                  state: { bucket },
                })
              }
            >
              Clarify
            </Button>
          )}

          {showReject && (
            <Button
              variant="outline"
              size="sm"
              className="text-[var(--color-destructive)] hover:bg-red-50 hover:border-red-200"
              leftIcon={<XCircle className="h-3.5 w-3.5" />}
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
          )}

          {showApprove && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              onClick={() => setApproveOpen(true)}
            >
              Approve
            </Button>
          )}

          {showOwnership && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserCheck className="h-3.5 w-3.5" />}
              loading={ownershipMutation.isPending}
              onClick={() => setOwnershipConfirmOpen(true)}
            >
              Take Ownership
            </Button>
          )}
        </div>
        {dialogs}
      </>
    );
  }

  // ── Full mode: vertical list in sidebar/tab ───────────────────────────────
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Invoice Actions
      </h3>

      <div className="flex flex-col gap-2">
        {showApprove && (
          <Button
            variant="success"
            size="sm"
            className="w-full justify-start"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => setApproveOpen(true)}
          >
            Approve Invoice
          </Button>
        )}

        {showEscalate && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            leftIcon={<TrendingUp className="h-4 w-4" />}
            onClick={() => setEscalateOpen(true)}
          >
            Escalate to Manager
          </Button>
        )}

        {showClarification && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            leftIcon={<MessageSquare className="h-4 w-4" />}
            onClick={() =>
              navigate(`/command-center/invoice/${invoiceId}/clarification`, {
                state: { bucket },
              })
            }
          >
            Clarify with Vendor
          </Button>
        )}

        {showReject && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[var(--color-destructive)] hover:bg-red-50 hover:border-red-200"
            leftIcon={<XCircle className="h-4 w-4" />}
            onClick={() => setRejectOpen(true)}
          >
            Reject Invoice
          </Button>
        )}

        {showOwnership && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            leftIcon={<UserCheck className="h-4 w-4" />}
            loading={ownershipMutation.isPending}
            onClick={() => setOwnershipConfirmOpen(true)}
          >
            Take Ownership
          </Button>
        )}
      </div>

      {dialogs}
    </div>
  );
};
