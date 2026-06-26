import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import React from 'react';
import { notificationService } from '../services/notificationService';
import { useSSE } from '../../../hooks/useSSE';
import type { NotificationListResponse } from '../types/notification.types';

export const NOTIFICATION_LIST_KEY = ['notifications', 'list'] as const;
export const NOTIFICATION_COUNT_KEY = ['notifications', 'unread-count'] as const;

export const useNotifications = (page = 1) =>
  useQuery<NotificationListResponse>({
    queryKey: [...NOTIFICATION_LIST_KEY, page],
    queryFn: () => notificationService.list(page, 30),
    staleTime: 60_000,
  });

export const useNotificationUnreadCount = () =>
  useQuery<{ count: number }>({
    queryKey: NOTIFICATION_COUNT_KEY,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
      qc.invalidateQueries({ queryKey: NOTIFICATION_COUNT_KEY });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
      qc.invalidateQueries({ queryKey: NOTIFICATION_COUNT_KEY });
    },
  });
};

// Hook that listens for SSE notification events and refreshes data
export const useNotificationSSE = () => {
  const qc = useQueryClient();

  const handleNewNotification = useCallback(
    (data: unknown) => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
      qc.invalidateQueries({ queryKey: NOTIFICATION_COUNT_KEY });

      const notif = data as { title?: string; message?: string } | null;
      if (notif?.title) {
        toast(
          React.createElement(
            'div',
            { className: 'flex items-start gap-2' },
            React.createElement(Bell, { className: 'h-4 w-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5' }),
            React.createElement(
              'div',
              null,
              React.createElement('p', { className: 'text-xs font-semibold' }, notif.title),
              notif.message &&
                React.createElement(
                  'p',
                  { className: 'text-xs text-[var(--color-muted-foreground)] mt-0.5' },
                  String(notif.message).slice(0, 80),
                ),
            ),
          ),
          { duration: 5000 },
        );
      }
    },
    [qc],
  );

  useSSE('notification', handleNewNotification);
  useSSE('new_notification', handleNewNotification);
};

// Hook that listens for SSE invoice/dashboard updates and refreshes queries
export const useRealtimeUpdates = () => {
  const qc = useQueryClient();

  const handleDashboardUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    qc.invalidateQueries({ queryKey: ['finance-manager', 'summary'] });
  }, [qc]);

  const handleInvoiceUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['dashboard', 'invoices'] });
    qc.invalidateQueries({ queryKey: ['finance-manager', 'queue'] });
    qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  }, [qc]);

  const handleProcessingUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['processing-invoices'] });
  }, [qc]);

  useSSE('dashboard_updated', handleDashboardUpdate);
  useSSE('invoice_status_changed', handleInvoiceUpdate);
  useSSE('processing_updated', handleProcessingUpdate);
  useSSE('invoice_updated', handleInvoiceUpdate);
};
