import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => (
  <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
    <div className="min-w-0">
      <h1 className="text-xl font-semibold text-[var(--color-foreground)] leading-tight">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
    )}
  </div>
);
