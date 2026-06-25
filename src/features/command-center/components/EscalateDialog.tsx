import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useEscalateInvoice } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';

const ESCALATION_REASONS = [
  'Requires manager decision',
  'Policy exception needed',
  'Discrepancy exceeds threshold',
  'Vendor dispute',
  'Missing documentation',
  'Duplicate invoice suspected',
  'Other',
];

interface EscalateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  invoiceNumber?: string | null;
}

export const EscalateDialog: React.FC<EscalateDialogProps> = ({
  open,
  onClose,
  onSuccess,
  invoiceId,
  invoiceNumber,
}) => {
  const { userId } = useAuth();
  const [reason, setReason] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managerIdError, setManagerIdError] = useState('');
  const mutation = useEscalateInvoice(invoiceId);

  const isValidUuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const handleClose = () => {
    if (mutation.isPending) return;
    setReason('');
    setManagerId('');
    setManagerIdError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!isValidUuid(managerId)) {
      setManagerIdError('Enter a valid Manager ID (UUID format).');
      return;
    }
    if (!reason) return;
    await mutation.mutateAsync({
      escalated_by: userId,
      manager_id: managerId,
      reason,
    });
    handleClose();
    onSuccess();
  };

  const canSubmit = reason.trim().length > 0 && managerId.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Escalate Invoice"
      description={`Escalate ${invoiceNumber ? `invoice ${invoiceNumber}` : 'this invoice'} to a Finance Manager.`}
      size="md"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
            Reason
          </label>
          <div className="flex flex-wrap gap-2">
            {ESCALATION_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  reason === r
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-foreground)] border-[var(--color-border)] hover:border-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === 'Other' && (
            <input
              type="text"
              placeholder="Describe the reason…"
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 flex h-9 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
            Manager ID
          </label>
          <input
            type="text"
            value={managerId}
            onChange={(e) => {
              setManagerId(e.target.value);
              setManagerIdError('');
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className={`flex h-9 w-full rounded border bg-white px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
              managerIdError ? 'border-[var(--color-destructive)]' : 'border-[var(--color-border)]'
            }`}
          />
          {managerIdError && (
            <p className="text-xs text-[var(--color-destructive)]">{managerIdError}</p>
          )}
          <p className="text-xs text-[var(--color-muted-foreground)]">
            The UUID of the Finance Manager to escalate to.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          loading={mutation.isPending}
          disabled={!canSubmit}
          leftIcon={<TrendingUp className="h-3.5 w-3.5" />}
        >
          Escalate Invoice
        </Button>
      </ModalFooter>
    </Modal>
  );
};
