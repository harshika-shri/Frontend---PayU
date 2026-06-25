import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  DashboardBucket,
  DashboardInvoiceListResponse,
  DashboardSummary,
  InvoiceListQueryParams,
} from '../types/dashboard.types';

const bucketPath: Record<DashboardBucket, string> = {
  'ready-for-approval': '/dashboard/invoices/ready-for-approval',
  'needs-review': '/dashboard/invoices/needs-review',
  'escalated': '/dashboard/invoices/escalated',
  'ready-to-pay': '/dashboard/invoices/ready-to-pay',
  'rejected': '/dashboard/invoices/rejected',
};

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await commandCenterClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  listInvoices: async (
    bucket: DashboardBucket,
    params: InvoiceListQueryParams = {},
  ): Promise<DashboardInvoiceListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ''),
    );
    const response = await commandCenterClient.get<DashboardInvoiceListResponse>(
      bucketPath[bucket],
      { params: cleanParams },
    );
    return response.data;
  },
};
