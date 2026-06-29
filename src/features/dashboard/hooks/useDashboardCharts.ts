import { useQuery } from '@tanstack/react-query';
import {
  associateChartsService,
  managerChartsService,
} from '../services/dashboardChartsService';

const ASSOCIATE_CHARTS_KEY = ['dashboard', 'associate', 'charts'] as const;
const MANAGER_CHARTS_KEY = ['dashboard', 'manager', 'charts'] as const;

export const useAssociateStatusDistribution = () =>
  useQuery({
    queryKey: [...ASSOCIATE_CHARTS_KEY, 'status-distribution'],
    queryFn: associateChartsService.getStatusDistribution,
    staleTime: 60_000,
  });

export const useAssociateValidationBreakdown = () =>
  useQuery({
    queryKey: [...ASSOCIATE_CHARTS_KEY, 'validation-breakdown'],
    queryFn: associateChartsService.getValidationBreakdown,
    staleTime: 60_000,
  });

export const useAssociateProcessingTrend = () =>
  useQuery({
    queryKey: [...ASSOCIATE_CHARTS_KEY, 'processing-trend'],
    queryFn: associateChartsService.getProcessingTrend,
    staleTime: 60_000,
  });

export const useManagerStatusDistribution = () =>
  useQuery({
    queryKey: [...MANAGER_CHARTS_KEY, 'status-distribution'],
    queryFn: managerChartsService.getStatusDistribution,
    staleTime: 60_000,
  });

export const useManagerTeamPerformance = () =>
  useQuery({
    queryKey: [...MANAGER_CHARTS_KEY, 'team-performance'],
    queryFn: managerChartsService.getTeamPerformance,
    staleTime: 60_000,
  });

export const useManagerValidationBreakdown = () =>
  useQuery({
    queryKey: [...MANAGER_CHARTS_KEY, 'validation-breakdown'],
    queryFn: managerChartsService.getValidationBreakdown,
    staleTime: 60_000,
  });

export const useManagerPendingWorkByVendor = () =>
  useQuery({
    queryKey: [...MANAGER_CHARTS_KEY, 'pending-work-by-vendor'],
    queryFn: managerChartsService.getPendingWorkByVendor,
    staleTime: 60_000,
  });
