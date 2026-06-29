import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';

export const useReportFilterOptions = () =>
  useQuery({
    queryKey: ['reports', 'filter-options'],
    queryFn: () => reportService.getFilterOptions(),
    staleTime: 300_000,
  });
