import React from 'react';
import { User, Shield, CheckCircle2, XCircle } from 'lucide-react';
import type { UserResponse } from '../types/user.types';
import { formatRoleLabel } from '../../auth/utils/formatRoleLabel';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';

interface UserListProps {
  users: UserResponse[];
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
  if (users.length === 0) {
    return (
      <Card noPadding>
        <EmptyState
          title="No users found"
          description="Onboard a finance associate or manager to get started."
        />
      </Card>
    );
  }

  return (
    <Card noPadding className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-muted)] border-b border-[var(--color-border)]">
              <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[var(--color-muted)]/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-[var(--color-muted)] rounded-full flex items-center justify-center text-[var(--color-muted-foreground)]">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--color-foreground)]">
                        {user.name}
                      </div>
                      <div className="text-sm text-[var(--color-muted-foreground)]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="gap-1.5 rounded-md px-2.5 py-1">
                    <Shield className="w-3 h-3" />
                    {formatRoleLabel(user.role)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success-muted-foreground)] font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] font-medium">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(user.id, user.is_active)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 ${
                      user.is_active
                        ? 'bg-[var(--color-success)]'
                        : 'bg-[var(--color-border)]'
                    }`}
                    role="switch"
                    aria-checked={user.is_active}
                    aria-label={`${user.is_active ? 'Deactivate' : 'Activate'} ${user.name}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        user.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
