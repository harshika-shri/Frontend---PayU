import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-foreground)]"
          >
            {label}
            {props.required && <span className="text-[var(--color-destructive)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center text-[var(--color-muted-foreground)] pointer-events-none">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-9 w-full rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] shadow-[var(--shadow-xs)] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-0 focus:border-[var(--color-primary)]',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-muted)]',
              'read-only:bg-[var(--color-muted)] read-only:cursor-default',
              error && 'border-[var(--color-destructive)] focus:ring-[var(--color-destructive)]',
              leftElement && 'pl-9',
              rightElement && 'pr-9',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-[var(--color-muted-foreground)]">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-destructive)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
