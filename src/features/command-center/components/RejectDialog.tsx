import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useRejectInvoice } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { InvoiceHeaderResponse } from '../types/invoiceReview.types';

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  header: InvoiceHeaderResponse;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  open,
  onClose,
  onSuccess,
  invoiceId,
  header,
}) => {
  const { userId } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const mutation = useRejectInvoice(invoiceId);

  const handleClose = () => {
    if (mutation.isPending) return;
    setRejectionReason('');
    onClose();
  };

  const handleReject = async () => {
    if (!userId) return;
    const reason = rejectionReason.trim();
    if (!reason) return;

    await mutation.mutateAsync({
      rejected_by: userId,
      rejection_reason: reason,
    });
    handleClose();
    onSuccess();
  };

  const canSubmit = rejectionReason.trim().length > 0 && !mutation.isPending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reject Invoice"
      description="This will mark the invoice as rejected. Validation history will be preserved."
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Invoice</span>
            <span className="font-medium">{header.invoice_number || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Vendor</span>
            <span className="font-medium">{header.vendor?.vendor_name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Invoice Date</span>
            <span className="font-medium">{formatDate(header.invoice_date)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-[var(--color-border)] pt-2 mt-2">
            <span className="text-[var(--color-muted-foreground)]">Total Amount</span>
            <span className="font-semibold text-[var(--color-foreground)]">
              {header.total_amount != null ? formatCurrency(header.total_amount, 'INR') : '—'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Rejection Reason <span className="text-[var(--color-destructive)]">*</span>
          </label>
          <textarea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this invoice is being rejected…"
            className="flex w-full resize-none rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          loading={mutation.isPending}
          disabled={!canSubmit}
          className="text-[var(--color-destructive)] hover:bg-red-50 hover:border-red-200"
          leftIcon={<XCircle className="h-3.5 w-3.5" />}
        >
          Reject Invoice
        </Button>
      </ModalFooter>
    </Modal>
  );
};
