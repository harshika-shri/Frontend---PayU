import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { Spinner } from '../../../components/ui/Spinner';
import { useUploadPurchaseOrder } from '../hooks/usePurchaseOrders';
import type { PurchaseOrderUploadResponse } from '../types/purchaseOrder.types';

interface POUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const POUploadModal: React.FC<POUploadModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PurchaseOrderUploadResponse | null>(null);
  const { upload, cancel, isPending, uploadProgress } = useUploadPurchaseOrder();

  const resetState = () => {
    setFile(null);
    setResult(null);
  };

  const handleClose = () => {
    if (isPending) return;
    resetState();
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
    if (!file || isPending) return;
    const selectedFile = file;
    setFile(null);
    setResult(null);

    try {
      const uploadResult = await upload(selectedFile);
      setResult(uploadResult);
    } catch {
      setFile(selectedFile);
    }
  };

  const handleUploadAnother = () => {
    resetState();
  };

  const handleViewPo = () => {
    if (!result) return;
    handleClose();
    navigate(`/purchase-orders/${result.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Purchase Order"
      description={
        result
          ? 'Purchase order extracted and saved.'
          : 'Upload a PDF or image file. Vendor and line item data will be extracted automatically.'
      }
      size="md"
    >
      {result ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-success)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">
              Extraction complete
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              PO {result.po_number} uploaded — {result.line_items_saved} line items saved
            </p>
          </div>
          <ModalFooter className="w-full justify-center border-0 pt-2">
            <Button variant="outline" size="sm" onClick={handleUploadAnother}>
              Upload another
            </Button>
            <Button
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleViewPo}
            >
              View PO
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <>
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
                  Uploading, classifying, and extracting purchase order data…
                </p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Upload progress: {uploadProgress}%
                  </p>
                )}
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
        </>
      )}
    </Modal>
  );
};
