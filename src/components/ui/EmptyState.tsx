import React from 'react';
import { cn } from '../../utils/cn';
import { InboxIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 py-16 text-center',
      className,
    )}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)]">
      {icon || <InboxIcon className="h-6 w-6 text-[var(--color-muted-foreground)]" />}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">{description}</p>
      )}
    </div>
    {action && (
      <Button size="sm" variant="outline" onClick={action.onClick} className="mt-1">
        {action.label}
      </Button>
    )}
  </div>
);
