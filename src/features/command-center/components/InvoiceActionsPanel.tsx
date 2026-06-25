import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, TrendingUp, MessageSquare, XCircle, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ApproveDialog } from './ApproveDialog';
import { EscalateDialog } from './EscalateDialog';
import { useTakeOwnership } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRole } from '../../auth/constants/userRole';
import type { InvoiceHeaderResponse } from '../types/invoiceReview.types';

// Statuses where each action is available
const APPROVE_STATUSES = new Set([
  'ready_for_approval',
  'match_approved',
  'approved_ready_to_pay',
]);
const CLARIFICATION_STATUSES = new Set([
  'ready_for_approval',
  'needs_review',
  'match_issues',
  'under_review',
  'pending_action',
  'needs_clarification',
]);
const REJECT_STATUSES = new Set([
  'ready_for_approval',
  'needs_review',
  'match_issues',
  'under_review',
  'pending_action',
]);
const ESCALATE_STATUSES = new Set([
  'ready_for_approval',
  'needs_review',
  'match_issues',
  'under_review',
  'pending_action',
]);
const OWNERSHIP_STATUSES = new Set(['escalated', 'under_review', 'needs_review']);

interface InvoiceActionsPanelProps {
  invoiceId: string;
  header: InvoiceHeaderResponse;
  bucket?: string;
}

export const InvoiceActionsPanel: React.FC<InvoiceActionsPanelProps> = ({
  invoiceId,
  header,
  bucket,
}) => {
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const isManager = role === UserRole.FINANCE_MANAGER;

  const [approveOpen, setApproveOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [ownershipConfirmOpen, setOwnershipConfirmOpen] = useState(false);

  const ownershipMutation = useTakeOwnership(invoiceId);

  const status = header.invoice_status?.toLowerCase() ?? '';
  const backHref = bucket ? `/command-center/${bucket}` : '/command-center';

  const showApprove = APPROVE_STATUSES.has(status);
  const showClarification = CLARIFICATION_STATUSES.has(status);
  const showReject = REJECT_STATUSES.has(status);
  const showEscalate = ESCALATE_STATUSES.has(status) && !isManager;
  const showOwnership = OWNERSHIP_STATUSES.has(status) && isManager;

  const hasAnyAction = showApprove || showClarification || showReject || showEscalate || showOwnership;

  if (!hasAnyAction) return null;

  const handleTakeOwnership = async () => {
    if (!userId) return;
    setOwnershipConfirmOpen(false);
    await ownershipMutation.mutateAsync({ manager_id: userId });
  };

  return (
    <div className="space-y-3">
      <div className="border-t border-[var(--color-border)] pt-4">
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
              Request Clarification
            </Button>
          )}

          {showReject && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-[var(--color-destructive)] hover:bg-[var(--color-destructive-muted)] hover:border-red-200"
              leftIcon={<XCircle className="h-4 w-4" />}
              onClick={() =>
                navigate(`/command-center/invoice/${invoiceId}/rejection`, {
                  state: { bucket },
                })
              }
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
      </div>

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

      <ConfirmDialog
        open={ownershipConfirmOpen}
        onClose={() => setOwnershipConfirmOpen(false)}
        onConfirm={handleTakeOwnership}
        loading={ownershipMutation.isPending}
        title="Take ownership?"
        description="This invoice will be assigned to you and will appear in your Claimed queue."
        confirmLabel="Take Ownership"
      />
    </div>
  );
};
