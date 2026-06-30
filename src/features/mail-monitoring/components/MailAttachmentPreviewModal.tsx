import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { DocumentViewer } from '../../extraction-review/components/DocumentViewer';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { mailMonitoringService } from '../services/mailMonitoringService';
import type { RecentMailItem } from '../types/mailMonitoring.types';

interface MailAttachmentPreviewModalProps {
  item: RecentMailItem | null;
  onClose: () => void;
}

export const MailAttachmentPreviewModal: React.FC<MailAttachmentPreviewModalProps> = ({
  item,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!item?.attachment_filename) {
      setBlobUrl(undefined);
      setFileType(null);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setIsLoading(true);
      try {
        const preview = await mailMonitoringService.fetchAttachmentPreview(item);

        if (cancelled) {
          URL.revokeObjectURL(preview.blobUrl);
          return;
        }

        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        blobUrlRef.current = preview.blobUrl;
        setBlobUrl(preview.blobUrl);
        setFileType(preview.fileType);
      } catch {
        if (!cancelled) {
          toast.error('Unable to open attachment.');
          onClose();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [item, onClose]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(undefined);
    setFileType(null);
    onClose();
  };

  return (
    <Modal
      open={item !== null}
      onClose={handleClose}
      title={item?.attachment_filename ?? 'Attachment'}
      description={item?.subject ?? undefined}
      size="xl"
      className="max-w-5xl"
    >
      {isLoading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <DocumentViewer
          fileUrl={blobUrl}
          fileType={fileType}
          fitContainer
          className="h-[70vh]"
        />
      )}
    </Modal>
  );
};
