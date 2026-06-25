import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This feature is currently under development and will be available soon.',
}) => (
  <div>
    <PageHeader title={title} description={description} />
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[var(--color-border)] bg-white py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-muted)]">
        <Construction className="h-7 w-7 text-[var(--color-muted-foreground)]" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-[var(--color-foreground)]">Coming Soon</p>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">{description}</p>
      </div>
    </div>
  </div>
);
