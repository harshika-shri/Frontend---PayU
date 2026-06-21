import { useCallback, useEffect, useState } from 'react';
import { mailMonitoringService } from '../services/mailMonitoringService';
import type { InvoiceProcessingItem } from '../types/mailMonitoring.types';

interface UseProcessingInvoicesOptions {
  pollIntervalMs?: number;
  enablePolling?: boolean;
}

export const useProcessingInvoices = ({
  pollIntervalMs = 30000,
  enablePolling = true,
}: UseProcessingInvoicesOptions = {}) => {
  const [invoices, setInvoices] = useState<InvoiceProcessingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await mailMonitoringService.listProcessingInvoices();
      setInvoices(data.items);
      setTotal(data.total);
    } catch {
      setInvoices([]);
      setTotal(0);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();

    if (!enablePolling) return;

    const intervalId = window.setInterval(() => {
      fetchInvoices(false);
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [fetchInvoices, pollIntervalMs, enablePolling]);

  return {
    invoices,
    total,
    isLoading,
    fetchInvoices,
  };
};
