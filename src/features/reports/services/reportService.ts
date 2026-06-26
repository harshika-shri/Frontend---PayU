import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  AssociateWorkloadItem,
  ManagerWorkloadItem,
  ReportFilters,
  ReportPerformanceResponse,
  ReportSummaryResponse,
  VendorSummaryItem,
} from '../types/report.types';

const toParams = (f: ReportFilters) =>
  Object.fromEntries(Object.entries(f).filter(([, v]) => v != null && v !== ''));

export const reportService = {
  getSummary: async (filters: ReportFilters = {}): Promise<ReportSummaryResponse> => {
    const r = await commandCenterClient.get<ReportSummaryResponse>('/reports/summary', {
      params: toParams(filters),
    });
    return r.data;
  },

  getPerformance: async (filters: ReportFilters = {}): Promise<ReportPerformanceResponse> => {
    const r = await commandCenterClient.get<ReportPerformanceResponse>('/reports/performance', {
      params: toParams(filters),
    });
    return r.data;
  },

  getVendors: async (filters: ReportFilters = {}): Promise<VendorSummaryItem[]> => {
    const r = await commandCenterClient.get<VendorSummaryItem[]>('/reports/vendors', {
      params: toParams(filters),
    });
    return r.data;
  },

  getAssociates: async (filters: ReportFilters = {}): Promise<AssociateWorkloadItem[]> => {
    const r = await commandCenterClient.get<AssociateWorkloadItem[]>('/reports/associates', {
      params: toParams(filters),
    });
    return r.data;
  },

  getManagers: async (filters: ReportFilters = {}): Promise<ManagerWorkloadItem[]> => {
    const r = await commandCenterClient.get<ManagerWorkloadItem[]>('/reports/managers', {
      params: toParams(filters),
    });
    return r.data;
  },
};
