import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${destructive ? 'bg-[var(--color-destructive-muted)]' : 'bg-[var(--color-warning-muted)]'}`}>
        <AlertTriangle className={`h-5 w-5 ${destructive ? 'text-[var(--color-destructive)]' : 'text-[var(--color-warning)]'}`} />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--color-foreground)]">{title}</p>
        {description && (
          <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
        )}
      </div>
    </div>
    <ModalFooter className="justify-center">
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={destructive ? 'destructive' : 'default'}
        size="sm"
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </ModalFooter>
  </Modal>
);
