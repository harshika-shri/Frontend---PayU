import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import type { InvoiceProcessingListResponse } from '../types/invoice.types';

export const PROCESSING_QUERY_KEY = ['invoices', 'processing'] as const;

export const useProcessingInvoices = (page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;

  return useQuery<InvoiceProcessingListResponse>({
    queryKey: [...PROCESSING_QUERY_KEY, page, pageSize],
    queryFn: () => invoiceService.listProcessingInvoices(pageSize, offset),
    refetchInterval: 5000,
    staleTime: 0,
  });
};
