import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderListResponse } from '../types/purchaseOrder.types';

export const PO_QUERY_KEY = ['purchase-orders'] as const;

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
    mutationFn: (file: File) =>
      purchaseOrderService.uploadPurchaseOrder(file, setUploadProgress),
    onSuccess: (data) => {
      toast.success(`PO ${data.po_number} uploaded — ${data.line_items_saved} line items saved`);
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEY });
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Upload failed. Please check the file and try again.');
    },
    onSettled: () => setUploadProgress(0),
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    uploadProgress,
  };
};
