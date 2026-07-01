import { useQuery, useMutation, useQueryClient, useMutationState } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  beginPoUploadAbort,
  cancelPoUploadAbort,
  clearPoUploadAbort,
} from '../../../lib/uploadAbortRegistry';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderListResponse } from '../types/purchaseOrder.types';

export const PO_QUERY_KEY = ['purchase-orders'] as const;
export const PO_UPLOAD_MUTATION_KEY = ['purchase-order', 'upload'] as const;

export const usePurchaseOrders = (page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;

  return useQuery<PurchaseOrderListResponse>({
    queryKey: [...PO_QUERY_KEY, page, pageSize],
    queryFn: () => purchaseOrderService.listPurchaseOrders(pageSize, offset),
  });
};

export const useUploadPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationKey: PO_UPLOAD_MUTATION_KEY,
    mutationFn: (file: File) =>
      purchaseOrderService.uploadPurchaseOrder(
        file,
        setUploadProgress,
        beginPoUploadAbort(),
      ),
    onMutate: () => {
      toast.loading('Processing purchase order upload…', { id: 'po-upload' });
    },
    onSuccess: (data) => {
      toast.dismiss('po-upload');
      toast.success(
        `PO ${data.po_number} uploaded — ${data.line_items_saved} line items saved`,
      );
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEY });
    },
    onError: (err: unknown) => {
      toast.dismiss('po-upload');

      if ((err as { code?: string })?.code === 'ERR_CANCELED') {
        toast('Upload cancelled.');
        return;
      }

      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail;
      toast.error(detail || 'Upload failed. Please check the file and try again.');
    },
    onSettled: () => {
      setUploadProgress(0);
      clearPoUploadAbort();
    },
  });

  const trackedMutations = useMutationState({
    filters: { mutationKey: PO_UPLOAD_MUTATION_KEY },
  });
  const latestMutation = trackedMutations[trackedMutations.length - 1];

  const isPending =
    latestMutation?.status === 'pending' || mutation.isPending;

  const cancel = () => {
    cancelPoUploadAbort();
    toast.dismiss('po-upload');
  };

  return {
    upload: mutation.mutateAsync,
    cancel,
    isPending,
    uploadProgress,
  };
};
