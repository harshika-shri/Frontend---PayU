import React, { useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useEscalateInvoice, useListManagers } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { cn } from '../../../utils/cn';

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
  const [customReason, setCustomReason] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);

  const mutation = useEscalateInvoice(invoiceId);
  const { data: managers = [], isLoading: loadingManagers } = useListManagers();

  const selectedManager = managers.find((m) => m.id === managerId);
  const effectiveReason = reason === 'Other' ? customReason.trim() : reason;

  const handleClose = () => {
    if (mutation.isPending) return;
    setReason('');
    setCustomReason('');
    setManagerId('');
    setManagerOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!userId || !managerId || !effectiveReason) return;
    await mutation.mutateAsync({
      escalated_by: userId,
      manager_id: managerId,
      reason: effectiveReason,
    });
    handleClose();
    onSuccess();
  };

  const canSubmit =
    effectiveReason.length > 0 && managerId.length > 0 && !mutation.isPending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Escalate Invoice"
      description={`Escalate ${invoiceNumber ? `invoice ${invoiceNumber}` : 'this invoice'} to a Finance Manager.`}
      size="md"
    >
      <div className="space-y-5">
        {/* Reason chips */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
            Reason
          </label>
          <div className="flex flex-wrap gap-2">
            {ESCALATION_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  reason === r
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-foreground)] border-[var(--color-border)] hover:border-slate-400',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === 'Other' && (
            <input
              type="text"
              value={customReason}
              placeholder="Describe the reason…"
              onChange={(e) => setCustomReason(e.target.value)}
              className="mt-2 flex h-9 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          )}
        </div>

        {/* Manager picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
            Assign to Manager
          </label>

          {loadingManagers ? (
            <Skeleton className="h-9 w-full rounded" />
          ) : managers.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] py-2">
              No Finance Managers found in the system.
            </p>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setManagerOpen((o) => !o)}
                className={cn(
                  'flex w-full items-center justify-between h-9 rounded border bg-white px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]',
                  managerId
                    ? 'border-[var(--color-border)] text-[var(--color-foreground)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]',
                )}
              >
                <span>
                  {selectedManager
                    ? `${selectedManager.name} (${selectedManager.email})`
                    : 'Select a manager…'}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
              </button>

              {managerOpen && (
                <div className="absolute z-50 mt-1 w-full rounded border border-[var(--color-border)] bg-white shadow-lg">
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {managers.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors',
                            managerId === m.id && 'bg-[var(--color-primary-muted)] font-medium',
                          )}
                          onClick={() => {
                            setManagerId(m.id);
                            setManagerOpen(false);
                          }}
                        >
                          <span className="font-medium text-[var(--color-foreground)]">
                            {m.name}
                          </span>
                          <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                            {m.email}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
