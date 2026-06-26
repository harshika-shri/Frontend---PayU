import { fetchEventSource } from '@microsoft/fetch-event-source';
import Cookies from 'js-cookie';
import { env } from '../config/env';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export type SSEEventType =
  | 'heartbeat'
  | 'notification'
  | 'invoice_status_changed'
  | 'dashboard_updated'
  | 'processing_updated'
  | string;

type SSEListener = (data: unknown) => void;
type StatusListener = (status: SSEConnectionStatus) => void;

class SSEManager {
  private controller: AbortController | null = null;
  private listeners = new Map<string, Set<SSEListener>>();
  private statusListeners = new Set<StatusListener>();
  private status: SSEConnectionStatus = 'disconnected';
  private retryCount = 0;
  private maxRetryDelay = 30_000;
  private active = false;

  private setStatus(s: SSEConnectionStatus) {
    this.status = s;
    this.statusListeners.forEach((cb) => cb(s));
  }

  getStatus(): SSEConnectionStatus {
    return this.status;
  }

  subscribe(event: SSEEventType, listener: SSEListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
    // Also broadcast to wildcard subscribers
    this.listeners.get('*')?.forEach((cb) => cb({ event, data }));
  }

  private retryDelay(): number {
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), this.maxRetryDelay);
    this.retryCount++;
    return delay;
  }

  async connect() {
    if (this.active) return;
    this.active = true;
    this.setStatus('connecting');

    const token = Cookies.get('access_token');
    if (!token) {
      this.setStatus('disconnected');
      this.active = false;
      return;
    }

    this.controller = new AbortController();

    try {
      await fetchEventSource(`${env.commandCenterUrl}/events/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: this.controller.signal,

        onopen: async (response) => {
          if (response.ok) {
            this.retryCount = 0;
            this.setStatus('connected');
          } else {
            this.setStatus('error');
            throw new Error(`SSE open failed: ${response.status}`);
          }
        },

        onmessage: (event) => {
          if (event.event === 'heartbeat') return;
          try {
            const data = event.data ? JSON.parse(event.data) : null;
            this.emit(event.event || 'message', data);
          } catch {
            // ignore malformed events
          }
        },

        onclose: () => {
          if (this.active) {
            this.setStatus('disconnected');
            const delay = this.retryDelay();
            setTimeout(() => {
              if (this.active) this.reconnect();
            }, delay);
          }
        },

        onerror: (err) => {
          this.setStatus('error');
          // let fetchEventSource retry naturally
          if (!this.active) throw err;
        },

        // Prevent auto-retry from fetchEventSource itself — we manage our own
        openWhenHidden: true,
      });
    } catch {
      if (this.active) {
        this.setStatus('disconnected');
        const delay = this.retryDelay();
        setTimeout(() => {
          if (this.active) this.reconnect();
        }, delay);
      }
    }
  }

  private async reconnect() {
    this.active = false;
    await this.connect();
  }

  disconnect() {
    this.active = false;
    this.controller?.abort();
    this.controller = null;
    this.setStatus('disconnected');
  }
}

// Singleton
export const sseManager = new SSEManager();
