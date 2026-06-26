import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../utils/cn';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
} from '../hooks/useNotifications';
import type { NotificationItem } from '../types/notification.types';

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const groupByDate = (items: NotificationItem[]) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const groups: { label: string; items: NotificationItem[] }[] = [];
  const todayItems = items.filter((n) => new Date(n.created_at).toDateString() === today);
  const yesterdayItems = items.filter(
    (n) => new Date(n.created_at).toDateString() === yesterday,
  );
  const olderItems = items.filter((n) => {
    const d = new Date(n.created_at).toDateString();
    return d !== today && d !== yesterday;
  });
  if (todayItems.length) groups.push({ label: 'Today', items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems });
  if (olderItems.length) groups.push({ label: 'Older', items: olderItems });
  return groups;
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.is_read).length;
  const groups = groupByDate(items);

  const handleClick = async (notif: NotificationItem) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    if (notif.invoice_id) navigate(`/command-center/invoice/${notif.invoice_id}`);
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-[var(--color-border)] rounded-lg bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-muted)] mb-4">
              <Bell className="h-6 w-6 text-[var(--color-muted-foreground)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">No notifications</p>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              You're all caught up. Notifications will appear here when there's activity.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
            {groups.map((group, gi) => (
              <div key={group.label}>
                <div
                  className={cn(
                    'sticky top-0 bg-[var(--color-muted)] px-6 py-2 border-b border-[var(--color-border)]',
                    gi > 0 && 'border-t',
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    {group.label}
                  </p>
                </div>
                {group.items.map((notif) => (
                  <button
                    key={notif.id}
                    className={cn(
                      'w-full text-left px-6 py-4 border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-muted)]',
                      !notif.is_read && 'bg-blue-50/40',
                    )}
                    onClick={() => handleClick(notif)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex-shrink-0 mt-1.5 h-2 w-2 rounded-full',
                          notif.is_read ? 'bg-transparent' : 'bg-[var(--color-primary)]',
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <p
                            className={cn(
                              'text-sm leading-snug',
                              notif.is_read
                                ? 'text-[var(--color-muted-foreground)]'
                                : 'text-[var(--color-foreground)] font-medium',
                            )}
                          >
                            {notif.title}
                          </p>
                          <span className="flex-shrink-0 text-xs text-[var(--color-muted-foreground)]">
                            {relativeTime(notif.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
