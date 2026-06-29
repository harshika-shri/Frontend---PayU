import { docExtractionClient } from '../../../lib/docExtractionClient';
import type {
  PurchaseOrderDetailResponse,
  PurchaseOrderListResponse,
  PurchaseOrderUploadResponse,
} from '../types/purchaseOrder.types';

export const purchaseOrderService = {
  listPurchaseOrders: async (
    limit = 20,
    offset = 0,
  ): Promise<PurchaseOrderListResponse> => {
    const response = await docExtractionClient.get<PurchaseOrderListResponse>(
      '/purchase-orders',
      { params: { limit, offset } },
    );
    return response.data;
  },

  getPurchaseOrder: async (poId: string): Promise<PurchaseOrderDetailResponse> => {
    const response = await docExtractionClient.get<PurchaseOrderDetailResponse>(
      `/purchase-orders/${poId}`,
    );
    return response.data;
  },

  uploadPurchaseOrder: async (
    file: File,
    onProgress?: (pct: number) => void,
    signal?: AbortSignal,
  ): Promise<PurchaseOrderUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await docExtractionClient.post<PurchaseOrderUploadResponse>(
      '/purchase-orders/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      },
    );
    return response.data;
  },
};
