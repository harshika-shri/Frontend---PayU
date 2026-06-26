import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatRoleLabel } from '../../auth/utils/formatRoleLabel';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Shield, User, Info, Wifi } from 'lucide-react';
import { useSSEConnection } from '../../../hooks/useSSEConnection';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
    <span className="text-sm text-[var(--color-muted-foreground)] flex-shrink-0 w-36">{label}</span>
    <span className="text-sm text-[var(--color-foreground)] text-right">{value}</span>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { role, userId } = useAuth();
  const sseStatus = useSSEConnection();

  const sseLabel: Record<typeof sseStatus, string> = {
    connected: 'Connected',
    connecting: 'Connecting…',
    disconnected: 'Disconnected',
    error: 'Error',
  };

  const sseBadge: Record<typeof sseStatus, 'success' | 'warning' | 'secondary' | 'destructive'> = {
    connected: 'success',
    connecting: 'warning',
    disconnected: 'secondary',
    error: 'destructive',
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account information and application preferences."
      />

      <div className="max-w-lg space-y-5">
        {/* Account */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Account
            </h2>
          </div>
          <div>
            <Field
              label="User ID"
              value={
                <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                  {userId ?? '—'}
                </span>
              }
            />
            <Field
              label="Role"
              value={
                <Badge variant="secondary">{formatRoleLabel(role)}</Badge>
              }
            />
          </div>
        </Card>

        {/* Permissions */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Permissions
            </h2>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Your access permissions are determined by your assigned role and are managed
            by your system administrator. Contact your admin to request changes.
          </p>
        </Card>

        {/* Connection */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Live Connection
            </h2>
          </div>
          <div>
            <Field
              label="SSE Status"
              value={
                <Badge variant={sseBadge[sseStatus]} dot>
                  {sseLabel[sseStatus]}
                </Badge>
              }
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            The live connection provides real-time dashboard updates, notification delivery,
            and invoice status changes without requiring manual page refreshes.
          </p>
        </Card>

        {/* About */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              About
            </h2>
          </div>
          <div>
            <Field label="Application" value="PayU Finance Platform" />
            <Field label="Version" value="1.0.0" />
            <Field label="Environment" value={import.meta.env.MODE ?? 'production'} />
          </div>
        </Card>
      </div>
    </div>
  );
};
