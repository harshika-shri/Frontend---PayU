import React, { useState } from 'react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { Spinner } from '../../../components/ui/Spinner';
import { useUploadPurchaseOrder } from '../hooks/usePurchaseOrders';

interface POUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const POUploadModal: React.FC<POUploadModalProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const { upload, cancel, isPending } = useUploadPurchaseOrder();

  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    onClose();
  };

  const handleCancel = () => {
    if (isPending) {
      cancel();
      return;
    }
    handleClose();
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

        {isPending && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner size="md" />
            <p className="text-sm text-[var(--color-muted-foreground)] text-center">
              Classifying document and extracting purchase order data…
            </p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          {isPending ? 'Cancel processing' : 'Cancel'}
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
