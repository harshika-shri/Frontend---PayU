import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  AssociateReportQuery,
  FinanceAssociatePerformanceListResponse,
  InvoiceReportQuery,
  InvoiceReportListResponse,
  ReportFilterOptionsResponse,
} from '../types/report.types';

const toParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value != null && value !== ''),
  );

export const reportService = {
  getFilterOptions: async (): Promise<ReportFilterOptionsResponse> => {
    const response = await commandCenterClient.get<ReportFilterOptionsResponse>(
      '/reports/filter-options',
    );
    return response.data;
  },

  listInvoices: async (
    params: InvoiceReportQuery = {},
  ): Promise<InvoiceReportListResponse> => {
    const response = await commandCenterClient.get<InvoiceReportListResponse>(
      '/reports/invoices',
      { params: toParams(params) },
    );
    return response.data;
  },

  exportInvoices: async (params: InvoiceReportQuery = {}): Promise<Blob> => {
    const response = await commandCenterClient.get<Blob>('/reports/invoices/export', {
      params: toParams(params),
      responseType: 'blob',
    });
    return response.data;
  },

  listFinanceAssociates: async (
    params: AssociateReportQuery = {},
  ): Promise<FinanceAssociatePerformanceListResponse> => {
    const response = await commandCenterClient.get<FinanceAssociatePerformanceListResponse>(
      '/reports/finance-associates',
      { params: toParams(params) },
    );
    return response.data;
  },

  exportFinanceAssociates: async (params: AssociateReportQuery = {}): Promise<Blob> => {
    const response = await commandCenterClient.get<Blob>('/reports/finance-associates/export', {
      params: toParams(params),
      responseType: 'blob',
    });
    return response.data;
  },
};

export const downloadReportBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
