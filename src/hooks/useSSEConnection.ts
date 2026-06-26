import { useState, useEffect } from 'react';
import { sseManager } from '../lib/sseManager';
import type { SSEConnectionStatus } from '../lib/sseManager';

export function useSSEConnection(): SSEConnectionStatus {
  const [status, setStatus] = useState<SSEConnectionStatus>(() =>
    sseManager.getStatus(),
  );

  useEffect(() => {
    const unsubscribe = sseManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return status;
}
