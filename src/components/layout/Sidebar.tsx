import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Activity,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  Users,
  Mail,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { UserRole } from '../../features/auth/constants/userRole';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: '/dashboard',
      },
    ],
  },
  {
    label: 'Document Intake',
    items: [
      {
        label: 'Purchase Orders',
        icon: <FileText className="h-4 w-4" />,
        href: '/purchase-orders',
        roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
      },
      {
        label: 'Invoice Upload',
        icon: <Upload className="h-4 w-4" />,
        href: '/invoices/upload',
        roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
      },
      {
        label: 'Invoice Processing',
        icon: <Activity className="h-4 w-4" />,
        href: '/invoices/processing',
        roles: [UserRole.FINANCE_MANAGER],
      },
    ],
  },
  {
    label: 'Extraction',
    items: [
      {
        label: 'Extraction Review',
        icon: <ClipboardCheck className="h-4 w-4" />,
        href: '/extraction-review',
        roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
      },
    ],
  },
  {
    label: 'Workflow',
    items: [
      {
        label: 'Finance Associate',
        icon: <Landmark className="h-4 w-4" />,
        href: '/finance/associate',
        roles: [UserRole.FINANCE_ASSOCIATE, UserRole.FINANCE_MANAGER],
      },
      {
        label: 'Finance Manager',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/finance/manager',
        roles: [UserRole.FINANCE_MANAGER],
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Mail Monitoring',
        icon: <Mail className="h-4 w-4" />,
        href: '/mail-monitoring',
        roles: [UserRole.FINANCE_MANAGER],
      },
      {
        label: 'Notifications',
        icon: <Bell className="h-4 w-4" />,
        href: '/notifications',
      },
      {
        label: 'Reports',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/reports',
        roles: [UserRole.FINANCE_MANAGER],
      },
      {
        label: 'User Management',
        icon: <Users className="h-4 w-4" />,
        href: '/admin/users',
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        href: '/settings',
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { role } = useAuth();

  const isVisible = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return role ? item.roles.includes(role) : false;
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[var(--color-sidebar)] transition-all duration-200 ease-in-out flex-shrink-0',
        'border-r border-[var(--color-sidebar-border)]',
        collapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-[var(--color-sidebar-border)] flex-shrink-0 overflow-hidden',
          collapsed ? 'justify-center px-0' : 'px-4 gap-2',
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-primary)] flex-shrink-0">
          <span className="text-xs font-bold text-white">P</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-tight whitespace-nowrap overflow-hidden">
            PayU Finance
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(isVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {group.label}
                </p>
              )}
              {collapsed && (
                <div className="mx-2 mb-1 h-px bg-[var(--color-sidebar-border)]" />
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/extraction-review'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 mx-2 px-2 py-2 rounded text-xs font-medium transition-colors',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-hover)] hover:text-white',
                    )
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-1/2 -translate-y-1/2 z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'bg-white border border-[var(--color-border)] shadow-sm',
          'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors',
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
};
