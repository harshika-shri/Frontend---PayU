import { commandCenterClient } from '../../../lib/commandCenterClient';
import type { DashboardInvoiceListResponse, InvoiceListQueryParams } from '../../command-center/types/dashboard.types';
import type { FinanceManagerSummary, ManagerQueue } from '../types/financeManager.types';

const queuePath: Record<ManagerQueue, string> = {
  'my-claimed': '/finance-manager/invoices/my-claimed',
  'unassigned': '/finance-manager/invoices/unassigned',
  'my-escalated': '/finance-manager/invoices/my-escalated',
  'rejected': '/finance-manager/invoices/rejected',
};

export const financeManagerService = {
  getSummary: async (): Promise<FinanceManagerSummary> => {
    const r = await commandCenterClient.get<FinanceManagerSummary>(
      '/finance-manager/dashboard/summary',
    );
    return r.data;
  },

  listQueue: async (
    queue: ManagerQueue,
    params: InvoiceListQueryParams = {},
  ): Promise<DashboardInvoiceListResponse> => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ''),
    );
    const r = await commandCenterClient.get<DashboardInvoiceListResponse>(
      queuePath[queue],
      { params: clean },
    );
    return r.data;
  },
};
