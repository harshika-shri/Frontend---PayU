import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import type {
  AssociateWorkloadItem,
  ManagerWorkloadItem,
  ReportFilters,
  ReportPerformanceResponse,
  ReportSummaryResponse,
  VendorSummaryItem,
} from '../types/report.types';

const STALE = 120_000; // 2 min

export const useReportSummary = (filters: ReportFilters = {}) =>
  useQuery<ReportSummaryResponse>({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportService.getSummary(filters),
    staleTime: STALE,
  });

export const useReportPerformance = (filters: ReportFilters = {}) =>
  useQuery<ReportPerformanceResponse>({
    queryKey: ['reports', 'performance', filters],
    queryFn: () => reportService.getPerformance(filters),
    staleTime: STALE,
  });

export const useReportVendors = (filters: ReportFilters = {}) =>
  useQuery<VendorSummaryItem[]>({
    queryKey: ['reports', 'vendors', filters],
    queryFn: () => reportService.getVendors(filters),
    staleTime: STALE,
  });

export const useReportAssociates = (filters: ReportFilters = {}) =>
  useQuery<AssociateWorkloadItem[]>({
    queryKey: ['reports', 'associates', filters],
    queryFn: () => reportService.getAssociates(filters),
    staleTime: STALE,
  });

export const useReportManagers = (filters: ReportFilters = {}) =>
  useQuery<ManagerWorkloadItem[]>({
    queryKey: ['reports', 'managers', filters],
    queryFn: () => reportService.getManagers(filters),
    staleTime: STALE,
  });
