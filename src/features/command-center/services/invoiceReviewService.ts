import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  InvoiceExtractionResponse,
  InvoiceHeaderResponse,
  InvoiceReviewResponse,
  InvoiceValidationResponse,
  LineAllocationCandidateResponse,
  POCandidateResponse,
} from '../types/invoiceReview.types';

export const invoiceReviewService = {
  getReview: async (invoiceId: string): Promise<InvoiceReviewResponse> => {
    const response = await commandCenterClient.get<InvoiceReviewResponse>(
      `/invoices/${invoiceId}/review`,
    );
    return response.data;
  },

  getHeader: async (invoiceId: string): Promise<InvoiceHeaderResponse> => {
    const response = await commandCenterClient.get<InvoiceHeaderResponse>(
      `/invoices/${invoiceId}/header`,
    );
    return response.data;
  },

  getExtraction: async (invoiceId: string): Promise<InvoiceExtractionResponse> => {
    const response = await commandCenterClient.get<InvoiceExtractionResponse>(
      `/invoices/${invoiceId}/extraction`,
    );
    return response.data;
  },

  getValidation: async (invoiceId: string): Promise<InvoiceValidationResponse> => {
    const response = await commandCenterClient.get<InvoiceValidationResponse>(
      `/invoices/${invoiceId}/validation`,
    );
    return response.data;
  },

  getPOCandidates: async (invoiceId: string): Promise<POCandidateResponse> => {
    const response = await commandCenterClient.get<POCandidateResponse>(
      `/invoices/${invoiceId}/po-candidates`,
    );
    return response.data;
  },

  getLineAllocationCandidates: async (
    invoiceId: string,
  ): Promise<LineAllocationCandidateResponse> => {
    const response = await commandCenterClient.get<LineAllocationCandidateResponse>(
      `/invoices/${invoiceId}/line-allocation-candidates`,
    );
    return response.data;
  },
};
