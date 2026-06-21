import { docExtractionClient } from '../../../lib/docExtractionClient';
import type {
  PurchaseOrderListResponse,
  PurchaseOrderUploadResponse,
} from '../types/purchaseOrder.types';

export const purchaseOrderService = {
  listPurchaseOrders: async (): Promise<PurchaseOrderListResponse> => {
    const response = await docExtractionClient.get<PurchaseOrderListResponse>(
      '/purchase-orders',
    );
    return response.data;
  },

  uploadPurchaseOrder: async (file: File): Promise<PurchaseOrderUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await docExtractionClient.post<PurchaseOrderUploadResponse>(
      '/purchase-orders/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
