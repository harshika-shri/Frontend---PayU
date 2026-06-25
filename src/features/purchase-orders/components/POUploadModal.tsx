import React, { useState } from 'react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { useUploadPurchaseOrder } from '../hooks/usePurchaseOrders';

interface POUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const POUploadModal: React.FC<POUploadModalProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const { upload, isPending, uploadProgress } = useUploadPurchaseOrder();

  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      await upload(file);
      handleClose();
    } catch {
      // error handled in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Purchase Order"
      description="Upload a PDF or image file. Vendor and line item data will be extracted automatically."
      size="md"
    >
      <div className="space-y-4">
        <FileDropzone
          onFile={setFile}
          disabled={isPending}
          accept={['.pdf', '.png', '.jpg', '.jpeg', '.tiff']}
        />

        {isPending && uploadProgress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
              <span>Uploading & extracting…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-muted)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {isPending && uploadProgress === 0 && (
          <p className="text-xs text-[var(--color-muted-foreground)] text-center">
            Extracting data from document. This may take a few seconds…
          </p>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!file}
          loading={isPending}
        >
          Upload & Extract
        </Button>
      </ModalFooter>
    </Modal>
  );
};
