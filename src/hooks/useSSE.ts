import { useEffect } from 'react';
import { sseManager } from '../lib/sseManager';
import type { SSEEventType } from '../lib/sseManager';

/**
 * Subscribe to a specific SSE event type.
 * The callback is called whenever the event is received.
 */
export function useSSE(event: SSEEventType, callback: (data: unknown) => void) {
  useEffect(() => {
    const unsubscribe = sseManager.subscribe(event, callback);
    return unsubscribe;
  }, [event, callback]);
}
