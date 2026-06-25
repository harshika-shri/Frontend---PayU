import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type {
  DashboardBucket,
  DashboardInvoiceListResponse,
  InvoiceListQueryParams,
} from '../types/dashboard.types';

export const dashboardInvoicesKey = (
  bucket: DashboardBucket,
  params: InvoiceListQueryParams,
) => ['dashboard', 'invoices', bucket, params] as const;

export const useDashboardInvoices = (
  bucket: DashboardBucket,
  params: InvoiceListQueryParams = {},
) =>
  useQuery<DashboardInvoiceListResponse>({
    queryKey: dashboardInvoicesKey(bucket, params),
    queryFn: () => dashboardService.listInvoices(bucket, params),
    staleTime: 15_000,
  });
