import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useApproveInvoice } from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { InvoiceHeaderResponse } from '../types/invoiceReview.types';

interface ApproveDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  header: InvoiceHeaderResponse;
}

export const ApproveDialog: React.FC<ApproveDialogProps> = ({
  open,
  onClose,
  onSuccess,
  invoiceId,
  header,
}) => {
  const { userId } = useAuth();
  const [comments, setComments] = useState('');
  const mutation = useApproveInvoice(invoiceId);

  const handleClose = () => {
    if (mutation.isPending) return;
    setComments('');
    onClose();
  };

  const handleApprove = async () => {
    if (!userId) return;
    await mutation.mutateAsync({ approved_by: userId, comments: comments || null });
    handleClose();
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Approve Invoice"
      description="Confirm approval. This will move the invoice to the ready-to-pay queue."
      size="md"
    >
      <div className="space-y-4">
        {/* Invoice summary */}
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

        {/* Optional comments */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Comments <span className="text-[var(--color-muted-foreground)] font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add approval notes…"
            className="flex w-full resize-none rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={handleApprove}
          loading={mutation.isPending}
          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
        >
          Approve Invoice
        </Button>
      </ModalFooter>
    </Modal>
  );
};
