import { commandCenterClient } from '../../../lib/commandCenterClient';
import type { ChartData } from '../types/dashboardCharts.types';

export const associateChartsService = {
  getStatusDistribution: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-associate/dashboard/charts/status-distribution',
    );
    return r.data;
  },

  getValidationBreakdown: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-associate/dashboard/charts/validation-breakdown',
    );
    return r.data;
  },

  getProcessingTrend: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-associate/dashboard/charts/processing-trend',
    );
    return r.data;
  },
};

export const managerChartsService = {
  getStatusDistribution: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-manager/dashboard/charts/status-distribution',
    );
    return r.data;
  },

  getTeamPerformance: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-manager/dashboard/charts/team-performance',
    );
    return r.data;
  },

  getValidationBreakdown: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-manager/dashboard/charts/validation-breakdown',
    );
    return r.data;
  },

  getPendingWorkByVendor: async (): Promise<ChartData> => {
    const r = await commandCenterClient.get<ChartData>(
      '/finance-manager/dashboard/charts/pending-work-by-vendor',
    );
    return r.data;
  },
};
