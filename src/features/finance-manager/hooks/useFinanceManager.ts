import { useQuery } from '@tanstack/react-query';
import { financeManagerService } from '../services/financeManagerService';
import type { DashboardInvoiceListResponse, InvoiceListQueryParams } from '../../command-center/types/dashboard.types';
import type { FinanceManagerSummary, ManagerQueue } from '../types/financeManager.types';

export const FM_SUMMARY_KEY = ['finance-manager', 'summary'] as const;

export const useFinanceManagerSummary = () =>
  useQuery<FinanceManagerSummary>({
    queryKey: FM_SUMMARY_KEY,
    queryFn: () => financeManagerService.getSummary(),
    staleTime: 30_000,
  });

export const fmQueueKey = (queue: ManagerQueue, params: InvoiceListQueryParams) =>
  ['finance-manager', 'queue', queue, params] as const;

export const useManagerQueue = (queue: ManagerQueue, params: InvoiceListQueryParams = {}) =>
  useQuery<DashboardInvoiceListResponse>({
    queryKey: fmQueueKey(queue, params),
    queryFn: () => financeManagerService.listQueue(queue, params),
    staleTime: 15_000,
  });
