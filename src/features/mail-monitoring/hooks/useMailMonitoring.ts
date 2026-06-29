import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DEFAULT_MONITORING_EMAIL } from '../constants/defaultEmail';
import { mailMonitoringService } from '../services/mailMonitoringService';
import type { MonitoringStatusResponse } from '../types/mailMonitoring.types';

export const useMailMonitoring = (emailAddress = DEFAULT_MONITORING_EMAIL) => {
  const [status, setStatus] = useState<MonitoringStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mailMonitoringService.getStatus(emailAddress);
      setStatus(data);
    } catch {
      setStatus({
        email_address: emailAddress,
        is_monitoring: false,
        last_processed_history_id: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [emailAddress]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startMonitoring = async () => {
    setIsToggling(true);
    try {
      await mailMonitoringService.startMonitoring(emailAddress);
      toast.success(
        'Mail monitoring started. Catching up on emails received while stopped.',
      );
      await fetchStatus();
    } catch {
      toast.error('Failed to start mail monitoring');
    } finally {
      setIsToggling(false);
    }
  };

  const stopMonitoring = async () => {
    setIsToggling(true);
    try {
      await mailMonitoringService.stopMonitoring(emailAddress);
      toast.success('Mail monitoring stopped. New emails will not be processed.');
      await fetchStatus();
    } catch {
      toast.error('Failed to stop mail monitoring');
    } finally {
      setIsToggling(false);
    }
  };

  return {
    status,
    isLoading,
    isToggling,
    fetchStatus,
    startMonitoring,
    stopMonitoring,
  };
};
