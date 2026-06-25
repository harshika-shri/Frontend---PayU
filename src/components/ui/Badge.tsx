import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-none ring-1 ring-inset',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-primary-muted)] text-[var(--color-primary)] ring-blue-200',
        secondary:
          'bg-slate-100 text-slate-600 ring-slate-200',
        success:
          'bg-[var(--color-success-muted)] text-[var(--color-success-muted-foreground)] ring-green-200',
        warning:
          'bg-[var(--color-warning-muted)] text-[var(--color-warning-muted-foreground)] ring-amber-200',
        destructive:
          'bg-[var(--color-destructive-muted)] text-[var(--color-destructive-muted-foreground)] ring-red-200',
        info:
          'bg-[var(--color-info-muted)] text-[var(--color-info-muted-foreground)] ring-sky-200',
        outline:
          'bg-transparent text-[var(--color-foreground)] ring-[var(--color-border)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, dot, children, ...props }) => {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-[var(--color-success)]',
            variant === 'warning' && 'bg-[var(--color-warning)]',
            variant === 'destructive' && 'bg-[var(--color-destructive)]',
            variant === 'info' && 'bg-[var(--color-info)]',
            variant === 'default' && 'bg-[var(--color-primary)]',
            variant === 'secondary' && 'bg-slate-400',
            variant === 'outline' && 'bg-slate-400',
          )}
        />
      )}
      {children}
    </span>
  );
};
