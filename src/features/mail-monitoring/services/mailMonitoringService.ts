import { docExtractionClient } from '../../../lib/docExtractionClient';
import type {
  InvoiceProcessingListResponse,
  MonitoringStatusResponse,
} from '../types/mailMonitoring.types';

export const mailMonitoringService = {
  getStatus: async (emailAddress: string): Promise<MonitoringStatusResponse> => {
    const response = await docExtractionClient.get<MonitoringStatusResponse>(
      '/gmail-monitoring/status',
      { params: { email_address: emailAddress } },
    );
    return response.data;
  },

  startMonitoring: async (emailAddress: string): Promise<{ message: string }> => {
    const response = await docExtractionClient.post<{ message: string }>(
      '/gmail-monitoring/start',
      { email_address: emailAddress },
    );
    return response.data;
  },

  stopMonitoring: async (emailAddress: string): Promise<{ message: string }> => {
    const response = await docExtractionClient.post<{ message: string }>(
      '/gmail-monitoring/stop',
      { email_address: emailAddress },
    );
    return response.data;
  },

  listProcessingInvoices: async (): Promise<InvoiceProcessingListResponse> => {
    const response = await docExtractionClient.get<InvoiceProcessingListResponse>(
      '/invoices/processing',
    );
    return response.data;
  },
};
