import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { extractionService } from '../services/extractionService';
import type {
  ExtractionApproveResponse,
  ExtractionReviewResponse,
  ExtractionUpdateRequest,
} from '../types/extraction.types';

export const extractionQueryKey = (invoiceId: string) =>
  ['extraction', 'review', invoiceId] as const;

export const useExtractionReview = (invoiceId: string) => {
  return useQuery<ExtractionReviewResponse>({
    queryKey: extractionQueryKey(invoiceId),
    queryFn: () => extractionService.getReview(invoiceId),
    enabled: Boolean(invoiceId),
    retry: 1,
  });
};

export const useUpdateExtraction = (invoiceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ExtractionReviewResponse, unknown, ExtractionUpdateRequest>({
    mutationFn: (payload) => extractionService.updateExtraction(invoiceId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(extractionQueryKey(invoiceId), data);
      toast.success('Changes saved successfully.');
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Failed to save changes. Please try again.');
    },
  });
};

export const useApproveExtraction = (invoiceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ExtractionApproveResponse, unknown, void>({
    mutationFn: () => extractionService.approveExtraction(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extractionQueryKey(invoiceId) });
      toast.success('Extraction approved. Validation workflow started.');
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Approval failed. Please try again.');
    },
  });
};
