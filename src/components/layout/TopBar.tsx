import React, { useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Bell, ChevronDown, KeyRound, LogOut, Mail, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { formatRoleLabel } from '../../features/auth/utils/formatRoleLabel';
import { Breadcrumb } from '../ui/Breadcrumb';
import { NotificationDrawer } from '../../features/notifications/components/NotificationDrawer';
import {
  useNotificationUnreadCount,
  useNotificationSSE,
  useRealtimeUpdates,
} from '../../features/notifications/hooks/useNotifications';
import { UserRole } from '../../features/auth/constants/userRole';
import { getHomeRouteForRole } from '../../features/auth/utils/getHomeRoute';
import { cn } from '../../utils/cn';
import { BrandMark } from '../ui/BrandMark';

// ─── Route meta (breadcrumbs / page titles) ──────────────────────────────────
const routeMeta: Record<string, { title: string; breadcrumbs: { label: string; href?: string }[] }> = {
  '/dashboard': { title: 'Dashboard', breadcrumbs: [{ label: 'Dashboard' }] },
  '/command-center': { title: 'Command Center', breadcrumbs: [{ label: 'Command Center' }] },
  '/command-center/ready-for-approval': {
    title: 'Ready for Approval',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Ready for Approval' }],
  },
  '/command-center/needs-review': {
    title: 'Needs Review',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Needs Review' }],
  },
  '/command-center/escalated': {
    title: 'Escalated',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Escalated' }],
  },
  '/command-center/ready-to-pay': {
    title: 'Approved',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Approved' }],
  },
  '/command-center/rejected': {
    title: 'Rejected',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Rejected' }],
  },
  '/command-center/overdue': {
    title: 'Overdue',
    breadcrumbs: [{ label: 'Command Center', href: '/command-center' }, { label: 'Overdue' }],
  },
  '/purchase-orders': {
    title: 'Purchase Orders',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Purchase Orders' }],
  },
  '/invoices/upload': {
    title: 'Invoice Upload',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Invoice Upload' }],
  },
  '/invoices/processing': {
    title: 'Invoice Processing',
    breadcrumbs: [{ label: 'Documents' }, { label: 'Invoice Processing' }],
  },
  '/extraction-review': {
    title: 'Extraction Review',
    breadcrumbs: [{ label: 'Extraction Review' }],
  },
  '/finance-manager': {
    title: 'Finance Manager',
    breadcrumbs: [{ label: 'Finance Manager' }],
  },
  '/finance-manager/my-escalated': {
    title: 'My Escalated',
    breadcrumbs: [{ label: 'Finance Manager', href: '/finance-manager' }, { label: 'My Escalated' }],
  },
  '/finance-manager/unassigned': {
    title: 'Unassigned Queue',
    breadcrumbs: [{ label: 'Finance Manager', href: '/finance-manager' }, { label: 'Unassigned' }],
  },
  '/finance-manager/my-claimed': {
    title: 'My Claimed',
    breadcrumbs: [{ label: 'Finance Manager', href: '/finance-manager' }, { label: 'My Claimed' }],
  },
  '/finance-manager/rejected': {
    title: 'Rejected',
    breadcrumbs: [{ label: 'Finance Manager', href: '/finance-manager' }, { label: 'Rejected' }],
  },
  '/mail-monitoring': {
    title: 'Mail Monitoring',
    breadcrumbs: [{ label: 'Mail Monitoring' }],
  },
  '/notifications': {
    title: 'Notifications',
    breadcrumbs: [{ label: 'Notifications' }],
  },
  '/reports': { title: 'Reports', breadcrumbs: [{ label: 'Reports' }] },
  '/reports/invoices': {
    title: 'Invoice Processing Report',
    breadcrumbs: [{ label: 'Reports', href: '/reports' }, { label: 'Invoice Processing' }],
  },
  '/reports/finance-associates': {
    title: 'Finance Associate Performance',
    breadcrumbs: [{ label: 'Reports', href: '/reports' }, { label: 'Associate Performance' }],
  },
  '/admin/users': {
    title: 'User Management',
    breadcrumbs: [{ label: 'User Management' }],
  },
  '/settings': { title: 'Settings', breadcrumbs: [{ label: 'Settings' }] },
};

// ─── Nav types ────────────────────────────────────────────────────────────────
interface NavChild {
  label: string;
  href: string;
}

interface NavItemConfig {
  id: string;
  label: string;
  href?: string;
  end?: boolean;
  children?: NavChild[];
  roles?: string[];
  icon?: React.ReactNode;
}

const CC_ROLES = [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER];

const LEFT_NAV: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    end: true,
    roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
  },
  {
    id: 'admin-users',
    label: 'User Management',
    href: '/admin/users',
    end: true,
    roles: [UserRole.ADMIN],
  },
  {
    id: 'command-center',
    label: 'Command Center',
    roles: CC_ROLES,
    children: [
      { label: 'Ready for Approval', href: '/command-center/ready-for-approval' },
      { label: 'Needs Review', href: '/command-center/needs-review' },
      { label: 'Escalated', href: '/command-center/escalated' },
      { label: 'Approved', href: '/command-center/ready-to-pay' },
      { label: 'Rejected', href: '/command-center/rejected' },
      { label: 'Overdue', href: '/command-center/overdue' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    roles: CC_ROLES,
    children: [
      { label: 'Purchase Orders', href: '/purchase-orders' },
      { label: 'Invoice Upload', href: '/invoices/upload' },
      { label: 'Invoice Processing', href: '/invoices/processing' },
    ],
  },
  {
    id: 'extraction-review',
    label: 'Extraction Review',
    href: '/extraction-review',
    end: true,
    roles: CC_ROLES,
  },
  {
    id: 'finance-manager',
    label: 'Finance Manager',
    href: '/finance-manager',
    roles: [UserRole.FINANCE_MANAGER],
    children: [
      { label: 'Overview', href: '/finance-manager' },
      { label: 'My Escalated', href: '/finance-manager/my-escalated' },
      { label: 'Unassigned Queue', href: '/finance-manager/unassigned' },
      { label: 'My Claimed', href: '/finance-manager/my-claimed' },
    ],
  },
];

const RIGHT_NAV: NavItemConfig[] = [
  {
    id: 'mail-monitoring',
    label: 'Mail Monitoring',
    href: '/mail-monitoring',
    roles: [UserRole.FINANCE_MANAGER],
    icon: <Mail className="h-3.5 w-3.5" />,
  },
  {
    id: 'reports',
    label: 'Reports',
    roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    children: [
      { label: 'Invoice Processing', href: '/reports/invoices' },
      { label: 'Associate Performance', href: '/reports/finance-associates' },
    ],
  },
];

// ─── HoverNavItem ─────────────────────────────────────────────────────────────
interface HoverNavItemProps {
  item: NavItemConfig;
  dropdownAlign?: 'left' | 'right';
}

const HoverNavItem: React.FC<HoverNavItemProps> = ({ item, dropdownAlign = 'left' }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const closeMenu = () => {
    timerRef.current = setTimeout(() => setOpen(false), 130);
  };

  const hasChildren = (item.children?.length ?? 0) > 0;

  // A section is "active" if the current path matches the item href or any child href
  const isActive = item.href
    ? item.end
      ? location.pathname === item.href
      : location.pathname === item.href || location.pathname.startsWith(item.href + '/')
    : (item.children?.some(
        (c) => location.pathname === c.href || location.pathname.startsWith(c.href + '/'),
      ) ?? false);

  const triggerCls = cn(
    'flex items-center gap-1.5 px-3.5 h-14 text-sm font-medium transition-all duration-150 whitespace-nowrap select-none relative',
    'text-[var(--color-sidebar-foreground)] hover:text-white',
    isActive
      ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-t'
      : 'hover:bg-white/10',
  );

  const chevron = (
    <ChevronDown
      className={cn(
        'h-3.5 w-3.5 transition-transform duration-150 flex-shrink-0',
        open && 'rotate-180',
      )}
    />
  );

  const triggerContent = (
    <>
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      {item.label}
      {hasChildren && chevron}
    </>
  );

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      {/* Trigger: NavLink if has href, button otherwise */}
      {item.href ? (
        <NavLink to={item.href} end={item.end} className={triggerCls}>
          {triggerContent}
        </NavLink>
      ) : (
        <button className={triggerCls}>
          {triggerContent}
        </button>
      )}

      {/* Dropdown panel */}
      {hasChildren && open && (
        <div
          className={cn(
            'absolute top-full z-50',
            dropdownAlign === 'right' ? 'right-0' : 'left-0',
          )}
          // extend hover area to cover the gap between trigger and panel
          onMouseEnter={openMenu}
          onMouseLeave={closeMenu}
        >
          {/* 4px invisible bridge so mouse can travel from trigger to panel */}
          <div className="h-1" />
          <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-xl py-1.5 min-w-[220px]">
            {item.children!.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                end
                onClick={() => setOpen(false)}
                className={({ isActive: childActive }) =>
                  cn(
                    'flex items-center px-4 py-2.5 text-sm transition-colors',
                    childActive
                      ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium'
                      : 'text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
interface TopBarProps {
  onChangePassword?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onChangePassword }) => {
  const { role, logout } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: countData } = useNotificationUnreadCount();
  const unreadCount = countData?.count ?? 0;
  useNotificationSSE();
  useRealtimeUpdates();

  const isVisible = (item: NavItemConfig): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return role ? item.roles.includes(role) : false;
  };

  const hasAnyRightNav = RIGHT_NAV.some(isVisible);
  const homeRoute = getHomeRouteForRole(role);

  // Resolve current page meta for the breadcrumb strip
  const commandCenterInvoiceMatch = /^\/command-center\/invoice\/[^/]+$/.test(location.pathname);
  const clarificationMatch = /^\/command-center\/invoice\/[^/]+\/clarification$/.test(location.pathname);
  const rejectionMatch = /^\/command-center\/invoice\/[^/]+\/rejection$/.test(location.pathname);
  const extractionReviewMatch = /^\/extraction-review\/[^/]+$/.test(location.pathname);

  const meta =
    routeMeta[location.pathname] ??
    (clarificationMatch
      ? {
          title: 'Request Clarification',
          breadcrumbs: [
            { label: 'Command Center', href: '/command-center' },
            { label: 'Invoice Review' },
            { label: 'Clarification' },
          ],
        }
      : rejectionMatch
      ? {
          title: 'Reject Invoice',
          breadcrumbs: [
            { label: 'Command Center', href: '/command-center' },
            { label: 'Invoice Review' },
            { label: 'Rejection' },
          ],
        }
      : commandCenterInvoiceMatch
      ? {
          title: 'Invoice Review',
          breadcrumbs: [
            { label: 'Command Center', href: '/command-center' },
            { label: 'Invoice Review' },
          ],
        }
      : extractionReviewMatch
      ? {
          title: 'Review Extraction',
          breadcrumbs: [
            { label: 'Extraction Review', href: '/extraction-review' },
            { label: 'Review' },
          ],
        }
      : { title: 'PayU Finance', breadcrumbs: [{ label: 'Home' }] });

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
    <header className="flex flex-col flex-shrink-0">
      {/* ── Primary navigation bar ─────────────────────────────────────────── */}
      <div className="h-14 bg-[var(--color-sidebar)] flex items-center px-4 gap-x-1">
        {/* Logo */}
        <Link
          to={homeRoute}
          className="flex items-center mr-3 flex-shrink-0 group"
        >
          <BrandMark size="sm" variant="light" />
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-[var(--color-sidebar-border)] mr-1 flex-shrink-0" />

        {/* Left nav items */}
        <nav className="flex items-center h-full flex-1 min-w-0 overflow-visible">
          {LEFT_NAV.filter(isVisible).map((item) => (
            <HoverNavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Right nav items */}
        {hasAnyRightNav && (
          <>
            <div className="h-5 w-px bg-[var(--color-sidebar-border)] mx-1 flex-shrink-0" />
            <nav className="flex items-center h-full flex-shrink-0 overflow-visible">
              {RIGHT_NAV.filter(isVisible).map((item) => (
                <HoverNavItem key={item.id} item={item} dropdownAlign="right" />
              ))}
            </nav>
          </>
        )}

        {/* Divider before actions */}
        <div className="h-5 w-px bg-[var(--color-sidebar-border)] mx-2 flex-shrink-0" />

        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(true)}
          aria-label="Open notifications"
          className={cn(
            'relative h-8 w-8 flex items-center justify-center rounded transition-colors flex-shrink-0',
            'text-[var(--color-sidebar-foreground)] hover:text-white hover:bg-white/10',
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold text-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

        {/* User dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 h-8 pl-2 pr-2 ml-1 rounded hover:bg-white/10 transition-colors outline-none flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-white">{initials}</span>
              </div>
              <span className="hidden sm:block text-xs font-medium text-[var(--color-sidebar-foreground)]">
                {formatRoleLabel(role)}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-white shadow-lg p-1"
              align="end"
              sideOffset={8}
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

      {/* ── Breadcrumb / page-title strip ──────────────────────────────────── */}
      <div className="h-8 bg-white border-b border-[var(--color-border)] flex items-center px-4 flex-shrink-0">
        <Breadcrumb items={meta.breadcrumbs} />
      </div>
    </header>
  );
};
