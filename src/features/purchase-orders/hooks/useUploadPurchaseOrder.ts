import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderUploadResponse } from '../types/purchaseOrder.types';

export const useUploadPurchaseOrder = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPurchaseOrder = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const result = await purchaseOrderService.uploadPurchaseOrder(file);
      toast.success(`PO ${result.po_number} uploaded successfully`);
      return result;
    } catch {
      toast.error('Failed to upload purchase order');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadPurchaseOrder,
  };
};

export type { PurchaseOrderUploadResponse };
