import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCheck, Bell } from 'lucide-react';
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

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleClick = async (notif: NotificationItem) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    onClose();
    if (notif.invoice_id) {
      navigate(`/command-center/invoice/${notif.invoice_id}`);
    }
  };

  const items = data?.items ?? [];
  const groups = groupByDate(items);
  const unread = items.filter((n) => !n.is_read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[360px] bg-white shadow-xl border-l border-[var(--color-border)] flex flex-col',
          'transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Notifications</h2>
            {unread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[var(--color-muted-foreground)]"
                onClick={() => markAll.mutate()}
                loading={markAll.isPending}
                leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              >
                Mark all read
              </Button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)] mb-3">
                <Bell className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">All caught up</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                No notifications to display right now.
              </p>
            </div>
          ) : (
            <div>
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 bg-[var(--color-muted)] border-b border-[var(--color-border)] px-5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                      {group.label}
                    </p>
                  </div>
                  {group.items.map((notif) => (
                    <button
                      key={notif.id}
                      className={cn(
                        'w-full text-left px-5 py-4 border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-muted)]',
                        !notif.is_read && 'bg-blue-50/40',
                      )}
                      onClick={() => handleClick(notif)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full',
                            notif.is_read ? 'bg-transparent' : 'bg-[var(--color-primary)]',
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm leading-snug',
                              notif.is_read
                                ? 'text-[var(--color-muted-foreground)] font-normal'
                                : 'text-[var(--color-foreground)] font-medium',
                            )}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)] leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="mt-1.5 text-[10px] text-[var(--color-muted-foreground)]">
                            {relativeTime(notif.created_at)}
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
    </>
  );
};
