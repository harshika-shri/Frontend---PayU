import { docExtractionClient } from '../../../lib/docExtractionClient';
import type {
  InvoiceProcessingListResponse,
  InvoiceUploadResponse,
} from '../types/invoice.types';

export const invoiceService = {
  uploadInvoice: async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<InvoiceUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await docExtractionClient.post<InvoiceUploadResponse>(
      '/invoices/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      },
    );
    return response.data;
  },

  listProcessingInvoices: async (
    limit = 20,
    offset = 0,
  ): Promise<InvoiceProcessingListResponse> => {
    const response = await docExtractionClient.get<InvoiceProcessingListResponse>(
      '/invoices/processing',
      { params: { limit, offset } },
    );
    return response.data;
  },
};
