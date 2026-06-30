import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MONITORING_EMAIL } from '../constants/defaultEmail';
import { mailMonitoringService } from '../services/mailMonitoringService';
import type { RecentMailItem } from '../types/mailMonitoring.types';

interface UseRecentMailOptions {
  mailbox?: string;
  pollIntervalMs?: number;
  enablePolling?: boolean;
}

export const useRecentMail = ({
  mailbox = DEFAULT_MONITORING_EMAIL,
  pollIntervalMs = 30000,
  enablePolling = true,
}: UseRecentMailOptions = {}) => {
  const [items, setItems] = useState<RecentMailItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMail = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await mailMonitoringService.listRecentMail(mailbox);
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [mailbox]);

  useEffect(() => {
    fetchMail();

    if (!enablePolling) return;

    const intervalId = window.setInterval(() => {
      fetchMail(false);
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [fetchMail, pollIntervalMs, enablePolling]);

  return {
    items,
    total,
    isLoading,
    fetchMail,
  };
};
