import { useQuery } from '@tanstack/react-query';
import { invoiceReviewService } from '../services/invoiceReviewService';
import type { InvoiceReviewResponse } from '../types/invoiceReview.types';

export const invoiceReviewKey = (invoiceId: string) =>
  ['invoice-review', invoiceId] as const;

export const useInvoiceReview = (invoiceId: string) =>
  useQuery<InvoiceReviewResponse>({
    queryKey: invoiceReviewKey(invoiceId),
    queryFn: () => invoiceReviewService.getReview(invoiceId),
    enabled: Boolean(invoiceId),
    retry: 1,
    staleTime: 30_000,
  });
