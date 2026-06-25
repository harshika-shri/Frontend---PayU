import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 text-sm',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-xs)]',
        secondary:
          'bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-slate-200 border border-[var(--color-border)]',
        outline:
          'border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:bg-[var(--color-muted)] hover:border-slate-300',
        ghost:
          'text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
        destructive:
          'bg-[var(--color-destructive)] text-white hover:bg-red-700 shadow-[var(--shadow-xs)]',
        success:
          'bg-[var(--color-success)] text-white hover:bg-green-700 shadow-[var(--shadow-xs)]',
        link:
          'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4',
        lg: 'h-10 px-6 text-base',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
