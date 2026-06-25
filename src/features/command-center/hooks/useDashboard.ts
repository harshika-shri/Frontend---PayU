import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { DashboardSummary } from '../types/dashboard.types';

export const DASHBOARD_SUMMARY_KEY = ['dashboard', 'summary'] as const;

export const useDashboardSummary = () =>
  useQuery<DashboardSummary>({
    queryKey: DASHBOARD_SUMMARY_KEY,
    queryFn: () => dashboardService.getSummary(),
    staleTime: 30_000,
  });
