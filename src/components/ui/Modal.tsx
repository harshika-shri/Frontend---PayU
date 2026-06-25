import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}) => (
  <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full rounded-xl bg-white shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          sizeMap[size],
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
            <div>
              {title && (
                <Dialog.Title className="text-base font-semibold text-[var(--color-foreground)]">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1 text-[var(--color-muted-foreground)]">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div className={cn('flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[var(--color-border)]', className)}>
    {children}
  </div>
);
