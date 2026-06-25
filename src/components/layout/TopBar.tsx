import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, LogOut, Settings, KeyRound, Search } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { formatRoleLabel } from '../../features/auth/utils/formatRoleLabel';
import { Breadcrumb } from '../ui/Breadcrumb';

const routeMeta: Record<string, { title: string; breadcrumbs: { label: string; href?: string }[] }> = {
  '/dashboard': {
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard' }],
  },
  '/purchase-orders': {
    title: 'Purchase Orders',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Purchase Orders' }],
  },
  '/invoices/upload': {
    title: 'Invoice Upload',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Invoice Upload' }],
  },
  '/extraction-review': {
    title: 'Extraction Review',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Extraction Review' }],
  },
  '/finance/associate': {
    title: 'Finance Associate',
    breadcrumbs: [{ label: 'Workflow' }, { label: 'Finance Associate' }],
  },
  '/finance/manager': {
    title: 'Finance Manager',
    breadcrumbs: [{ label: 'Workflow' }, { label: 'Finance Manager' }],
  },
  '/mail-monitoring': {
    title: 'Mail Monitoring',
    breadcrumbs: [{ label: 'System' }, { label: 'Mail Monitoring' }],
  },
  '/notifications': {
    title: 'Notifications',
    breadcrumbs: [{ label: 'System' }, { label: 'Notifications' }],
  },
  '/reports': {
    title: 'Reports',
    breadcrumbs: [{ label: 'System' }, { label: 'Reports' }],
  },
  '/admin/users': {
    title: 'User Management',
    breadcrumbs: [{ label: 'Admin' }, { label: 'User Management' }],
  },
  '/settings': {
    title: 'Settings',
    breadcrumbs: [{ label: 'Account' }, { label: 'Settings' }],
  },
};

interface TopBarProps {
  onChangePassword?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onChangePassword }) => {
  const { role, logout } = useAuth();
  const location = useLocation();

  const meta = routeMeta[location.pathname] ?? {
    title: 'PayU Finance',
    breadcrumbs: [{ label: 'Home' }],
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const initials = formatRoleLabel(role ?? null)
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-[var(--color-border)] flex-shrink-0">
      {/* Left: title + breadcrumb */}
      <div className="flex flex-col justify-center min-w-0">
        <Breadcrumb items={meta.breadcrumbs} />
        <h1 className="text-sm font-semibold text-[var(--color-foreground)] leading-tight truncate">
          {meta.title}
        </h1>
      </div>

      {/* Right: search, bell, user */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search placeholder */}
        <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded border border-[var(--color-border)] bg-[var(--color-muted)] text-xs text-[var(--color-muted-foreground)] hover:bg-slate-100 transition-colors min-w-[160px]">
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Search…</span>
          <kbd className="ml-auto font-mono text-[10px] bg-white border border-[var(--color-border)] px-1 rounded">⌘K</kbd>
        </button>

        {/* Notification bell */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
        </button>

        {/* User dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 h-8 pl-1 pr-2 rounded hover:bg-[var(--color-muted)] transition-colors outline-none">
              <div className="h-6 w-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-[10px] font-semibold text-white">{initials}</span>
              </div>
              <span className="hidden sm:block text-xs font-medium text-[var(--color-foreground)]">
                {formatRoleLabel(role)}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-white shadow-lg p-1"
              align="end"
              sideOffset={6}
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-xs text-[var(--color-muted-foreground)]">
                {formatRoleLabel(role)}
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded text-[var(--color-foreground)] outline-none cursor-default hover:bg-[var(--color-muted)] transition-colors"
                onSelect={onChangePassword}
              >
                <KeyRound className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                Change Password
              </DropdownMenu.Item>

              <Link to="/settings">
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-sm rounded text-[var(--color-foreground)] outline-none cursor-default hover:bg-[var(--color-muted)] transition-colors">
                  <Settings className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                  Settings
                </DropdownMenu.Item>
              </Link>

              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded text-[var(--color-destructive)] outline-none cursor-default hover:bg-[var(--color-destructive-muted)] transition-colors"
                onSelect={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};
