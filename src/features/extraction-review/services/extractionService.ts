import { docExtractionClient } from '../../../lib/docExtractionClient';
import type {
  ExtractionApproveResponse,
  ExtractionReviewResponse,
  ExtractionUpdateRequest,
} from '../types/extraction.types';

export const extractionService = {
  getReview: async (invoiceId: string): Promise<ExtractionReviewResponse> => {
    const response = await docExtractionClient.get<ExtractionReviewResponse>(
      `/extractions/${invoiceId}/review`,
    );
    return response.data;
  },

  updateExtraction: async (
    invoiceId: string,
    payload: ExtractionUpdateRequest,
  ): Promise<ExtractionReviewResponse> => {
    const response = await docExtractionClient.put<ExtractionReviewResponse>(
      `/extractions/${invoiceId}`,
      payload,
    );
    return response.data;
  },

  approveExtraction: async (invoiceId: string): Promise<ExtractionApproveResponse> => {
    const response = await docExtractionClient.post<ExtractionApproveResponse>(
      `/extractions/${invoiceId}/approve`,
    );
    return response.data;
  },
};
