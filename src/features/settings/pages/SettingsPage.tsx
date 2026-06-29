import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatRoleLabel } from '../../auth/utils/formatRoleLabel';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { User, Info } from 'lucide-react';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
    <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
    <span className="text-sm text-[var(--color-foreground)]">{value}</span>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account information and application details."
      />

      <div className="max-w-md space-y-5">
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
              label="Role"
              value={<Badge variant="secondary">{formatRoleLabel(role)}</Badge>}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            Your access permissions are managed by your system administrator. Contact your
            admin to request any role or permission changes.
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
          </div>
        </Card>
      </div>
    </div>
  );
};
